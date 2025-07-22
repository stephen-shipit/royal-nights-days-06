-- Add reservation price to venue tables
ALTER TABLE public.venue_tables 
ADD COLUMN reservation_price INTEGER DEFAULT 0; -- Price in cents

-- Add reservation type and time slot to table reservations
ALTER TABLE public.table_reservations 
ADD COLUMN reservation_type TEXT DEFAULT 'dining' CHECK (reservation_type IN ('dining', 'nightlife')),
ADD COLUMN time_slot TEXT DEFAULT '3pm-9pm',
ADD COLUMN total_price INTEGER DEFAULT 0; -- Total price paid in cents

-- Update existing reservations to have default values
UPDATE public.table_reservations 
SET reservation_type = 'dining', time_slot = '3pm-9pm' 
WHERE reservation_type IS NULL;