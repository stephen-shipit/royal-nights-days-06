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
  sessionId?: string;
  emailType?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reservationId, sessionId, emailType }: EmailRequest = await req.json();

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

    // Get admin notification emails
    const { data: adminEmails, error: adminEmailsError } = await supabase
      .from("notification_settings")
      .select("email")
      .eq("notification_type", "reservation_confirmed")
      .eq("is_active", true);

    if (adminEmailsError) {
      console.error("Error fetching admin notification emails:", adminEmailsError);
    }

    // Format screen display package text
    const screenDisplayText = reservation.screen_display_image_url 
      ? `
        <h3 style="color: #d4af37; margin-top: 20px;">📺 Screen Display Package Included!</h3>
        <p style="margin: 10px 0; line-height: 1.6;">Your picture will be displayed on our large screen during the event.</p>
        <div style="margin: 15px 0;">
          <img src="${reservation.screen_display_image_url}" alt="Screen Display Image" style="max-width: 300px; border-radius: 8px; border: 2px solid #d4af37;" />
        </div>
      `
      : '';

    // Determine if this is a dining or nightlife reservation
    const isDiningReservation = reservation.reservation_type === 'dining';
    const hasEvent = reservation.events && reservation.events.title;
    
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

    // Format date for dining reservations (use current date if no event)
    const reservationDate = hasEvent ? 
      new Date(reservation.events.date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) : 
      new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

    // Email subject and title based on reservation type
    const emailTitle = emailType === 'request_received' ? 'Reservation Request Received' : 'Reservation Confirmed!';
    const emailSubject = hasEvent ? 
      `${emailTitle} - ${reservation.events.title}` : 
      `${emailTitle} - Dining Reservation`;

    // Guest confirmation email content
    const guestEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
        <div style="background-color: #1a1a1a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #d4af37; margin: 0; font-size: 28px;">${emailTitle}</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 18px; color: #333; margin-bottom: 20px;">
            Dear ${reservation.guest_name},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            ${emailType === 'request_received' ? 
              'Thank you for your reservation request! We have received your request and will review it shortly. You will receive a confirmation email once your reservation is approved.' :
              'Thank you for your reservation! We\'re excited to have you join us for an unforgettable experience.'
            }
          </p>
          
          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1a1a1a; margin-top: 0;">Reservation Details</h2>
            
            <div style="display: grid; gap: 10px;">
              ${hasEvent ? `<p style="margin: 5px 0;"><strong>Event:</strong> ${reservation.events.title}</p>` : `<p style="margin: 5px 0;"><strong>Service:</strong> Dining Experience</p>`}
              <p style="margin: 5px 0;"><strong>Date:</strong> ${reservationDate}</p>
              ${hasEvent ? `<p style="margin: 5px 0;"><strong>Time:</strong> ${reservation.events.time}</p>` : `<p style="margin: 5px 0;"><strong>Time Slot:</strong> ${reservation.time_slot}</p>`}
              <p style="margin: 5px 0;"><strong>Table Number:</strong> ${reservation.venue_tables.table_number}</p>
              <p style="margin: 5px 0;"><strong>Guest Count:</strong> ${reservation.guest_count}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${reservation.guest_phone || 'Not provided'}</p>
              ${reservation.special_requests ? `<p style="margin: 5px 0;"><strong>Special Requests:</strong> ${reservation.special_requests}</p>` : ''}
            </div>
          </div>
          
          ${birthdayPackageText}
          
          ${screenDisplayText}
          
          ${reservation.total_price > 0 ? `
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #2d5a3d;"><strong>Total Paid:</strong> $${(reservation.total_price / 100).toFixed(2)}</p>
          </div>
          ` : ''}
          
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
          <h1 style="color: white; margin: 0; font-size: 24px;">🆕 New Reservation Alert</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            <strong>A new reservation has been confirmed and payment processed.</strong>
          </p>
          
          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1a1a1a; margin-top: 0;">Reservation Details</h2>
            
            <div style="display: grid; gap: 8px;">
              <p style="margin: 3px 0;"><strong>Reservation ID:</strong> ${reservation.id}</p>
              <p style="margin: 3px 0;"><strong>Guest Name:</strong> ${reservation.guest_name}</p>
              <p style="margin: 3px 0;"><strong>Email:</strong> ${reservation.guest_email}</p>
              <p style="margin: 3px 0;"><strong>Phone:</strong> ${reservation.guest_phone}</p>
              ${hasEvent ? `<p style="margin: 3px 0;"><strong>Event:</strong> ${reservation.events.title}</p>` : `<p style="margin: 3px 0;"><strong>Service:</strong> Dining Experience</p>`}
              <p style="margin: 3px 0;"><strong>Date:</strong> ${reservationDate}</p>
              ${hasEvent ? `<p style="margin: 3px 0;"><strong>Time:</strong> ${reservation.events.time}</p>` : `<p style="margin: 3px 0;"><strong>Time Slot:</strong> ${reservation.time_slot}</p>`}
              <p style="margin: 3px 0;"><strong>Table Number:</strong> ${reservation.venue_tables.table_number}</p>
              <p style="margin: 3px 0;"><strong>Guest Count:</strong> ${reservation.guest_count}</p>
              <p style="margin: 3px 0;"><strong>Reservation Type:</strong> ${reservation.reservation_type}</p>
              <p style="margin: 3px 0;"><strong>Time Slot:</strong> ${reservation.time_slot}</p>
              ${reservation.special_requests ? `<p style="margin: 3px 0;"><strong>Special Requests:</strong> ${reservation.special_requests}</p>` : ''}
              <p style="margin: 3px 0;"><strong>Birthday Package:</strong> ${reservation.birthday_package ? 'Yes' : 'No'}</p>
              <p style="margin: 3px 0;"><strong>Screen Display Package:</strong> ${reservation.screen_display_image_url ? 'Yes' : 'No'}</p>
              ${reservation.screen_display_image_url ? `
                <div style="margin: 10px 0;">
                  <p style="margin: 3px 0;"><strong>Screen Display Image:</strong></p>
                  <img src="${reservation.screen_display_image_url}" alt="Screen Display Image" style="max-width: 200px; border-radius: 4px; border: 1px solid #ccc;" />
                  <p style="margin: 3px 0; font-size: 12px; color: #666;"><a href="${reservation.screen_display_image_url}" target="_blank">View Full Size</a></p>
                </div>
              ` : ''}
            </div>
          </div>
          
          <div style="background-color: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #166534;"><strong>Payment Status:</strong> ${reservation.payment_status}</p>
            <p style="margin: 5px 0 0 0; color: #166534;"><strong>Total Amount:</strong> $${(reservation.total_price / 100).toFixed(2)}</p>
            <p style="margin: 5px 0 0 0; color: #166534; font-size: 12px;"><strong>Stripe Session:</strong> ${reservation.stripe_session_id || 'N/A'}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-radius: 8px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Action Required:</strong> Please review this reservation and prepare for the guest's arrival.
            </p>
          </div>
        </div>
      </div>
    `;

    const emailPromises = [];

    // Send guest confirmation email
    emailPromises.push(
      resend.emails.send({
        from: "Royal Palace Reservations <reservations@royalpalacedtx.email>",
        to: [reservation.guest_email],
        subject: emailSubject,
        html: guestEmailHtml,
      })
    );

    // Send admin notification emails
    if (adminEmails && adminEmails.length > 0) {
      const adminEmailAddresses = adminEmails.map(ae => ae.email);
      console.log("Sending admin notifications to:", adminEmailAddresses);
      
      emailPromises.push(
        resend.emails.send({
          from: "Royal Palace Notifications <notifications@royalpalacedtx.email>",
          to: adminEmailAddresses,
          subject: `New Reservation: ${reservation.guest_name} - ${hasEvent ? reservation.events.title : 'Dining'}`,
          html: adminEmailHtml,
        })
      );
    } else {
      console.log("No admin notification emails configured");
    }

    // Send all emails
    const emailResults = await Promise.allSettled(emailPromises);
    
    console.log("Email results:", emailResults);

    // Check if guest email sent successfully (this is critical)
    const guestEmailResult = emailResults[0];
    if (guestEmailResult.status === 'rejected') {
      throw new Error(`Failed to send guest confirmation email: ${guestEmailResult.reason}`);
    }

    // Log admin email results (but don't fail if they don't work)
    const adminEmailResult = emailResults[1];
    if (adminEmailResult && adminEmailResult.status === 'rejected') {
      console.error("Failed to send admin notification emails:", adminEmailResult.reason);
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
    console.error("Error in send-reservation-email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});