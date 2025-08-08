-- Remove the existing unique constraint
ALTER TABLE public.table_reservations DROP CONSTRAINT IF EXISTS table_reservations_event_id_table_id_key;

-- Add expires_at column for pending reservations
ALTER TABLE public.table_reservations ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;

-- Create new partial unique constraint that only applies to confirmed reservations
CREATE UNIQUE INDEX table_reservations_confirmed_unique 
ON public.table_reservations (event_id, table_id) 
WHERE status = 'confirmed';

-- Create function to clean up expired pending reservations
CREATE OR REPLACE FUNCTION public.cleanup_expired_reservations()
RETURNS void AS $$
BEGIN
  DELETE FROM public.table_reservations 
  WHERE status = 'pending' 
  AND expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check table availability (including pending reservations)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;