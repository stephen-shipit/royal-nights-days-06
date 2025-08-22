import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentFailureRequest {
  sessionId: string;
  guestEmail: string;
  guestName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  totalAmount: number;
  failureReason?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      sessionId, 
      guestEmail, 
      guestName, 
      eventTitle, 
      eventDate, 
      eventTime, 
      totalAmount,
      failureReason 
    }: PaymentFailureRequest = await req.json();

    console.log("Sending payment failure email for session:", sessionId);

    // Create Supabase client for service operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get admin notification emails
    const { data: adminEmails, error: adminEmailsError } = await supabase
      .from("notification_settings")
      .select("email")
      .eq("notification_type", "reservation_confirmed")
      .eq("is_active", true);

    if (adminEmailsError) {
      console.error("Error fetching admin notification emails:", adminEmailsError);
    }

    // Guest payment failure email content
    const guestEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
        <div style="background-color: #dc2626; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Payment Could Not Be Processed</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; color: #333; margin-bottom: 20px;">
            Dear ${guestName},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            We're sorry to inform you that your payment for the table reservation could not be processed successfully. Your reservation has not been confirmed at this time.
          </p>
          
          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1a1a1a; margin-top: 0;">Attempted Reservation Details</h2>
            
            <div style="display: grid; gap: 10px;">
              <p style="margin: 5px 0;"><strong>Event:</strong> ${eventTitle}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${eventTime}</p>
              <p style="margin: 5px 0;"><strong>Amount:</strong> $${(totalAmount / 100).toFixed(2)}</p>
              ${failureReason ? `<p style="margin: 5px 0;"><strong>Issue:</strong> ${failureReason}</p>` : ''}
            </div>
          </div>
          
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0; color: #991b1b;">
              <strong>What happened?</strong><br>
              Your payment could not be processed. This could be due to insufficient funds, an expired card, or a temporary issue with your payment method.
            </p>
          </div>
          
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
            <p style="margin: 0; color: #0c4a6e;">
              <strong>What can you do?</strong><br>
              • Check your payment method details and try again<br>
              • Contact your bank if you believe this is an error<br>
              • Try a different payment method<br>
              • Contact us directly for assistance
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://royalpalacedtx.com/events" style="display: inline-block; background-color: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Try Again
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666; font-size: 14px;">
              Need help? We're here for you!<br>
              Email: reservations@royalpalacedtx.email | Phone: (555) 123-4567
            </p>
          </div>
        </div>
      </div>
    `;

    // Admin notification email content
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
        <div style="background-color: #dc2626; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Payment Failure Alert</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            <strong>A reservation payment attempt has failed.</strong>
          </p>
          
          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1a1a1a; margin-top: 0;">Failed Reservation Details</h2>
            
            <div style="display: grid; gap: 8px;">
              <p style="margin: 3px 0;"><strong>Guest Name:</strong> ${guestName}</p>
              <p style="margin: 3px 0;"><strong>Email:</strong> ${guestEmail}</p>
              <p style="margin: 3px 0;"><strong>Event:</strong> ${eventTitle}</p>
              <p style="margin: 3px 0;"><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p style="margin: 3px 0;"><strong>Time:</strong> ${eventTime}</p>
              <p style="margin: 3px 0;"><strong>Amount:</strong> $${(totalAmount / 100).toFixed(2)}</p>
              ${failureReason ? `<p style="margin: 3px 0;"><strong>Failure Reason:</strong> ${failureReason}</p>` : ''}
              <p style="margin: 3px 0;"><strong>Stripe Session:</strong> ${sessionId}</p>
            </div>
          </div>
          
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b;"><strong>Payment Status:</strong> Failed</p>
            <p style="margin: 5px 0 0 0; color: #991b1b; font-size: 14px;">No reservation was created due to payment failure.</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-radius: 8px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Follow-up Recommended:</strong> You may want to contact this guest to offer assistance or alternative payment options.
            </p>
          </div>
        </div>
      </div>
    `;

    const emailPromises = [];

    // Send guest failure notification email
    emailPromises.push(
      resend.emails.send({
        from: "Royal Palace Reservations <reservations@royalpalacedtx.email>",
        to: [guestEmail],
        subject: `Payment Issue - ${eventTitle} Reservation`,
        html: guestEmailHtml,
      })
    );

    // Send admin notification emails
    if (adminEmails && adminEmails.length > 0) {
      const adminEmailAddresses = adminEmails.map(ae => ae.email);
      console.log("Sending admin payment failure notifications to:", adminEmailAddresses);
      
      emailPromises.push(
        resend.emails.send({
          from: "Royal Palace Notifications <notifications@royalpalacedtx.email>",
          to: adminEmailAddresses,
          subject: `Payment Failed: ${guestName} - ${eventTitle}`,
          html: adminEmailHtml,
        })
      );
    } else {
      console.log("No admin notification emails configured");
    }

    // Send all emails
    const emailResults = await Promise.allSettled(emailPromises);
    
    console.log("Payment failure email results:", emailResults);

    // Check if guest email sent successfully (this is critical)
    const guestEmailResult = emailResults[0];
    if (guestEmailResult.status === 'rejected') {
      throw new Error(`Failed to send guest payment failure email: ${guestEmailResult.reason}`);
    }

    // Log admin email results (but don't fail if they don't work)
    const adminEmailResult = emailResults[1];
    if (adminEmailResult && adminEmailResult.status === 'rejected') {
      console.error("Failed to send admin payment failure notification emails:", adminEmailResult.reason);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      guestEmailId: guestEmailResult.status === 'fulfilled' ? guestEmailResult.value.id : null,
      adminEmailSent: adminEmailResult ? adminEmailResult.status === 'fulfilled' : false,
      adminEmailCount: adminEmails?.length || 0
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-payment-failure-email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});