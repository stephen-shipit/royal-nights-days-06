-- Fix security vulnerability: Remove public access to customer reservation data
-- Only admins should be able to view all reservations for management purposes

-- Drop the existing policy that allows anyone to view table reservations
DROP POLICY IF EXISTS "Anyone can view table reservations" ON table_reservations;

-- Create a new policy that only allows admins to view reservations
CREATE POLICY "Only admins can view table reservations" 
ON table_reservations 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Keep the existing policy for creating reservations (needed for booking flow)
-- "Anyone can create table reservations" remains unchanged

-- Note: If in the future you want to allow authenticated users to view their own reservations,
-- you would need to add a user_id column to link reservations to authenticated users