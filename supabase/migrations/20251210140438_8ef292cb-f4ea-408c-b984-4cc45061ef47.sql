-- Create enum types for employment type and application status
CREATE TYPE public.employment_type AS ENUM ('full-time', 'part-time', 'gig', 'contractor');
CREATE TYPE public.job_status AS ENUM ('active', 'archived');
CREATE TYPE public.application_status AS ENUM ('new', 'reviewing', 'interview', 'rejected', 'hired');

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  employment_type public.employment_type NOT NULL DEFAULT 'full-time',
  compensation TEXT,
  location TEXT NOT NULL DEFAULT 'Addison, TX',
  status public.job_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job_applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city_state TEXT NOT NULL,
  resume_url TEXT,
  cover_letter_url TEXT,
  experience_summary TEXT NOT NULL,
  availability TEXT NOT NULL,
  late_night_ok BOOLEAN NOT NULL DEFAULT false,
  start_date DATE NOT NULL,
  status public.application_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Jobs RLS policies
CREATE POLICY "Anyone can view active jobs"
ON public.jobs
FOR SELECT
USING (status = 'active');

CREATE POLICY "Admins can view all jobs"
ON public.jobs
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert jobs"
ON public.jobs
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update jobs"
ON public.jobs
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete jobs"
ON public.jobs
FOR DELETE
USING (is_admin(auth.uid()));

-- Job applications RLS policies
CREATE POLICY "Anyone can submit applications"
ON public.job_applications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all applications"
ON public.job_applications
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update applications"
ON public.job_applications
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete applications"
ON public.job_applications
FOR DELETE
USING (is_admin(auth.uid()));

-- Create updated_at triggers
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
BEFORE UPDATE ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX idx_job_applications_status ON public.job_applications(status);