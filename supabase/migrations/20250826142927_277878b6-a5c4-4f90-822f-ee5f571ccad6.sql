-- Fix gen_random_bytes function calls to use correct schema
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
  -- Generate a temporary password (more secure) - use extensions schema
  temp_password := 'RP' || upper(encode(extensions.gen_random_bytes(6), 'base64')) || '!';
  
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

-- Fix reset_admin_password function
CREATE OR REPLACE FUNCTION public.reset_admin_password(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  temp_password text;
BEGIN
  -- Generate new temporary password - use extensions schema
  temp_password := encode(extensions.gen_random_bytes(12), 'base64');
  
  -- Update auth user password
  UPDATE auth.users 
  SET encrypted_password = crypt(temp_password, gen_salt('bf'))
  WHERE id = p_user_id;
  
  -- Update admin user metadata
  UPDATE public.admin_users 
  SET metadata = jsonb_set(
    COALESCE(metadata, '{}'), 
    '{has_temp_password}', 
    'true'
  ),
  metadata = jsonb_set(
    metadata, 
    '{temp_password}', 
    to_jsonb(temp_password)
  ),
  updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN temp_password;
END;
$function$;