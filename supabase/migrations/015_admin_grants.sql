-- Migration 015: Add plan grant columns for admin-issued free Pro/Business access.
-- Allows the admin panel to grant timed plan upgrades to UAT testers / early users
-- without requiring a Stripe subscription. The cleanup cron reverts expired grants.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_grant_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS plan_grant_note       TEXT;
