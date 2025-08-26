-- Add screen display image URL column to table_reservations
ALTER TABLE public.table_reservations 
ADD COLUMN screen_display_image_url TEXT;