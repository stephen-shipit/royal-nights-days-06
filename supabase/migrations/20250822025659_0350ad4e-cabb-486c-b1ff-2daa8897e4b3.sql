-- Insert notification settings for form submissions
INSERT INTO public.notification_settings (email, notification_type) VALUES
('admin@royalpalace.com', 'form_submission'),
('manager@royalpalace.com', 'form_submission')
ON CONFLICT DO NOTHING;