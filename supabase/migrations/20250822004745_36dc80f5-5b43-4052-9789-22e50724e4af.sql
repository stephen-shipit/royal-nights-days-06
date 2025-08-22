-- Create user management functions for admin panel

-- Function to create a new admin user
CREATE OR REPLACE FUNCTION public.create_admin_user(
  p_email text,
  p_role text DEFAULT 'admin'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
  temp_password text;
BEGIN
  -- Generate a temporary password
  temp_password := encode(gen_random_bytes(12), 'base64');
  
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
  
  RETURN new_user_id;
END;
$$;

-- Function to update admin user role
CREATE OR REPLACE FUNCTION public.update_admin_user_role(
  p_user_id uuid,
  p_role text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.admin_users 
  SET role = p_role, updated_at = now()
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Admin user not found';
  END IF;
END;
$$;

-- Function to delete admin user
CREATE OR REPLACE FUNCTION public.delete_admin_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete from admin_users first
  DELETE FROM public.admin_users WHERE user_id = p_user_id;
  
  -- Delete from auth.users (cascade will handle related data)
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

-- Function to reset admin user password
CREATE OR REPLACE FUNCTION public.reset_admin_password(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  temp_password text;
BEGIN
  -- Generate new temporary password
  temp_password := encode(gen_random_bytes(12), 'base64');
  
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
$$;