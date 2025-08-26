-- Delete the problematic user (stephenx_99@yahoo.com)
DELETE FROM public.admin_users WHERE email = 'stephenx_99@yahoo.com';
DELETE FROM auth.users WHERE email = 'stephenx_99@yahoo.com';