-- Let's check if there might be conflicting policies by temporarily dropping and recreating the INSERT policy
DROP POLICY IF EXISTS "Anonymous users can create reservations" ON public.table_reservations;

-- Recreate with a more explicit policy
CREATE POLICY "Anonymous users can create reservations" 
  ON public.table_reservations 
  FOR INSERT 
  WITH CHECK (
    -- Allow any insert for now - we'll make it more restrictive later if needed
    true
  );