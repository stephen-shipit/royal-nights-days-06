-- Add new columns to table_reservations for payment and birthday package
ALTER TABLE public.table_reservations 
ADD COLUMN stripe_session_id TEXT,
ADD COLUMN payment_status TEXT DEFAULT 'pending',
ADD COLUMN birthday_package BOOLEAN DEFAULT false,
ADD COLUMN guest_phone TEXT;

-- Create payments table to track payment history
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID REFERENCES public.table_reservations(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies for payments table
CREATE POLICY "Anyone can view payments" 
ON public.payments 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create payments" 
ON public.payments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can update payments" 
ON public.payments 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- Create trigger for payments updated_at
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();