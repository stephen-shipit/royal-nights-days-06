-- Just make event_id nullable without constraint for now
ALTER TABLE public.table_reservations 
ALTER COLUMN event_id DROP NOT NULL;

-- Update existing dining reservations to have null event_id
UPDATE public.table_reservations 
SET event_id = NULL 
WHERE reservation_type = 'dining';