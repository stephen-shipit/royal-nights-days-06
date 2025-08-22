import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  toEmail: string;
  emailType: 'reservation' | 'general';
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Test email function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { toEmail, emailType }: TestEmailRequest = await req.json();
    console.log(`Sending test email to: ${toEmail}, type: ${emailType}`);

    let subject: string;
    let html: string;

    if (emailType === 'reservation') {
      subject = "Test Reservation Confirmation - Royal Palace";
      html = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #8B5CF6, #A855F7); padding: 40px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Royal Palace</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Test Reservation Confirmation</p>
          </div>
          
          <div style="padding: 40px 20px; background-color: #f8f9fa;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #8B5CF6; margin-top: 0;">🎉 Test Reservation Confirmed!</h2>
              
              <p>This is a <strong>test email</strong> to verify that your email notification system is working correctly.</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #333;">Test Event Details:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; width: 30%;">Event:</td>
                    <td style="padding: 8px 0;">Sample Event - Test</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Date:</td>
                    <td style="padding: 8px 0;">${new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Time:</td>
                    <td style="padding: 8px 0;">8:00 PM - 12:00 AM</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Guest Name:</td>
                    <td style="padding: 8px 0;">Test Customer</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Party Size:</td>
                    <td style="padding: 8px 0;">4 guests</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Table:</td>
                    <td style="padding: 8px 0;">Table 5</td>
                  </tr>
                </table>
              </div>
              
              <div style="background: #e8f5e8; border-left: 4px solid #4ade80; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #166534;"><strong>✅ Email System Status:</strong> Working correctly!</p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                This is an automated test message from your Royal Palace email notification system. 
                If you received this email, your notification system is configured properly.
              </p>
            </div>
          </div>
        </div>
      `;
    } else {
      subject = "Test Email - Royal Palace Notification System";
      html = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #8B5CF6, #A855F7); padding: 40px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Royal Palace</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">System Test Email</p>
          </div>
          
          <div style="padding: 40px 20px; background-color: #f8f9fa;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #8B5CF6; margin-top: 0;">📧 Test Email Successful!</h2>
              
              <p>This is a test email from your Royal Palace notification system.</p>
              
              <div style="background: #e8f5e8; border-left: 4px solid #4ade80; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #166534;"><strong>✅ Status:</strong> Email system is working correctly!</p>
              </div>
              
              <p>Test sent at: <strong>${new Date().toLocaleString()}</strong></p>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                If you received this email, your email configuration is working properly and you can expect to receive reservation notifications.
              </p>
            </div>
          </div>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Royal Palace <noreply@royalpalacedtx.email>",
      to: [toEmail],
      subject,
      html,
    });

    console.log("Test email sent successfully:", emailResponse);

    return new Response(JSON.stringify({
      success: true,
      emailId: emailResponse.data?.id,
      message: "Test email sent successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-test-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        message: "Failed to send test email"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);