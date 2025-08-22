-- Add form_submission notification settings using the same emails as reservation_confirmed
INSERT INTO notification_settings (email, notification_type, is_active) VALUES
('elvisngyia@gmail.com', 'form_submission', true),
('info@royalpalacedtx.com', 'form_submission', true),
('pmuchilwa@gmail.com', 'form_submission', true),
('stephen.munabo@gmail.com', 'form_submission', true);