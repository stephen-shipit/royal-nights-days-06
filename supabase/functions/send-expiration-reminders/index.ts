import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Running membership expiration reminder check...");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Get current date and date 7 days from now
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    // Format dates for comparison
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysStr = sevenDaysFromNow.toISOString().split('T')[0];

    // Find memberships expiring in exactly 7 days
    // We check for expiration_date between today+7 days start and end of that day
    const { data: expiringMemberships, error } = await supabase
      .from("memberships")
      .select("*, membership_levels(*)")
      .eq("active", true)
      .eq("payment_status", "completed")
      .gte("expiration_date", `${sevenDaysStr}T00:00:00`)
      .lt("expiration_date", `${sevenDaysStr}T23:59:59`);

    if (error) {
      console.error("Error fetching expiring memberships:", error);
      throw error;
    }

    console.log(`Found ${expiringMemberships?.length || 0} memberships expiring in 7 days`);

    const emailsSent: string[] = [];
    const emailsFailed: string[] = [];

    for (const membership of expiringMemberships || []) {
      try {
        const origin = "https://royalpalacedtx.com";
        const cardUrl = `${origin}/vip-card/${membership.qr_code_token}`;
        const renewUrl = `${origin}/vip-card/${membership.qr_code_token}`;

        await resend.emails.send({
          from: "Royal Palace DTX <noreply@royalpalacedtx.com>",
          to: [membership.email],
          subject: `Your ${membership.membership_levels?.name} VIP Membership Expires in 7 Days`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #141414; color: #fff; padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #D4AF37; margin: 0;">Royal Palace DTX</h1>
                <p style="color: #D4AF37; font-size: 14px; letter-spacing: 2px;">VIP MEMBERSHIP REMINDER</p>
              </div>
              
              <div style="background: #1a1a1a; border: 1px solid #D4AF37; border-radius: 10px; padding: 30px; margin-bottom: 30px;">
                <h2 style="color: #fff; margin-top: 0;">Hi ${membership.full_name},</h2>
                <p style="color: #ccc;">Your ${membership.membership_levels?.name} VIP membership is expiring in <strong style="color: #D4AF37;">7 days</strong>.</p>
                
                <div style="margin: 20px 0; padding: 15px; background: #252525; border-radius: 5px;">
                  <p style="margin: 5px 0; color: #ccc;"><strong style="color: #D4AF37;">Membership:</strong> ${membership.membership_levels?.name}</p>
                  <p style="margin: 5px 0; color: #ccc;"><strong style="color: #D4AF37;">Expires:</strong> ${new Date(membership.expiration_date).toLocaleDateString()}</p>
                </div>

                <p style="color: #ccc;">Don't lose your VIP benefits! Renew now to continue enjoying:</p>
                <ul style="color: #ccc; padding-left: 20px;">
                  <li>Priority entry</li>
                  <li>Exclusive member perks</li>
                  <li>Special event access</li>
                </ul>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${renewUrl}" style="display: inline-block; background: #D4AF37; color: #000; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 5px;">
                    RENEW YOUR MEMBERSHIP
                  </a>
                </div>
              </div>
              
              <p style="color: #888; font-size: 12px; text-align: center;">
                Questions? Reply to this email or visit us at Royal Palace DTX.
              </p>
            </div>
          `,
        });

        emailsSent.push(membership.email);
        console.log(`Reminder email sent to: ${membership.email}`);
      } catch (emailError) {
        console.error(`Failed to send reminder to ${membership.email}:`, emailError);
        emailsFailed.push(membership.email);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        totalExpiring: expiringMemberships?.length || 0,
        emailsSent: emailsSent.length,
        emailsFailed: emailsFailed.length,
        sentTo: emailsSent,
        failedFor: emailsFailed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in expiration reminder:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
