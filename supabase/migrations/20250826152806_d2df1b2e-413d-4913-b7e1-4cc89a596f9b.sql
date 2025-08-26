-- Remove the foreign key constraint that's causing the issue
-- The admin_users table shouldn't have a foreign key to auth.users since we can't guarantee creation order
ALTER TABLE public.admin_users DROP CONSTRAINT IF EXISTS admin_users_user_id_fkey;

-- We'll rely on application logic to maintain referential integrity instead