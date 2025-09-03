-- Fix RLS policy for table_reservations to properly allow anonymous users
-- Drop the existing policy and recreate it with explicit permissions
DROP POLICY IF EXISTS "Anyone can create table reservations" ON public.table_reservations;

-- Create a new INSERT policy that explicitly allows anonymous users
CREATE POLICY "Public can create table reservations" 
ON public.table_reservations 
FOR INSERT 
TO public
WITH CHECK (true);

-- Ensure the policy for viewing reservations is admin-only (keep existing)
-- This policy should already exist but let's make sure it's correct
DROP POLICY IF EXISTS "Only admins can view table reservations" ON public.table_reservations;
CREATE POLICY "Only admins can view table reservations" 
ON public.table_reservations 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Ensure update and delete policies remain admin-only
DROP POLICY IF EXISTS "Admins can update table reservations" ON public.table_reservations;
CREATE POLICY "Admins can update table reservations" 
ON public.table_reservations 
FOR UPDATE 
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete table reservations" ON public.table_reservations;
CREATE POLICY "Admins can delete table reservations" 
ON public.table_reservations 
FOR DELETE 
USING (public.is_admin(auth.uid()));