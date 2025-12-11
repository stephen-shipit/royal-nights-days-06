-- Add user_id column to memberships table to link with auth users
ALTER TABLE public.memberships 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_memberships_user_id ON public.memberships(user_id);

-- Update RLS policy to allow authenticated users to view their own membership
DROP POLICY IF EXISTS "Users can view their own membership by token" ON public.memberships;

CREATE POLICY "Users can view their own membership"
ON public.memberships
FOR SELECT
USING (
  qr_code_token IS NOT NULL 
  OR auth.uid() = user_id 
  OR is_admin(auth.uid())
);

-- Allow authenticated users to update their own membership (for linking account)
CREATE POLICY "Users can update their own membership"
ON public.memberships
FOR UPDATE
USING (auth.uid() = user_id OR is_admin(auth.uid()));