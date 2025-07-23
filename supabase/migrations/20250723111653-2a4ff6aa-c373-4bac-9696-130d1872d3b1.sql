-- Add featured column to events table
ALTER TABLE public.events 
ADD COLUMN featured boolean NOT NULL DEFAULT false;

-- Create index for better performance when querying featured events
CREATE INDEX idx_events_featured ON public.events(featured) WHERE featured = true;