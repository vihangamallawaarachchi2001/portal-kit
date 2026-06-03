-- =============================================================================
-- PORTALKIT — Storage Bucket + RLS Policies
-- Migration 002: creates portalkit_bucket and defines per-folder access rules.
-- =============================================================================
--
-- FOLDER STRUCTURE inside portalkit_bucket
-- ─────────────────────────────────────────
--   avatars/{userId}/{timestamp}.{ext}
--     • Freelancer profile pictures and business logos.
--     • Each user owns their own subfolder — enforced by RLS.
--
--   files/{userId}/{projectId}/{filename}
--     • Project deliverables uploaded by freelancers.
--     • Freelancer owns by userId; clients read via service-role (API layer).
--
-- WHY FOLDER-BASED RLS
-- ─────────────────────
--   storage.foldername(name) returns the path components EXCLUDING the filename.
--   e.g.  'avatars/abc-uuid/1234567890.jpg'  →  ARRAY['avatars', 'abc-uuid']
--   This lets us check (storage.foldername(name))[2] = auth.uid()::text
--   to enforce per-user isolation without parsing filenames.
-- =============================================================================


-- =============================================================================
-- PART 1 — CREATE BUCKET
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portalkit_bucket',
  'portalkit_bucket',
  false,                      -- not world-public; SELECT policy controls access
  10485760,                   -- 10 MB per file
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/zip',
    'application/octet-stream',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- PART 2 — STORAGE RLS POLICIES
-- All policies target storage.objects (Supabase's internal file-metadata table).
-- =============================================================================

-- ── avatars ──────────────────────────────────────────────────────────────────
-- Path pattern: avatars/{userId}/{timestamp}.{ext}
-- (storage.foldername(name))[1] = 'avatars'
-- (storage.foldername(name))[2] = the userId folder

CREATE POLICY "storage: authenticated users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portalkit_bucket'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "storage: authenticated users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portalkit_bucket'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'portalkit_bucket'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Avatars are readable by any authenticated user (needed to display them in UI)
CREATE POLICY "storage: authenticated users can read all avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'portalkit_bucket'
  AND (storage.foldername(name))[1] = 'avatars'
);

CREATE POLICY "storage: authenticated users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portalkit_bucket'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.foldername(name))[2] = auth.uid()::text
);


-- ── project files ─────────────────────────────────────────────────────────────
-- Path pattern: files/{userId}/{projectId}/{filename}
-- (storage.foldername(name))[1] = 'files'
-- (storage.foldername(name))[2] = the freelancer's userId
-- (storage.foldername(name))[3] = the projectId

CREATE POLICY "storage: freelancer can upload project files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portalkit_bucket'
  AND (storage.foldername(name))[1] = 'files'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "storage: freelancer can read own project files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'portalkit_bucket'
  AND (storage.foldername(name))[1] = 'files'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "storage: freelancer can update own project files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portalkit_bucket'
  AND (storage.foldername(name))[1] = 'files'
  AND (storage.foldername(name))[2] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'portalkit_bucket'
  AND (storage.foldername(name))[1] = 'files'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "storage: freelancer can delete own project files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portalkit_bucket'
  AND (storage.foldername(name))[1] = 'files'
  AND (storage.foldername(name))[2] = auth.uid()::text
);
