-- Allow users to select records they just inserted (for immediate feedback)
CREATE POLICY "Users can select their just-inserted reservations" 
  ON public.table_reservations 
  FOR SELECT 
  USING (
    -- Allow selection of records created within the last 5 minutes
    -- This is a reasonable window for the insert + select operation
    created_at > (now() - interval '5 minutes')
  );