-- Add pricing premium columns to membership_levels table
ALTER TABLE public.membership_levels
ADD COLUMN IF NOT EXISTS premium_1_month integer NOT NULL DEFAULT 20,
ADD COLUMN IF NOT EXISTS premium_2_months integer NOT NULL DEFAULT 15,
ADD COLUMN IF NOT EXISTS premium_3_months integer NOT NULL DEFAULT 10;

-- Add comment for clarity
COMMENT ON COLUMN public.membership_levels.premium_1_month IS 'Percentage premium added for 1-month purchases';
COMMENT ON COLUMN public.membership_levels.premium_2_months IS 'Percentage premium added for 2-month purchases';
COMMENT ON COLUMN public.membership_levels.premium_3_months IS 'Percentage premium added for 3-month purchases';