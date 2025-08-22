-- Create flexible form_data table
CREATE TABLE public.form_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_type TEXT NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}',
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  submission_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'contacted', 'archived')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.form_data ENABLE ROW LEVEL SECURITY;

-- Create policies for form_data table
CREATE POLICY "Anyone can create form submissions" 
ON public.form_data 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can view form submissions" 
ON public.form_data 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can update form submissions" 
ON public.form_data 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete form submissions" 
ON public.form_data 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_form_data_updated_at
BEFORE UPDATE ON public.form_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_form_data_type ON public.form_data(form_type);
CREATE INDEX idx_form_data_status ON public.form_data(status);
CREATE INDEX idx_form_data_email ON public.form_data(email);
CREATE INDEX idx_form_data_date ON public.form_data(submission_date DESC);