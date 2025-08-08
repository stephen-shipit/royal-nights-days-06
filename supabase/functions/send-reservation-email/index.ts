import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  reservationId: string;
  sessionId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reservationId, sessionId }: EmailRequest = await req.json();

    console.log("Sending confirmation email for reservation:", reservationId);

    // Create Supabase client for service operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get reservation details with event and table information
    const { data: reservation, error: reservationError } = await supabase
      .from("table_reservations")
      .select(`
        *,
        events (
          title,
          date,
          time,
          description
        ),
        venue_tables (
          table_number
        )
      `)
      .eq("id", reservationId)
      .single();

    if (reservationError || !reservation) {
      console.error("Error fetching reservation:", reservationError);
      throw new Error("Reservation not found");
    }

    // Format the email content
    const birthdayPackageText = reservation.birthday_package 
      ? `
        <h3 style="color: #d4af37; margin-top: 20px;">🎉 Birthday Shoutout Package Included!</h3>
        <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.6;">
          <li>Special shoutout by our MC</li>
          <li>Your picture and name displayed on our large screen</li>
          <li>Sparklers and lights display at your table</li>
          <li>Custom name sign at your table</li>
        </ul>
      `
      : '';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
        <div style="background-color: #1a1a1a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #d4af37; margin: 0; font-size: 28px;">Reservation Confirmed!</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; color: #333; margin-bottom: 20px;">
            Dear ${reservation.guest_name},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Thank you for your reservation! We're excited to have you join us for an unforgettable experience.
          </p>
          
          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1a1a1a; margin-top: 0;">Reservation Details</h2>
            
            <div style="display: grid; gap: 10px;">
              <p style="margin: 5px 0;"><strong>Event:</strong> ${reservation.events.title}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(reservation.events.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${reservation.events.time}</p>
              <p style="margin: 5px 0;"><strong>Table Number:</strong> ${reservation.venue_tables.table_number}</p>
              <p style="margin: 5px 0;"><strong>Guest Count:</strong> ${reservation.guest_count}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${reservation.guest_phone}</p>
              ${reservation.special_requests ? `<p style="margin: 5px 0;"><strong>Special Requests:</strong> ${reservation.special_requests}</p>` : ''}
            </div>
          </div>
          
          ${birthdayPackageText}
          
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #2d5a3d;"><strong>Total Paid:</strong> $${(reservation.total_price / 100).toFixed(2)}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              <strong>Important Information:</strong><br>
              • Please arrive 15 minutes before your reservation time<br>
              • Present this confirmation email at the entrance<br>
              • For any changes or cancellations, please contact us at least 24 hours in advance<br>
              • Dress code: Smart casual to formal attire recommended
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #d4af37; font-size: 16px; margin: 10px 0;">
              We can't wait to see you!
            </p>
            <p style="color: #666; font-size: 14px;">
              For questions or assistance, please contact us<br>
              Email: reservations@venue.com | Phone: (555) 123-4567
            </p>
          </div>
        </div>
      </div>
    `;

    // Send the email
    const emailResponse = await resend.emails.send({
      from: "Reservations <reservations@venue.com>",
      to: [reservation.guest_email],
      subject: `Reservation Confirmed - ${reservation.events.title}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-reservation-email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});