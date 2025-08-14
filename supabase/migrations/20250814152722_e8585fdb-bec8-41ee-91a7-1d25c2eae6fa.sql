-- Fix critical security vulnerability: Remove public access to payment data
-- Only admins should be able to view payment information for management purposes

-- Drop the existing policy that allows anyone to view payments
DROP POLICY IF EXISTS "Anyone can view payments" ON payments;

-- Create a new policy that only allows admins to view payment records
CREATE POLICY "Only admins can view payments" 
ON payments 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Keep the existing policies for creating payments (needed for checkout flow)
-- "Anyone can create payments" remains unchanged
-- "Admins can update payments" remains unchanged

-- Note: This secures all sensitive payment data including:
-- - Stripe session IDs (could be exploited if exposed)
-- - Payment amounts (private financial information) 
-- - Payment statuses (sensitive transaction data)
-- - Links to customer reservations (privacy concern)