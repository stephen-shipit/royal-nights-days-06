-- Add card_image_url column to membership_levels table
ALTER TABLE public.membership_levels
ADD COLUMN card_image_url text;