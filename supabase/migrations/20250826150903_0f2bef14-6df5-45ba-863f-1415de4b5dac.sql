-- Update create_admin_user function to not manually encrypt passwords
-- Let Supabase auth handle password creation properly
CREATE OR REPLACE FUNCTION public.create_admin_user(p_email text, p_role text DEFAULT 'admin'::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_user_id uuid;
  temp_password text;
BEGIN
  -- Generate a UUID for the new user
  new_user_id := gen_random_uuid();
  
  -- Generate a simpler, more reliable temporary password
  temp_password := 'Royal' || floor(random() * 9000 + 1000)::text;
  
  -- Create admin user record (don't create auth user here - let auth admin API handle it)
  INSERT INTO public.admin_users (
    user_id,
    email,
    role,
    metadata
  ) VALUES (
    new_user_id,
    p_email,
    p_role,
    jsonb_build_object('has_temp_password', true, 'temp_password', temp_password)
  );
  
  -- Return both user_id and temp_password for auth creation and email sending
  RETURN jsonb_build_object(
    'user_id', new_user_id,
    'temp_password', temp_password
  );
END;
$function$