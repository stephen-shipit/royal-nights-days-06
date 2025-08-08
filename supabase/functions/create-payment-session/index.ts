import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  reservationId: string;
  eventId: string;
  tableId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCount: number;
  specialRequests?: string;
  birthdayPackage: boolean;
  tablePrice: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      reservationId,
      eventId,
      tableId,
      guestName,
      guestEmail,
      guestPhone,
      guestCount,
      specialRequests,
      birthdayPackage,
      tablePrice
    }: PaymentRequest = await req.json();

    console.log("Creating payment session for reservation:", reservationId);

    // Create Supabase client for service operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Clean up expired reservations before processing
    await supabase.rpc('cleanup_expired_reservations');

    // Verify the reservation still exists and is valid
    const { data: reservation, error: reservationCheckError } = await supabase
      .from('table_reservations')
      .select('*')
      .eq('id', reservationId)
      .eq('status', 'pending')
      .single();

    if (reservationCheckError || !reservation) {
      console.error('Reservation not found or invalid:', reservationCheckError);
      throw new Error('Reservation not found or has expired');
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });


    // Calculate total amount
    const birthdayPackagePrice = birthdayPackage ? 5000 : 0; // $50 in cents
    const totalAmount = tablePrice + birthdayPackagePrice;

    // Create line items
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Table Reservation",
            description: `Table reservation for ${guestCount} guests`,
          },
          unit_amount: tablePrice,
        },
        quantity: 1,
      },
    ];

    if (birthdayPackage) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Birthday Shoutout Package",
            description: "Includes MC shoutout, screen display, sparklers, lights, and name sign",
          },
          unit_amount: 5000, // $50 in cents
        },
        quantity: 1,
      });
    }

    // Check if customer exists
    const customers = await stripe.customers.list({ email: guestEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : guestEmail,
      line_items: lineItems,
      mode: "payment",
      allow_promotion_codes: true, // Enable coupon codes
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
      customer_update: customerId ? {
        name: "auto",
        address: "auto",
      } : undefined,
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}&reservation_id=${reservationId}`,
      cancel_url: `${req.headers.get("origin")}/payment-cancelled?reservation_id=${reservationId}`,
      metadata: {
        reservationId,
        eventId,
        tableId,
      },
    });

    // Update reservation with Stripe session ID
    const { error: updateError } = await supabase
      .from("table_reservations")
      .update({
        stripe_session_id: session.id,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        guest_count: guestCount,
        special_requests: specialRequests,
        birthday_package: birthdayPackage,
        total_price: totalAmount,
      })
      .eq("id", reservationId);

    if (updateError) {
      console.error("Error updating reservation:", updateError);
      throw new Error("Failed to update reservation");
    }

    // Create payment record
    const { error: paymentError } = await supabase
      .from("payments")
      .insert({
        reservation_id: reservationId,
        stripe_session_id: session.id,
        amount: totalAmount,
        status: "pending",
      });

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      throw new Error("Failed to create payment record");
    }

    console.log("Payment session created successfully:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in create-payment-session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});