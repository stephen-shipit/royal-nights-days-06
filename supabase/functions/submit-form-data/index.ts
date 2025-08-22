import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FormSubmissionRequest {
  formType: string;
  formData: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formType, formData }: FormSubmissionRequest = await req.json();

    console.log('Received form submission:', { formType, formData });

    // Validate required fields
    if (!formType || !formData) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: formType and formData' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Extract email and full name for indexing
    const email = formData.email || '';
    const fullName = formData.fullName || formData.full_name || formData.name || '';

    if (!email || !fullName) {
      return new Response(
        JSON.stringify({ error: 'Email and full name are required in form data' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Store form submission in database
    const { data, error } = await supabase
      .from('form_data')
      .insert({
        form_type: formType,
        form_data: formData,
        email: email,
        full_name: fullName,
        status: 'new'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to store form submission' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('Form submission stored:', data);

    // Send notification email to admins
    try {
      const { error: emailError } = await supabase.functions.invoke('send-form-notification-email', {
        body: {
          formType,
          formData,
          submissionId: data.id
        }
      });

      if (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't fail the request if email fails
      }
    } catch (emailError) {
      console.error('Error invoking notification email function:', emailError);
      // Don't fail the request if email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Form submitted successfully',
        submissionId: data.id
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in submit-form-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);