-- Add notification_preferences column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT '{"messages":true,"file_review":true,"invoice_paid":true,"status_change":false}';
