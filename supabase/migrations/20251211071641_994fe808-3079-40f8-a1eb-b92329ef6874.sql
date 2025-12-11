-- Update validate_membership_scan to prevent duplicate event scans unless multi_user_enabled
CREATE OR REPLACE FUNCTION public.validate_membership_scan(p_qr_token text, p_event_name text DEFAULT NULL::text, p_scanned_by uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_membership RECORD;
  v_level RECORD;
  v_result JSONB;
  v_already_scanned BOOLEAN;
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
  
  -- Check if card was already scanned for this event (only if event_name is provided and multi_user is NOT enabled)
  IF p_event_name IS NOT NULL AND v_membership.multi_user_enabled = false THEN
    SELECT EXISTS (
      SELECT 1 FROM public.membership_scan_logs
      WHERE membership_id = v_membership.id
      AND event_name = p_event_name
      AND scan_status = 'valid'
      AND DATE(scanned_at) = CURRENT_DATE
    ) INTO v_already_scanned;
    
    IF v_already_scanned THEN
      INSERT INTO public.membership_scan_logs (membership_id, scan_status, event_name, scanned_by)
      VALUES (v_membership.id, 'already_scanned', p_event_name, p_scanned_by);
      
      RETURN jsonb_build_object(
        'status', 'already_scanned',
        'message', 'Card already scanned for this event',
        'color', 'yellow',
        'member_name', v_membership.full_name,
        'level', v_membership.level_name
      );
    END IF;
  END IF;
  
  -- Check daily scan limit (only applies if multi_user_enabled)
  IF v_membership.multi_user_enabled AND v_membership.remaining_daily_scans <= 0 THEN
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
  
  -- Valid scan - decrement remaining scans if multi_user_enabled and log
  IF v_membership.multi_user_enabled THEN
    UPDATE public.memberships
    SET remaining_daily_scans = remaining_daily_scans - 1
    WHERE id = v_membership.id;
  END IF;
  
  INSERT INTO public.membership_scan_logs (membership_id, scan_status, event_name, scanned_by)
  VALUES (v_membership.id, 'valid', p_event_name, p_scanned_by);
  
  RETURN jsonb_build_object(
    'status', 'valid',
    'message', 'Access granted',
    'color', 'green',
    'member_name', v_membership.full_name,
    'level', v_membership.level_name,
    'remaining_scans', CASE WHEN v_membership.multi_user_enabled THEN v_membership.remaining_daily_scans - 1 ELSE 1 END,
    'max_scans', v_membership.max_daily_scans,
    'multi_user', v_membership.multi_user_enabled
  );
END;
$function$;