-- Create physical card requests table
CREATE TABLE public.physical_card_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  membership_id UUID NOT NULL REFERENCES public.memberships(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ready_at TIMESTAMP WITH TIME ZONE,
  picked_up_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.physical_card_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view their own physical card requests"
ON public.physical_card_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create their own physical card requests"
ON public.physical_card_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all physical card requests"
ON public.physical_card_requests
FOR SELECT
USING (is_admin(auth.uid()));

-- Admins can update requests
CREATE POLICY "Admins can update physical card requests"
ON public.physical_card_requests
FOR UPDATE
USING (is_admin(auth.uid()));

-- Admins can delete requests
CREATE POLICY "Admins can delete physical card requests"
ON public.physical_card_requests
FOR DELETE
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_physical_card_requests_updated_at
BEFORE UPDATE ON public.physical_card_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();