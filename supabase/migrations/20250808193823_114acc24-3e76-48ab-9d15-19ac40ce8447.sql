-- Add location field to venue_tables
ALTER TABLE public.venue_tables 
ADD COLUMN location TEXT;