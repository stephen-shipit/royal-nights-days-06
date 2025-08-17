-- Add booking percentage field to events table
ALTER TABLE public.events 
ADD COLUMN booking_percentage integer DEFAULT 0 CHECK (booking_percentage >= 0 AND booking_percentage <= 100);