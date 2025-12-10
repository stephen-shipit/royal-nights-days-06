import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface JobApplicationEmailRequest {
  applicantName: string;
  applicantEmail: string;
  jobTitle: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { applicantName, applicantEmail, jobTitle }: JobApplicationEmailRequest = await req.json();

    console.log("Sending job application notification email for:", { applicantName, jobTitle });

    // Send notification to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Royal Palace Careers <onboarding@resend.dev>",
      to: ["careers@royalpalacedtx.com"],
      subject: `New Job Application: ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1a1a1a; color: #d4af37; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">New Job Application</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
              A new application has been submitted for the <strong>${jobTitle}</strong> position.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; margin-bottom: 20px;">
              <h3 style="color: #333; margin-top: 0;">Applicant Details:</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${applicantName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${applicantEmail}</p>
              <p style="margin: 5px 0;"><strong>Position:</strong> ${jobTitle}</p>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Log in to the admin dashboard to view the full application and attached documents.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>Royal Palace Restaurant & Lounge</p>
            <p>4101 Belt Line Rd, Addison, TX 75001</p>
          </div>
        </div>
      `,
    });

    console.log("Admin notification email sent:", adminEmailResponse);

    // Send confirmation to applicant
    const applicantEmailResponse = await resend.emails.send({
      from: "Royal Palace Careers <onboarding@resend.dev>",
      to: [applicantEmail],
      subject: `Application Received: ${jobTitle} at Royal Palace`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1a1a1a; color: #d4af37; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Application Received</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
              Dear ${applicantName},
            </p>
            
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
              Thank you for your interest in joining the Royal Palace team! We have received your application for the <strong>${jobTitle}</strong> position.
            </p>
            
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
              Our hiring team will review your application and reach out if your qualifications match our needs. This process typically takes 5-7 business days.
            </p>
            
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
              If you have any questions, please don't hesitate to reach out to us at <a href="mailto:careers@royalpalacedtx.com" style="color: #d4af37;">careers@royalpalacedtx.com</a>.
            </p>
            
            <p style="color: #333; font-size: 16px;">
              Best regards,<br>
              <strong>The Royal Palace Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>Royal Palace Restaurant & Lounge</p>
            <p>4101 Belt Line Rd, Addison, TX 75001</p>
          </div>
        </div>
      `,
    });

    console.log("Applicant confirmation email sent:", applicantEmailResponse);

    return new Response(
      JSON.stringify({ success: true, adminEmail: adminEmailResponse, applicantEmail: applicantEmailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending job application emails:", error);
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
