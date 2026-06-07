-- Migration 014: Add last_resent_at to invoices for resend rate limiting.
-- Without this column, the resend endpoint has no cooldown and can be used
-- to repeatedly spam a client's inbox or exhaust the Resend email quota.

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS last_resent_at TIMESTAMPTZ;
