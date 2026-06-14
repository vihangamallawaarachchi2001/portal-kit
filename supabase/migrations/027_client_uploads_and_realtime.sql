-- Track whether a file was uploaded by the client (vs the freelancer)
ALTER TABLE public.files
  ADD COLUMN IF NOT EXISTS uploaded_by_client BOOLEAN NOT NULL DEFAULT false;

-- Add messages table to Supabase Realtime publication so freelancer-side
-- postgres_changes subscriptions actually receive inserts.
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
