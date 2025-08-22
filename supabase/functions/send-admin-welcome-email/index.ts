import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  tempPassword: string;
  role: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, tempPassword, role }: WelcomeEmailRequest = await req.json();
    
    console.log("Sending welcome email to:", email);

    // Get notification settings for admin emails
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: notificationSettings } = await supabase
      .from("notification_settings")
      .select("email")
      .eq("notification_type", "reservation_confirmed")
      .eq("is_active", true);

    const adminEmails = notificationSettings?.map(setting => setting.email) || [];

    const loginUrl = `${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '')}.lovable.app/admin`;

    // Send welcome email to the new admin user
    const welcomeEmailResponse = await resend.emails.send({
      from: "Royal Palace <noreply@royalpalacedtx.email>",
      to: [email],
      subject: "Welcome to Royal Palace Admin - Your Access Details",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header with Royal Palace branding -->
          <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; font-size: 32px; margin: 0; font-weight: bold;">
              👑 Royal Palace
            </h1>
            <p style="color: #E5E7EB; margin: 10px 0 0 0; font-size: 16px;">
              Administrative Access Portal
            </p>
          </div>
          
          <!-- Main content -->
          <div style="padding: 40px 30px; background-color: #ffffff;">
            <h2 style="color: #1F2937; font-size: 24px; margin-bottom: 20px;">
              Welcome to the Royal Palace Admin Team!
            </h2>
            
            <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              You have been granted <strong>${role}</strong> access to the Royal Palace administrative system. 
              Your account has been created successfully and you can now access the admin dashboard.
            </p>
            
            <!-- Login credentials box -->
            <div style="background-color: #F9FAFB; border: 2px solid #8B5CF6; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #8B5CF6; margin: 0 0 15px 0; font-size: 18px;">
                🔐 Your Login Credentials
              </h3>
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Email:</strong> 
                <span style="color: #1F2937; font-family: monospace; background: #fff; padding: 4px 8px; border-radius: 4px; border: 1px solid #D1D5DB;">${email}</span>
              </div>
              <div style="margin-bottom: 20px;">
                <strong style="color: #374151;">Temporary Password:</strong> 
                <span style="color: #1F2937; font-family: monospace; background: #fff; padding: 4px 8px; border-radius: 4px; border: 1px solid #D1D5DB;">${tempPassword}</span>
              </div>
              
              <div style="background-color: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 15px; margin-top: 20px;">
                <p style="color: #92400E; margin: 0; font-size: 14px; font-weight: 500;">
                  ⚠️ <strong>Security Notice:</strong> You must change this temporary password on your first login. 
                  This is required for security purposes.
                </p>
              </div>
            </div>
            
            <!-- Login button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" 
                 style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); 
                        color: white; 
                        text-decoration: none; 
                        padding: 15px 40px; 
                        border-radius: 8px; 
                        font-weight: bold; 
                        font-size: 16px; 
                        display: inline-block;
                        box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">
                Access Admin Dashboard →
              </a>
            </div>
            
            <!-- Instructions -->
            <div style="background-color: #F3F4F6; border-radius: 8px; padding: 20px; margin-top: 25px;">
              <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">📋 Getting Started</h3>
              <ol style="color: #4B5563; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Click the "Access Admin Dashboard" button above</li>
                <li>Log in using your email and temporary password</li>
                <li>You'll be prompted to create a new secure password</li>
                <li>Once completed, you'll have full access to the admin features</li>
              </ol>
            </div>
            
            <!-- Support section -->
            <div style="border-top: 1px solid #E5E7EB; padding-top: 25px; margin-top: 30px; text-align: center;">
              <p style="color: #6B7280; font-size: 14px; margin-bottom: 10px;">
                Need help? Contact our technical support team
              </p>
              <p style="color: #8B5CF6; font-size: 14px; margin: 0;">
                📧 <strong>support@royalpalace.com</strong> | 📞 <strong>(555) 123-4567</strong>
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #1F2937; padding: 25px 30px; text-align: center;">
            <p style="color: #9CA3AF; margin: 0; font-size: 14px;">
              © 2024 Royal Palace. All rights reserved.
            </p>
            <p style="color: #6B7280; margin: 10px 0 0 0; font-size: 12px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Welcome email sent successfully:", welcomeEmailResponse);

    // Send notification to admin team about new user
    if (adminEmails.length > 0) {
      await resend.emails.send({
        from: "Royal Palace Admin <noreply@royalpalacedtx.email>",
        to: adminEmails,
        subject: "New Admin User Added to Royal Palace System",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">👑 Royal Palace Admin</h1>
              <p style="color: #E5E7EB; margin: 10px 0 0 0;">System Notification</p>
            </div>
            
            <div style="padding: 30px; background-color: #ffffff;">
              <h2 style="color: #1F2937; margin-bottom: 20px;">New Admin User Created</h2>
              
              <p style="color: #4B5563; margin-bottom: 20px;">
                A new administrator has been added to the Royal Palace system:
              </p>
              
              <div style="background-color: #F9FAFB; border-left: 4px solid #8B5CF6; padding: 20px; margin: 20px 0;">
                <p style="margin: 0; color: #374151;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 10px 0 0 0; color: #374151;"><strong>Role:</strong> ${role}</p>
                <p style="margin: 10px 0 0 0; color: #374151;"><strong>Status:</strong> Welcome email sent</p>
              </div>
              
              <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
                The user has been sent their login credentials and will be required to change their temporary password on first login.
              </p>
            </div>
          </div>
        `,
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: "Welcome email sent successfully" 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-admin-welcome-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);