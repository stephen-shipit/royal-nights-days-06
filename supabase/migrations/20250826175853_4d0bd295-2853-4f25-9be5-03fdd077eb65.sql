-- Clean up incorrect dining reservations that have charges or event_ids (should be nightlife)
-- These are dining reservations that went through payment flow and should be nightlife
UPDATE public.table_reservations 
SET 
  reservation_type = 'nightlife',
  time_slot = '9pm-5am'
WHERE reservation_type = 'dining' 
  AND (total_price > 0 OR event_id IS NOT NULL);

-- Set all true dining reservations to have zero price and no event_id
UPDATE public.table_reservations 
SET 
  total_price = 0,
  event_id = NULL,
  time_slot = '3pm-9pm'
WHERE reservation_type = 'dining' 
  AND event_id IS NULL 
  AND total_price = 0;