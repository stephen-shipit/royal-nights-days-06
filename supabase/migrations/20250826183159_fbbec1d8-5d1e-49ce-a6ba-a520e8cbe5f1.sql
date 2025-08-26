-- Add check-in and check-out tracking fields to table_reservations
ALTER TABLE public.table_reservations 
ADD COLUMN checked_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN checked_out_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN checked_in_by UUID REFERENCES public.admin_users(user_id),
ADD COLUMN checked_out_by UUID REFERENCES public.admin_users(user_id);

-- Create index for better performance on check-in queries
CREATE INDEX idx_table_reservations_checked_in ON public.table_reservations(checked_in_at);
CREATE INDEX idx_table_reservations_checked_out ON public.table_reservations(checked_out_at);

-- Enable real-time for table_reservations
ALTER TABLE public.table_reservations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.table_reservations;