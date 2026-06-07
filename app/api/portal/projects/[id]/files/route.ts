import { createServiceClient } from '@/lib/supabase/service'
import { ok, created, unauthorized, notFound, badRequest, internalError } from '@/lib/api'
import { sendPushToSubscriber } from '@/lib/web-push'
import { cookies } from 'next/headers'

async function getClientAndProject(projectId: string) {
  const cookieStore = await cookies()
  const clientId = cookieStore.get('portal_client_id')?.value
  if (!clientId) return null

  const service = createServiceClient()
  const { data: project } = await service
    .from('projects')
    .select('id, freelancer_id')
    .eq('id', projectId)
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .single()

  if (!project) return null
  return { clientId, project }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await getClientAndProject(id)
  if (!ctx) return unauthorized()

  const service = createServiceClient()
  const { data, error } = await service
    .from('files')
    .select('id, filename, status, file_size, mime_type, created_at')
    .eq('project_id', id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) return internalError(error.message)
  return ok(data ?? [])
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await getClientAndProject(id)
  if (!ctx) return unauthorized()

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  const filename     = typeof body.filename     === 'string' ? body.filename.trim()     : ''
  const storagePath  = typeof body.storage_path === 'string' ? body.storage_path.trim() : ''
  const fileSize     = typeof body.file_size    === 'number' ? body.file_size            : 0
  const mimeType     = typeof body.mime_type    === 'string' ? body.mime_type            : 'application/octet-stream'
  const parentFileId = typeof body.parent_file_id === 'string' ? body.parent_file_id    : null

  if (!filename || !storagePath) return badRequest('filename and storage_path required')

  const service = createServiceClient()
  const { data, error } = await service
    .from('files')
    .insert({
      project_id: id,
      freelancer_id: ctx.project.freelancer_id,
      filename,
      storage_path: storagePath,
      file_size: fileSize,
      mime_type: mimeType,
      status: 'pending',
      version: 1,
      ...(parentFileId ? { parent_file_id: parentFileId } : {}),
    })
    .select()
    .single()

  if (error) return internalError(error.message)

  // Notify freelancer of new client upload (fire-and-forget)
  sendPushToSubscriber('freelancer', ctx.project.freelancer_id, {
    title: 'Client uploaded a file',
    body: `New file "${filename}" is ready for your review`,
    tag: `client-upload-${id}`,
    data: { url: '/dashboard/files' },
  }).catch(() => {})

  return created(data)
}
