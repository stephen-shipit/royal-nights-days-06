-- Create membership_levels table for admin-defined tiers
CREATE TABLE public.membership_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  perks JSONB NOT NULL DEFAULT '[]'::jsonb,
  duration_months INTEGER NOT NULL DEFAULT 12,
  multi_user_enabled BOOLEAN NOT NULL DEFAULT false,
  max_daily_scans INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create memberships table for user purchases
CREATE TABLE public.memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  membership_level_id UUID NOT NULL REFERENCES public.membership_levels(id) ON DELETE RESTRICT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  qr_code_token TEXT NOT NULL UNIQUE,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
  remaining_daily_scans INTEGER NOT NULL DEFAULT 1,
  last_scan_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  active BOOLEAN NOT NULL DEFAULT true,
  stripe_session_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create membership_scan_logs table for tracking scans
CREATE TABLE public.membership_scan_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  membership_id UUID NOT NULL REFERENCES public.memberships(id) ON DELETE CASCADE,
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scan_status TEXT NOT NULL,
  event_name TEXT,
  scanned_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.membership_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_scan_logs ENABLE ROW LEVEL SECURITY;

-- Membership Levels Policies
CREATE POLICY "Anyone can view active membership levels"
ON public.membership_levels FOR SELECT
USING (status = 'active');

CREATE POLICY "Admins can view all membership levels"
ON public.membership_levels FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert membership levels"
ON public.membership_levels FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update membership levels"
ON public.membership_levels FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete membership levels"
ON public.membership_levels FOR DELETE
USING (is_admin(auth.uid()));

-- Memberships Policies
CREATE POLICY "Anyone can create memberships"
ON public.memberships FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own membership by token"
ON public.memberships FOR SELECT
USING (true);

CREATE POLICY "Admins can view all memberships"
ON public.memberships FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update memberships"
ON public.memberships FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete memberships"
ON public.memberships FOR DELETE
USING (is_admin(auth.uid()));

-- Scan Logs Policies
CREATE POLICY "Anyone can insert scan logs"
ON public.membership_scan_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view scan logs"
ON public.membership_scan_logs FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Public can view scan logs for their membership"
ON public.membership_scan_logs FOR SELECT
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_membership_levels_updated_at
BEFORE UPDATE ON public.membership_levels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at
BEFORE UPDATE ON public.memberships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to reset daily scans at midnight
CREATE OR REPLACE FUNCTION public.reset_membership_daily_scans()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.memberships m
  SET 
    remaining_daily_scans = ml.max_daily_scans,
    last_scan_reset_date = CURRENT_DATE
  FROM public.membership_levels ml
  WHERE m.membership_level_id = ml.id
  AND m.last_scan_reset_date < CURRENT_DATE
  AND m.active = true;
END;
$$;

-- Function to validate and process QR scan
CREATE OR REPLACE FUNCTION public.validate_membership_scan(p_qr_token TEXT, p_event_name TEXT DEFAULT NULL, p_scanned_by UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_membership RECORD;
  v_level RECORD;
  v_result JSONB;
BEGIN
  -- First reset any outdated daily scans
  PERFORM public.reset_membership_daily_scans();
  
  -- Find the membership
  SELECT m.*, ml.name as level_name, ml.max_daily_scans, ml.multi_user_enabled
  INTO v_membership
  FROM public.memberships m
  JOIN public.membership_levels ml ON m.membership_level_id = ml.id
  WHERE m.qr_code_token = p_qr_token;
  
  -- Check if membership exists
  IF v_membership IS NULL THEN
    INSERT INTO public.membership_scan_logs (membership_id, scan_status, event_name, scanned_by)
    VALUES (NULL, 'invalid', p_event_name, p_scanned_by);
    
    RETURN jsonb_build_object(
      'status', 'invalid',
      'message', 'Membership not found',
      'color', 'red'
    );
  END IF;
  
  -- Check if membership is active
  IF v_membership.active = false THEN
    INSERT INTO public.membership_scan_logs (membership_id, scan_status, event_name, scanned_by)
    VALUES (v_membership.id, 'inactive', p_event_name, p_scanned_by);
    
    RETURN jsonb_build_object(
      'status', 'inactive',
      'message', 'Membership is inactive',
      'color', 'red',
      'member_name', v_membership.full_name,
      'level', v_membership.level_name
    );
  END IF;
  
  -- Check if membership is expired
  IF v_membership.expiration_date < now() THEN
    INSERT INTO public.membership_scan_logs (membership_id, scan_status, event_name, scanned_by)
    VALUES (v_membership.id, 'expired', p_event_name, p_scanned_by);
    
    RETURN jsonb_build_object(
      'status', 'expired',
      'message', 'Membership has expired',
      'color', 'red',
      'member_name', v_membership.full_name,
      'level', v_membership.level_name,
      'expiration_date', v_membership.expiration_date
    );
  END IF;
  
  -- Check if payment is complete
  IF v_membership.payment_status != 'completed' THEN
    INSERT INTO public.membership_scan_logs (membership_id, scan_status, event_name, scanned_by)
    VALUES (v_membership.id, 'unpaid', p_event_name, p_scanned_by);
    
    RETURN jsonb_build_object(
      'status', 'unpaid',
      'message', 'Payment not completed',
      'color', 'red',
      'member_name', v_membership.full_name,
      'level', v_membership.level_name
    );
  END IF;
  
  -- Check daily scan limit
  IF v_membership.remaining_daily_scans <= 0 THEN
    INSERT INTO public.membership_scan_logs (membership_id, scan_status, event_name, scanned_by)
    VALUES (v_membership.id, 'limit_reached', p_event_name, p_scanned_by);
    
    RETURN jsonb_build_object(
      'status', 'limit_reached',
      'message', 'Daily scan limit reached',
      'color', 'yellow',
      'member_name', v_membership.full_name,
      'level', v_membership.level_name,
      'max_scans', v_membership.max_daily_scans
    );
  END IF;
  
  -- Valid scan - decrement remaining scans and log
  UPDATE public.memberships
  SET remaining_daily_scans = remaining_daily_scans - 1
  WHERE id = v_membership.id;
  
  INSERT INTO public.membership_scan_logs (membership_id, scan_status, event_name, scanned_by)
  VALUES (v_membership.id, 'valid', p_event_name, p_scanned_by);
  
  RETURN jsonb_build_object(
    'status', 'valid',
    'message', 'Access granted',
    'color', 'green',
    'member_name', v_membership.full_name,
    'level', v_membership.level_name,
    'remaining_scans', v_membership.remaining_daily_scans - 1,
    'max_scans', v_membership.max_daily_scans,
    'multi_user', v_membership.multi_user_enabled
  );
END;
$$;