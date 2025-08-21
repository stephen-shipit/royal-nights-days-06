-- Create notification settings table for admin email notifications
CREATE TABLE public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  notification_type TEXT NOT NULL DEFAULT 'reservation_confirmed',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "Only admins can view notification settings" 
ON public.notification_settings 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can insert notification settings" 
ON public.notification_settings 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Only admins can update notification settings" 
ON public.notification_settings 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete notification settings" 
ON public.notification_settings 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_notification_settings_updated_at
BEFORE UPDATE ON public.notification_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();