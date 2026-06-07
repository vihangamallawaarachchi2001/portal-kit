-- Add Stripe Connect fields and bank details to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_connect_account_id VARCHAR,
  ADD COLUMN IF NOT EXISTS stripe_connect_onboarded  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS bank_details               JSONB;
