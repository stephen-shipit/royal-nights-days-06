-- Fix reset_admin_password function - combine metadata updates into single SET
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
  temp_password := 'Royal' || floor(random() * 9000 + 1000)::text;
  
  -- Update auth user password - use extensions schema for crypt and gen_salt
  UPDATE auth.users 
  SET encrypted_password = extensions.crypt(temp_password, extensions.gen_salt('bf'))
  WHERE id = p_user_id;
  
  -- Update admin user metadata in single SET statement
  UPDATE public.admin_users 
  SET metadata = jsonb_set(
    jsonb_set(
      COALESCE(metadata, '{}'), 
      '{has_temp_password}', 
      'true'
    ),
    '{temp_password}', 
    to_jsonb(temp_password)
  ),
  updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN temp_password;
END;
$function$;