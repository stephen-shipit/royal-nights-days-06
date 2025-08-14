-- Create admin activity audit log table for security monitoring
CREATE TABLE public.admin_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
USING (is_admin(auth.uid()));

-- Only system can insert audit logs (using service role)
CREATE POLICY "System can insert audit logs"
ON public.admin_audit_log
FOR INSERT
WITH CHECK (true);

-- Add metadata field to admin_users for temp password detection
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create function to check if user has temporary password
CREATE OR REPLACE FUNCTION public.has_temporary_password(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT (metadata->>'has_temp_password')::boolean 
     FROM public.admin_users 
     WHERE admin_users.user_id = has_temporary_password.user_id),
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to mark temp password as changed
CREATE OR REPLACE FUNCTION public.mark_password_changed(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.admin_users 
  SET metadata = jsonb_set(
    COALESCE(metadata, '{}'), 
    '{has_temp_password}', 
    'false'
  )
  WHERE admin_users.user_id = mark_password_changed.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;