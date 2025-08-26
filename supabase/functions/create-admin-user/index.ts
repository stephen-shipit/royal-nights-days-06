import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateAdminUserRequest {
  email: string;
  role: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, role }: CreateAdminUserRequest = await req.json();

    console.log('Creating admin user:', { email, role });

    // Create Supabase client with service role key for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // First get user_id and temp_password from our function
    const { data: userData, error: rpcError } = await supabase.rpc('create_admin_user', {
      p_email: email,
      p_role: role
    });
    
    if (rpcError) {
      console.error('RPC error:', rpcError);
      throw rpcError;
    }
    
    const { user_id, temp_password } = userData as { user_id: string; temp_password: string };
    console.log('RPC created user_id:', user_id);
    
    // Create the auth user with the temp password using auth admin API
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: temp_password,
      user_metadata: {
        role,
        has_temp_password: true
      }
    });
    
    if (authError) {
      console.error('Auth creation error:', authError);
      // If auth creation fails, clean up the admin_users record
      await supabase.from('admin_users').delete().eq('user_id', user_id);
      throw authError;
    }
    
    console.log('Auth user created:', authUser.user.id);
    
    // Update the admin_users record with the actual auth user_id
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ user_id: authUser.user.id })
      .eq('user_id', user_id);
    
    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }
    
    console.log('Successfully created admin user');
    
    // Send welcome email with temporary password
    try {
      const { error: emailError } = await supabase.functions.invoke('send-admin-welcome-email', {
        body: {
          email: email,
          tempPassword: temp_password,
          role: role
        }
      });
      
      if (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't throw here - user creation was successful
      }
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw here - user creation was successful
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: authUser.user.id, 
        temp_password 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in create-admin-user function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create admin user',
        details: error
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);