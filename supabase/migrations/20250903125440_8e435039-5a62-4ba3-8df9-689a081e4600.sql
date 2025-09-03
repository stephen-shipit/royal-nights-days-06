-- Add RLS policies for admin_users table to allow admins to manage all admin users

-- Allow admins to view all admin users (overrides the existing restrictive policy)
CREATE POLICY "Admins can view all admin users" 
ON public.admin_users 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Allow admins to insert new admin users
CREATE POLICY "Admins can insert admin users" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

-- Allow admins to update all admin users (overrides the existing restrictive policy)
CREATE POLICY "Admins can update all admin users" 
ON public.admin_users 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- Allow admins to delete admin users
CREATE POLICY "Admins can delete admin users" 
ON public.admin_users 
FOR DELETE 
USING (is_admin(auth.uid()));