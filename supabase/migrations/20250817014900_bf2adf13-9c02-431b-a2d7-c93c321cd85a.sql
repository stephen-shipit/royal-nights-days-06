-- Add sold_out field to events table
ALTER TABLE public.events 
ADD COLUMN sold_out boolean NOT NULL DEFAULT false;