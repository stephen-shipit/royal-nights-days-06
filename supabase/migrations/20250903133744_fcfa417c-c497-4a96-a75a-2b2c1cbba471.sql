-- Fix the RLS policy for table_reservations to ensure proper public access for reservations
-- Drop existing policies and recreate them with proper conditions

DROP POLICY IF EXISTS "Anyone can create table reservations" ON public.table_reservations;
DROP POLICY IF EXISTS "Only admins can view table reservations" ON public.table_reservations;
DROP POLICY IF EXISTS "Admins can update table reservations" ON public.table_reservations;
DROP POLICY IF EXISTS "Admins can delete table reservations" ON public.table_reservations;

-- Create new policies with proper conditions
CREATE POLICY "Anyone can create table reservations" 
ON public.table_reservations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can view table reservations" 
ON public.table_reservations 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update table reservations" 
ON public.table_reservations 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete table reservations" 
ON public.table_reservations 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Ensure RLS is enabled
ALTER TABLE public.table_reservations ENABLE ROW LEVEL SECURITY;