-- Update existing notification settings to use correct email domain
UPDATE public.notification_settings 
SET email = REPLACE(email, '@royalpalace.com', '@royalpalacedtx.email')
WHERE email LIKE '%@royalpalace.com';

-- Insert notification settings for form submissions with correct domain
INSERT INTO public.notification_settings (email, notification_type) VALUES
('admin@royalpalacedtx.email', 'form_submission'),
('manager@royalpalacedtx.email', 'form_submission')
ON CONFLICT DO NOTHING;