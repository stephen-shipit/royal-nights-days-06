-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.cleanup_expired_reservations()
RETURNS void AS $$
BEGIN
  DELETE FROM public.table_reservations 
  WHERE status = 'pending' 
  AND expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_table_available(p_event_id uuid, p_table_id uuid)
RETURNS boolean AS $$
BEGIN
  -- First clean up expired reservations
  PERFORM public.cleanup_expired_reservations();
  
  -- Check if table is available (no confirmed or pending reservations)
  RETURN NOT EXISTS (
    SELECT 1 FROM public.table_reservations 
    WHERE event_id = p_event_id 
    AND table_id = p_table_id 
    AND status IN ('confirmed', 'pending')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;