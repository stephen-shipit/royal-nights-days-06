-- Make event_id nullable to allow dinner reservations without events
ALTER TABLE public.table_reservations 
ALTER COLUMN event_id DROP NOT NULL;

-- Add a check to ensure reservation_type is consistent with event_id
-- If reservation_type is 'dining', event_id should be null
-- If reservation_type is 'entertainment', event_id should not be null
ALTER TABLE public.table_reservations 
ADD CONSTRAINT check_reservation_type_event_consistency 
CHECK (
  (reservation_type = 'dining' AND event_id IS NULL) OR
  (reservation_type = 'entertainment' AND event_id IS NOT NULL)
);