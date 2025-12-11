import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  membershipLevelId: string;
  fullName: string;
  email: string;
  phone: string | null;
  password?: string;
  durationMonths?: number;
  calculatedPrice?: number;
}

// Generate a secure random token
function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(32);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < 32; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { membershipLevelId, fullName, email, phone, password, durationMonths, calculatedPrice }: PaymentRequest = await req.json();

    console.log("Creating membership payment for:", email, "duration:", durationMonths);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get membership level details
    const { data: level, error: levelError } = await supabase
      .from("membership_levels")
      .select("*")
      .eq("id", membershipLevelId)
      .eq("status", "active")
      .single();

    if (levelError || !level) {
      console.error("Level not found:", levelError);
      throw new Error("Membership level not found or inactive");
    }

    // Use provided duration or default to level's duration
    const effectiveDuration = durationMonths || level.duration_months;
    const effectivePrice = calculatedPrice || level.price;

    // Calculate expiration date based on effective duration
    let expirationDate: Date;
    if (effectiveDuration === 0) {
      expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 100);
    } else {
      expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + effectiveDuration);
    }

    // Generate unique QR token
    const qrToken = generateToken();

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create or get customer
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create Stripe checkout session
    const durationText = effectiveDuration === 0 ? 'Lifetime' : effectiveDuration === 1 ? '1 month' : `${effectiveDuration} month`;
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${level.name} VIP Membership`,
              description: `${durationText} VIP membership at Royal Palace DTX`,
            },
            unit_amount: effectivePrice,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      allow_promotion_codes: true,
      billing_address_collection: "required",
      success_url: `${req.headers.get("origin")}/vip-payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/vip-memberships/${membershipLevelId}`,
      metadata: {
        membershipLevelId,
        fullName,
        email,
        phone: phone || "",
        qrToken,
        expirationDate: expirationDate.toISOString(),
        maxDailyScans: level.max_daily_scans.toString(),
        userPassword: password ? btoa(password) : "", // Base64 encode password for transport
      },
    });

    // Create pending membership record with amount_paid
    const { error: insertError } = await supabase.from("memberships").insert({
      membership_level_id: membershipLevelId,
      full_name: fullName,
      email: email.toLowerCase(),
      phone,
      qr_code_token: qrToken,
      expiration_date: expirationDate.toISOString(),
      remaining_daily_scans: level.max_daily_scans,
      active: false, // Will be activated after payment
      payment_status: "pending",
      stripe_session_id: session.id,
      amount_paid: effectivePrice, // Track the actual amount paid
    });

    if (insertError) {
      console.error("Failed to create membership record:", insertError);
      throw new Error("Failed to create membership record");
    }

    console.log("Payment session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error creating membership payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
