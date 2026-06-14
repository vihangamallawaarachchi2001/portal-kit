-- Retroactively fix uploaded_by_client for client-uploaded files
-- Portal uploads always use the path suffix "-client.{ext}" (set in /api/portal/projects/[id]/upload)
-- Any standalone root file with that suffix was uploaded by the client, not the freelancer
UPDATE public.files
SET uploaded_by_client = true
WHERE parent_file_id IS NULL
  AND uploaded_by_client = false
  AND storage_path ~ '-client\.[a-zA-Z0-9]+$';
