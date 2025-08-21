-- Add fields to events table for blocking table reservations
ALTER TABLE public.events 
ADD COLUMN block_table_reservations boolean DEFAULT false,
ADD COLUMN external_reservation_url text,
ADD COLUMN block_message text DEFAULT 'This is a special event, for table reservations please purchase here';