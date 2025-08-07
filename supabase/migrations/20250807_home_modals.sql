-- Create home_modals table
CREATE TABLE IF NOT EXISTS public.home_modals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  primary_button_text TEXT DEFAULT 'Plan Your Event',
  primary_button_action TEXT DEFAULT 'plan-event',
  secondary_button_text TEXT DEFAULT 'Reserve a Table',
  secondary_button_action TEXT DEFAULT 'reservation',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.home_modals ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view active modals" ON public.home_modals
  FOR SELECT
  USING (is_active = true);

-- Create policy for admin operations
CREATE POLICY "Admins can perform all operations" ON public.home_modals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_home_modals_updated_at
  BEFORE UPDATE ON public.home_modals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample modal data
INSERT INTO public.home_modals (title, description, image_url, primary_button_text, primary_button_action, secondary_button_text, secondary_button_action, is_active)
VALUES 
  (
    'Host Your Private Event',
    'Transform your special occasion into an unforgettable experience at Royal Palace. Our elegant venue and exceptional service ensure your event is nothing short of extraordinary.',
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop',
    'Plan Your Event',
    'plan-event',
    'Reserve a Table',
    'reservation',
    true
  );