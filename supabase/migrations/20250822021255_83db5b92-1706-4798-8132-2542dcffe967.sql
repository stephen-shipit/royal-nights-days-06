-- First, just make event_id nullable
ALTER TABLE public.table_reservations 
ALTER COLUMN event_id DROP NOT NULL;

-- Update existing dining reservations to have null event_id
UPDATE public.table_reservations 
SET event_id = NULL 
WHERE reservation_type = 'dining';

-- Now add the constraint to ensure future consistency
ALTER TABLE public.table_reservations 
ADD CONSTRAINT check_reservation_type_event_consistency 
CHECK (
  (reservation_type = 'dining' AND event_id IS NULL) OR
  (reservation_type = 'entertainment' AND event_id IS NOT NULL)
);