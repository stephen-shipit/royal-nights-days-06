import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyPaymentRequest {
  sessionId: string;
  reservationId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, reservationId }: VerifyPaymentRequest = await req.json();

    console.log("Verifying payment for session:", sessionId);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create Supabase client for service operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    console.log("Stripe session status:", session.payment_status);

    // Update reservation status based on payment status
    const paymentStatus = session.payment_status === "paid" ? "confirmed" : "failed";
    const reservationStatus = session.payment_status === "paid" ? "confirmed" : "cancelled";

    // Update reservation
    const { error: reservationError } = await supabase
      .from("table_reservations")
      .update({
        status: reservationStatus,
        payment_status: paymentStatus,
      })
      .eq("id", reservationId);

    if (reservationError) {
      console.error("Error updating reservation:", reservationError);
      throw new Error("Failed to update reservation");
    }

    // Update payment record
    const { error: paymentError } = await supabase
      .from("payments")
      .update({
        status: paymentStatus,
      })
      .eq("stripe_session_id", sessionId);

    if (paymentError) {
      console.error("Error updating payment:", paymentError);
      throw new Error("Failed to update payment");
    }

    // If payment was successful, send confirmation email
    if (session.payment_status === "paid") {
      try {
        const { error: emailError } = await supabase.functions.invoke('send-reservation-email', {
          body: { reservationId, sessionId }
        });

        if (emailError) {
          console.error("Error sending confirmation email:", emailError);
          // Don't fail the whole operation if email fails
        }
      } catch (emailError) {
        console.error("Error invoking email function:", emailError);
      }
    }

    console.log("Payment verification completed successfully");

    return new Response(JSON.stringify({ 
      status: paymentStatus,
      reservationStatus,
      amount: session.amount_total,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in verify-payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});