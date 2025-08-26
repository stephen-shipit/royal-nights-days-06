-- Fix create_admin_user function to explicitly provide id for auth.users
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
  
  -- Generate a temporary password (more secure) - use extensions schema
  temp_password := 'RP' || upper(encode(extensions.gen_random_bytes(6), 'base64')) || '!';
  
  -- Create auth user with explicit id and temporary password
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data
  ) VALUES (
    new_user_id,
    p_email,
    extensions.crypt(temp_password, extensions.gen_salt('bf')),
    now(),
    jsonb_build_object('temp_password', temp_password)
  );
  
  -- Create admin user record
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
  
  -- Return both user_id and temp_password for email sending
  RETURN jsonb_build_object(
    'user_id', new_user_id,
    'temp_password', temp_password
  );
END;
$function$;