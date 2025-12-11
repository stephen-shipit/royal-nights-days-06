import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RenewalRequest {
  membershipId: string;
  durationMonths: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { membershipId, durationMonths }: RenewalRequest = await req.json();

    console.log("Creating renewal payment for membership:", membershipId, "duration:", durationMonths);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get existing membership with level details
    const { data: membership, error: membershipError } = await supabase
      .from("memberships")
      .select("*, membership_levels(*)")
      .eq("id", membershipId)
      .single();

    if (membershipError || !membership) {
      console.error("Membership not found:", membershipError);
      throw new Error("Membership not found");
    }

    const level = membership.membership_levels;
    if (!level || level.status !== "active") {
      throw new Error("Membership level not found or inactive");
    }

    // Calculate price based on duration
    let pricePerMonth = level.price / (level.duration_months || 12);
    let premiumPercentage = 0;

    if (durationMonths === 1) {
      premiumPercentage = level.premium_1_month || 20;
    } else if (durationMonths === 2) {
      premiumPercentage = level.premium_2_months || 15;
    } else if (durationMonths === 3) {
      premiumPercentage = level.premium_3_months || 10;
    }

    const basePrice = pricePerMonth * durationMonths;
    const calculatedPrice = Math.round(basePrice * (1 + premiumPercentage / 100));

    // Calculate new expiration date
    const currentExpiration = new Date(membership.expiration_date);
    const now = new Date();
    const startDate = currentExpiration > now ? currentExpiration : now;
    const newExpirationDate = new Date(startDate);
    newExpirationDate.setMonth(newExpirationDate.getMonth() + durationMonths);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create or get customer
    const customers = await stripe.customers.list({ email: membership.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create Stripe checkout session
    const durationText = durationMonths === 1 ? '1 month' : `${durationMonths} months`;
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : membership.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${level.name} VIP Membership Renewal`,
              description: `${durationText} renewal at Royal Palace DTX`,
            },
            unit_amount: calculatedPrice,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      allow_promotion_codes: true,
      billing_address_collection: "required",
      success_url: `${req.headers.get("origin")}/vip-renewal-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/vip-card/${membership.qr_code_token}`,
      metadata: {
        membershipId,
        renewalType: "true",
        durationMonths: durationMonths.toString(),
        newExpirationDate: newExpirationDate.toISOString(),
      },
    });

    console.log("Renewal payment session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error creating renewal payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
