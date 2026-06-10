-- Migration 022: Track monthly invoice usage on Free plan
-- free_invoices_month_count: invoices created in the current calendar month
-- free_invoices_month_reset: the month-start date when the counter was last reset
-- Both are only meaningful when profiles.plan = 'free'. The API resets the counter
-- when the calendar month changes and increments it on each successful invoice creation.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS free_invoices_month_count INT  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS free_invoices_month_reset DATE;
