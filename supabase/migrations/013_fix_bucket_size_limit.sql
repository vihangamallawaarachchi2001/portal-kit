-- Migration 013: Align storage bucket file_size_limit with app validation.
-- The bucket was created with a 10 MB limit but lib/validations.ts allows 50 MB.
-- Files between 10-50 MB pass client-side validation then fail at Supabase Storage.

UPDATE storage.buckets
SET file_size_limit = 52428800  -- 50 MB (matches MAX_FILE_SIZE in lib/validations.ts)
WHERE id = 'portalkit_bucket';
