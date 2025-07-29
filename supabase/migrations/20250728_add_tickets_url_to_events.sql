-- Add tickets_url column to events table
ALTER TABLE public.events 
ADD COLUMN tickets_url text;

-- Add comment for documentation
COMMENT ON COLUMN public.events.tickets_url IS 'URL for purchasing tickets to the event';