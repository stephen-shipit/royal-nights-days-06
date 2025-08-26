import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyPaymentRequest {
  sessionId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId }: VerifyPaymentRequest = await req.json();

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

    // Update payment status based on payment status
    const paymentStatus = session.payment_status === "paid" ? "confirmed" : "failed";
    
    if (session.payment_status === "paid") {
      // Payment successful - create the reservation now
      const metadata = session.metadata;
      const totalAmount = ((parseInt(metadata.tablePrice) || 0) * 100) + (metadata.birthdayPackage === 'true' ? 5000 : 0) + (metadata.screenDisplay === 'true' ? 5000 : 0);
      
      // Create the confirmed reservation - since this went through payment, it's nightlife
      const { data: reservation, error: reservationError } = await supabase
        .from("table_reservations")
        .insert({
          event_id: metadata.eventId,
          table_id: metadata.tableId,
          guest_name: metadata.guestName,
          guest_email: metadata.guestEmail,
          guest_phone: metadata.guestPhone,
          guest_count: parseInt(metadata.guestCount),
          special_requests: metadata.specialRequests,
          birthday_package: metadata.birthdayPackage === 'true',
          screen_display_image_url: metadata.screenDisplayImageUrl || null,
          total_price: totalAmount,
          stripe_session_id: sessionId,
          status: "confirmed",
          payment_status: "confirmed",
          reservation_type: "nightlife", // Paid reservations are always nightlife
          time_slot: "9pm-5am" // Nightlife time slot
        })
        .select()
        .single();

      if (reservationError) {
        console.error("Error creating reservation:", reservationError);
        throw new Error("Failed to create reservation");
      }

      // Create payment record
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          reservation_id: reservation.id,
          stripe_session_id: sessionId,
          amount: totalAmount,
          status: paymentStatus,
        });

      if (paymentError) {
        console.error("Error creating payment record:", paymentError);
        throw new Error("Failed to create payment record");
      }

      // Send confirmation email
      try {
        const { error: emailError } = await supabase.functions.invoke('send-reservation-email', {
          body: { reservationId: reservation.id, sessionId }
        });

        if (emailError) {
          console.error("Error sending confirmation email:", emailError);
          // Don't fail the whole operation if email fails
        }
      } catch (emailError) {
        console.error("Error invoking email function:", emailError);
      }

      console.log("Payment verification and reservation creation completed successfully");

      return new Response(JSON.stringify({ 
        status: paymentStatus,
        reservationId: reservation.id,
        amount: session.amount_total,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      // Payment failed - no reservation created
      console.log("Payment failed, no reservation created");
      
      // Send payment failure notification emails
      try {
        const metadata = session.metadata;
        const totalAmount = ((parseInt(metadata.tablePrice) || 0) * 100) + (metadata.birthdayPackage === 'true' ? 5000 : 0) + (metadata.screenDisplay === 'true' ? 5000 : 0);
        
        const { error: failureEmailError } = await supabase.functions.invoke('send-payment-failure-email', {
          body: { 
            sessionId,
            guestEmail: metadata.guestEmail,
            guestName: metadata.guestName,
            eventTitle: metadata.eventTitle || 'Event',
            eventDate: metadata.eventDate || new Date().toISOString(),
            eventTime: metadata.eventTime || 'TBD',
            totalAmount,
            failureReason: session.payment_status === 'unpaid' ? 'Payment was not completed' : 'Payment processing failed'
          }
        });

        if (failureEmailError) {
          console.error("Error sending payment failure email:", failureEmailError);
          // Don't fail the whole operation if email fails
        }
      } catch (emailError) {
        console.error("Error invoking payment failure email function:", emailError);
      }
      
      return new Response(JSON.stringify({ 
        status: paymentStatus,
        amount: session.amount_total,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    console.error("Error in verify-payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});