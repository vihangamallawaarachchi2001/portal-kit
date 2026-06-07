-- Add freelancer's preferred base currency to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS base_currency VARCHAR(3) NOT NULL DEFAULT 'USD';

-- Add parent_file_id to files for review attachment linkage
-- When a client uploads a file as part of a "request changes" review,
-- parent_file_id points to the file being reviewed.
ALTER TABLE public.files
  ADD COLUMN IF NOT EXISTS parent_file_id UUID REFERENCES public.files(id) ON DELETE SET NULL;
