import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing required environment variables');
    }

    // First get user_id and temp_password from our RPC function
    const rpcResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/create_admin_user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceRoleKey,
        'Authorization': `Bearer ${supabaseServiceRoleKey}`,
      },
      body: JSON.stringify({
        p_email: email,
        p_role: role
      })
    });
    
    if (!rpcResponse.ok) {
      const rpcError = await rpcResponse.text();
      console.error('RPC error:', rpcError);
      throw new Error(`RPC failed: ${rpcError}`);
    }
    
    const userData = await rpcResponse.json();
    const { user_id, temp_password } = userData as { user_id: string; temp_password: string };
    console.log('RPC created user_id:', user_id);
    
    // Create the auth user with the temp password using auth admin API
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceRoleKey,
        'Authorization': `Bearer ${supabaseServiceRoleKey}`,
      },
      body: JSON.stringify({
        email,
        password: temp_password,
        user_metadata: {
          role,
          has_temp_password: true
        }
      })
    });
    
    if (!authResponse.ok) {
      const authError = await authResponse.text();
      console.error('Auth creation error:', authError);
      
      // If auth creation fails, clean up the admin_users record
      await fetch(`${supabaseUrl}/rest/v1/admin_users?user_id=eq.${user_id}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseServiceRoleKey,
          'Authorization': `Bearer ${supabaseServiceRoleKey}`,
        }
      });
      
      throw new Error(`Auth user creation failed: ${authError}`);
    }
    
    const authUser = await authResponse.json();
    console.log('Auth user created:', authUser.id);
    
    // Update the admin_users record with the actual auth user_id
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/admin_users?user_id=eq.${user_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceRoleKey,
        'Authorization': `Bearer ${supabaseServiceRoleKey}`,
      },
      body: JSON.stringify({
        user_id: authUser.id
      })
    });
    
    if (!updateResponse.ok) {
      const updateError = await updateResponse.text();
      console.error('Update error:', updateError);
      throw new Error(`Failed to update admin_users record: ${updateError}`);
    }
    
    console.log('Successfully created admin user');
    
    // Send welcome email with temporary password
    try {
      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-admin-welcome-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceRoleKey,
          'Authorization': `Bearer ${supabaseServiceRoleKey}`,
        },
        body: JSON.stringify({
          email: email,
          tempPassword: temp_password,
          role: role
        })
      });
      
      if (!emailResponse.ok) {
        console.error('Failed to send welcome email:', await emailResponse.text());
      }
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: authUser.id, 
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