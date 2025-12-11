import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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
    const { sessionId } = await req.json();

    console.log("Verifying membership payment:", sessionId);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Find the membership by session ID
    const { data: membership, error: findError } = await supabase
      .from("memberships")
      .select("*, membership_levels(*)")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    if (findError || !membership) {
      console.error("Membership not found:", findError);
      throw new Error("Membership record not found");
    }

    // Check if already verified
    if (membership.payment_status === "completed") {
      return new Response(
        JSON.stringify({ 
          success: true, 
          membership,
          cardUrl: `/vip-card/${membership.qr_code_token}` 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get password from Stripe metadata (user-provided) or generate fallback
    const encodedPassword = session.metadata?.userPassword;
    const userPassword = encodedPassword ? atob(encodedPassword) : ('Royal' + Math.floor(Math.random() * 900000 + 100000));
    const isUserProvidedPassword = !!encodedPassword;
    
    // Create or get auth user
    let userId: string | null = null;
    let isNewUser = false;
    
    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === membership.email.toLowerCase());
      
      if (existingUser) {
        userId = existingUser.id;
        console.log("User already exists:", userId);
        
        // Only update password if user provided one
        if (isUserProvidedPassword) {
          await supabase.auth.admin.updateUserById(userId, {
            password: userPassword,
          });
        }
      } else {
        // Create new auth user with user's chosen password
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: membership.email.toLowerCase(),
          password: userPassword,
          email_confirm: true,
        });
        
        if (authError) {
          console.error("Failed to create auth user:", authError);
        } else {
          userId = authData.user?.id || null;
          isNewUser = true;
          console.log("Created new auth user:", userId);
        }
      }
    } catch (authErr) {
      console.error("Auth user creation error:", authErr);
    }

    // Update membership to active and link user
    const updateData: Record<string, any> = {
      active: true,
      payment_status: "completed",
      purchase_date: new Date().toISOString(),
    };
    
    if (userId) {
      updateData.user_id = userId;
    }
    
    const { error: updateError } = await supabase
      .from("memberships")
      .update(updateData)
      .eq("id", membership.id);

    if (updateError) {
      console.error("Failed to update membership:", updateError);
      throw new Error("Failed to activate membership");
    }

    // Send confirmation email with login credentials
    try {
      const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
      const origin = req.headers.get("origin") || "https://royalpalacedtx.com";
      const cardUrl = `${origin}/vip-card/${membership.qr_code_token}`;
      const loginUrl = `${origin}/vip-login`;

      // Build credentials section - only show password if it was system-generated
      const credentialsSection = isUserProvidedPassword 
        ? `<div style="background: #2a2a2a; border: 1px solid #D4AF37; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #D4AF37; margin-top: 0; text-align: center;">Your VIP Account</h3>
            <p style="margin: 10px 0; color: #ccc;"><strong style="color: #fff;">Email:</strong> ${membership.email}</p>
            <p style="color: #999; font-size: 12px; margin-top: 15px; text-align: center;">Use the password you created during registration to sign in.</p>
          </div>`
        : `<div style="background: #2a2a2a; border: 1px solid #D4AF37; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #D4AF37; margin-top: 0; text-align: center;">Your VIP Login Credentials</h3>
            <p style="margin: 10px 0; color: #ccc;"><strong style="color: #fff;">Email:</strong> ${membership.email}</p>
            <p style="margin: 10px 0; color: #ccc;"><strong style="color: #fff;">Temporary Password:</strong> <code style="background: #333; padding: 4px 8px; border-radius: 4px; color: #D4AF37;">${userPassword}</code></p>
            <p style="color: #999; font-size: 12px; margin-top: 15px; text-align: center;">We recommend changing your password after logging in.</p>
          </div>`;

      await resend.emails.send({
        from: "Royal Palace DTX <noreply@royalpalacedtx.com>",
        to: [membership.email],
        subject: `Welcome to ${membership.membership_levels?.name} VIP Membership!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #141414; color: #fff; padding: 40px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #D4AF37; margin: 0;">Royal Palace DTX</h1>
              <p style="color: #D4AF37; font-size: 14px; letter-spacing: 2px;">VIP MEMBERSHIP</p>
            </div>
            
            <div style="background: #1a1a1a; border: 1px solid #D4AF37; border-radius: 10px; padding: 30px; margin-bottom: 30px;">
              <h2 style="color: #fff; margin-top: 0;">Welcome, ${membership.full_name}!</h2>
              <p style="color: #ccc;">Your ${membership.membership_levels?.name} VIP membership is now active.</p>
              
              <div style="margin: 20px 0; padding: 15px; background: #252525; border-radius: 5px;">
                <p style="margin: 5px 0; color: #ccc;"><strong style="color: #D4AF37;">Membership:</strong> ${membership.membership_levels?.name}</p>
                <p style="margin: 5px 0; color: #ccc;"><strong style="color: #D4AF37;">Valid Until:</strong> ${new Date(membership.expiration_date).toLocaleDateString()}</p>
              </div>
              
              ${credentialsSection}
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${cardUrl}" style="display: inline-block; background: #D4AF37; color: #000; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 5px; margin-right: 10px;">
                  VIEW YOUR VIP CARD
                </a>
              </div>
              
              <div style="text-align: center; margin-top: 15px;">
                <a href="${loginUrl}" style="display: inline-block; background: transparent; border: 1px solid #D4AF37; color: #D4AF37; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px;">
                  SIGN IN TO YOUR ACCOUNT
                </a>
              </div>
            </div>
            
            <p style="color: #888; font-size: 12px; text-align: center;">
              Save this email! Use your login credentials to access your VIP card anytime at ${loginUrl}
            </p>
          </div>
        `,
      });
      console.log("Welcome email sent to:", membership.email);
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // Don't fail the whole request if email fails
    }


    return new Response(
      JSON.stringify({ 
        success: true, 
        membership,
        cardUrl: `/vip-card/${membership.qr_code_token}` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error verifying membership:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
