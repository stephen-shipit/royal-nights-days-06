-- Add amount_paid column to track actual payment amounts
ALTER TABLE public.memberships 
ADD COLUMN IF NOT EXISTS amount_paid integer DEFAULT 0;

-- Update existing completed memberships with calculated amounts based on duration
UPDATE public.memberships m
SET amount_paid = (
  SELECT 
    CASE 
      -- Calculate months between purchase and expiration
      WHEN EXTRACT(MONTH FROM AGE(m.expiration_date, m.purchase_date)) >= 11 THEN ml.price  -- Annual
      WHEN EXTRACT(MONTH FROM AGE(m.expiration_date, m.purchase_date)) >= 2 THEN 
        ROUND((ml.price / 12.0) * 3 * (1 + ml.premium_3_months / 100.0))  -- 3 months
      WHEN EXTRACT(MONTH FROM AGE(m.expiration_date, m.purchase_date)) >= 1 THEN 
        ROUND((ml.price / 12.0) * 2 * (1 + ml.premium_2_months / 100.0))  -- 2 months
      ELSE 
        ROUND((ml.price / 12.0) * 1 * (1 + ml.premium_1_month / 100.0))  -- 1 month
    END
  FROM public.membership_levels ml 
  WHERE ml.id = m.membership_level_id
)
WHERE m.payment_status = 'completed' AND m.amount_paid = 0;