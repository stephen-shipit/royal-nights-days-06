import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FormNotificationRequest {
  formType: string;
  formData: Record<string, any>;
  submissionId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formType, formData, submissionId }: FormNotificationRequest = await req.json();

    console.log('Sending form notification email:', { formType, submissionId });

    // Fetch admin emails from notification_settings
    const { data: notificationEmails, error: emailError } = await supabase
      .from('notification_settings')
      .select('email')
      .eq('notification_type', 'form_submission')
      .eq('is_active', true);

    if (emailError) {
      console.error('Error fetching notification emails:', emailError);
    }

    // Use fetched emails or fallback to existing valid notification emails
    const adminEmails = notificationEmails?.length 
      ? notificationEmails.map(n => n.email)
      : ["elvisngyia@gmail.com", "info@royalpalacedtx.com", "pmuchilwa@gmail.com", "stephen.munabo@gmail.com"]; // Fallback to existing valid emails

    console.log('Sending to admin emails:', adminEmails);

    // Format form data for email display
    const formatFormData = (data: Record<string, any>) => {
      return Object.entries(data)
        .map(([key, value]) => {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          if (typeof value === 'boolean') {
            return `<strong>${label}:</strong> ${value ? 'Yes' : 'No'}`;
          }
          return `<strong>${label}:</strong> ${value || 'Not provided'}`;
        })
        .join('<br>');
    };

    // Get form type display name
    const getFormTypeDisplayName = (type: string) => {
      switch (type) {
        case 'royal_mic_registration':
          return 'Royal Mic Thursday Registration';
        default:
          return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    };

    const emailResponse = await resend.emails.send({
      from: "Royal Palace <noreply@royalpalacedtx.email>",
      to: adminEmails,
      subject: `New ${getFormTypeDisplayName(formType)} - ${formData.fullName || formData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #D4AF37, #FFD700); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #000; margin: 0; font-size: 24px;">👑 Royal Palace</h1>
            <h2 style="color: #000; margin: 10px 0 0 0; font-size: 18px;">New Form Submission</h2>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <h3 style="color: #333; margin-top: 0;">Form Type: ${getFormTypeDisplayName(formType)}</h3>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #D4AF37;">
              <h4 style="color: #333; margin-top: 0;">Submission Details:</h4>
              <p style="line-height: 1.6; color: #666;">
                ${formatFormData(formData)}
              </p>
            </div>
            
            <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #333;">
                <strong>Submission ID:</strong> ${submissionId}<br>
                <strong>Submitted:</strong> ${new Date().toLocaleString()}
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; margin: 0;">
                Please review this submission in the admin dashboard and follow up as appropriate.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; color: #999; font-size: 12px;">
            <p>Royal Palace Admin Notification System</p>
          </div>
        </div>
      `,
    });

    console.log("Form notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-form-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);