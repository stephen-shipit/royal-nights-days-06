-- Fix password generation and ensure proper notification settings
-- Update notification settings to use the correct email if not exists
INSERT INTO public.notification_settings (email, notification_type, is_active)
VALUES ('info@royalpalacedtx.com', 'reservation_confirmed', true)
ON CONFLICT (email, notification_type) DO NOTHING;

-- Fix the create_admin_user function with proper password handling
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
  
  -- Generate a simpler temporary password (8 characters)
  temp_password := 'Royal' || floor(random() * 9000 + 1000)::text;
  
  -- Create auth user with explicit id and temporary password
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    aud,
    role
  ) VALUES (
    new_user_id,
    p_email,
    extensions.crypt(temp_password, extensions.gen_salt('bf')),
    now(),
    jsonb_build_object('temp_password', temp_password),
    'authenticated',
    'authenticated'
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