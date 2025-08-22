-- Drop and recreate create_admin_user function with new return type
DROP FUNCTION IF EXISTS public.create_admin_user(text, text);

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
  -- Generate a temporary password (more secure)
  temp_password := 'RP' || upper(encode(gen_random_bytes(6), 'base64')) || '!';
  
  -- Create auth user with temporary password
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data
  ) VALUES (
    p_email,
    crypt(temp_password, gen_salt('bf')),
    now(),
    jsonb_build_object('temp_password', temp_password)
  ) RETURNING id INTO new_user_id;
  
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