-- Create tables for venue seating management
CREATE TABLE public.venue_tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_number INTEGER NOT NULL,
  max_guests INTEGER NOT NULL DEFAULT 6,
  position_x DECIMAL NOT NULL DEFAULT 0,
  position_y DECIMAL NOT NULL DEFAULT 0,
  width DECIMAL NOT NULL DEFAULT 100,
  height DECIMAL NOT NULL DEFAULT 80,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(table_number)
);

-- Create table reservations
CREATE TABLE public.table_reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  table_id UUID NOT NULL REFERENCES public.venue_tables(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_count INTEGER NOT NULL,
  special_requests TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, table_id)
);

-- Enable RLS
ALTER TABLE public.venue_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_reservations ENABLE ROW LEVEL SECURITY;

-- Create policies for venue_tables
CREATE POLICY "Anyone can view venue tables" 
ON public.venue_tables 
FOR SELECT 
USING (true);

-- Create policies for table_reservations
CREATE POLICY "Anyone can view table reservations" 
ON public.table_reservations 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create table reservations" 
ON public.table_reservations 
FOR INSERT 
WITH CHECK (true);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_venue_tables_updated_at
BEFORE UPDATE ON public.venue_tables
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_table_reservations_updated_at
BEFORE UPDATE ON public.table_reservations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample venue tables based on the seating chart
INSERT INTO public.venue_tables (table_number, max_guests, position_x, position_y) VALUES
-- Top row
(34, 8, 320, 80),
(7, 6, 420, 80), 
(8, 6, 520, 80),
(81, 6, 720, 80),
(77, 6, 820, 80),
(20, 8, 1020, 80),

-- Second row  
(37, 8, 80, 180),
(33, 8, 320, 180),
(74, 6, 420, 180),
(75, 6, 520, 180), 
(76, 6, 720, 180),
(23, 6, 820, 180),
(19, 10, 1020, 180),

-- Third row
(36, 8, 80, 280),
(78, 6, 420, 280),
(79, 6, 720, 280),
(80, 6, 820, 280),
(18, 8, 1020, 280),

-- Bottom row
(35, 8, 80, 380),
(32, 8, 180, 380),
(28, 10, 320, 380),
(27, 6, 720, 380),
(24, 6, 820, 380),
(21, 6, 920, 380),
(17, 8, 1020, 380);