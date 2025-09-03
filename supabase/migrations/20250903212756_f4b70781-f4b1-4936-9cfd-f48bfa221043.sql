-- Drop existing INSERT policy and create a proper one for anonymous users
DROP POLICY IF EXISTS "Allow anonymous and authenticated users to create reservations" ON public.table_reservations;
DROP POLICY IF EXISTS "Public can create table reservations" ON public.table_reservations;

-- Create a policy that explicitly allows anonymous users to insert reservations
CREATE POLICY "Anonymous users can create reservations" 
ON public.table_reservations 
FOR INSERT 
WITH CHECK (true);

-- Verify SELECT policy is admin-only (this should already exist)
DROP POLICY IF EXISTS "Only admins can view table reservations" ON public.table_reservations;
CREATE POLICY "Only admins can view table reservations" 
ON public.table_reservations 
FOR SELECT 
USING (public.is_admin(auth.uid()));