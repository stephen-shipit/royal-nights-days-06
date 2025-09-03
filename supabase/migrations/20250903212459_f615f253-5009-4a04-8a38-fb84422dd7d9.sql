-- Fix RLS policy for anonymous users - target the correct role
DROP POLICY IF EXISTS "Public can create table reservations" ON public.table_reservations;

-- Create policy that allows both anonymous (anon) and authenticated users to create reservations
CREATE POLICY "Allow anonymous and authenticated users to create reservations" 
ON public.table_reservations 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);