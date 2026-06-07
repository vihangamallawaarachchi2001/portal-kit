import { createServiceClient } from '@/lib/supabase/service'
import { ok, created, unauthorized, notFound, badRequest, internalError } from '@/lib/api'
import { sendPushToSubscriber } from '@/lib/web-push'
import { getNotificationPref } from '@/lib/notification-prefs'
import { cookies } from 'next/headers'

async function getPortalContext(projectId: string) {
  const cookieStore = await cookies()
  const clientId = cookieStore.get('portal_client_id')?.value
  if (!clientId) return null

  const service = createServiceClient()
  const { data: project } = await service
    .from('projects')
    .select('id, freelancer_id, title, clients!inner(id, name, email, portal_slug)')
    .eq('id', projectId)
    .eq('clients.id', clientId)
    .is('deleted_at', null)
    .single()

  if (!project) return null
  const client = Array.isArray(project.clients) ? project.clients[0] : project.clients
  return { clientId, project, client }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await getPortalContext(id)
  if (!ctx) return unauthorized()

  const { searchParams } = new URL(req.url)
  const since = searchParams.get('since')

  const service = createServiceClient()
  let query = service
    .from('messages')
    .select('id, project_id, sender_type, sender_id, content, read_at, created_at')
    .eq('project_id', id)
    .order('created_at', { ascending: true })

  if (since) query = query.gt('created_at', since)
  query = query.limit(500)

  const { data, error } = await query
  if (error) return internalError(error.message)
  return ok(data ?? [])
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await getPortalContext(id)
  if (!ctx) return unauthorized()

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  const content = typeof body.content === 'string' ? body.content.trim() : ''
  if (!content) return badRequest('content is required')

  const service = createServiceClient()
  const { data, error } = await service
    .from('messages')
    .insert({
      project_id: id,
      sender_type: 'client',
      sender_id: null,
      content,
    })
    .select()
    .single()

  if (error) return internalError(error.message)

  // Push notification to the freelancer (respects their notification preference)
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const preview = content.length > 120 ? content.slice(0, 117) + '…' : content
  getNotificationPref(ctx.project.freelancer_id, 'messages').then(allowed => {
    if (!allowed) return
    sendPushToSubscriber('freelancer', ctx.project.freelancer_id, {
      title: `${ctx.client?.name ?? 'Client'} sent a message`,
      body:  preview,
      tag:   `message-${ctx.project.id}`,
      data:  { url: `${appUrl}/dashboard/chats` },
    }).catch(() => {})
  }).catch(() => {})

  return created(data)
}

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await getPortalContext(id)
  if (!ctx) return unauthorized()

  const service = createServiceClient()
  const { error } = await service
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('project_id', id)
    .eq('sender_type', 'freelancer')
    .is('read_at', null)

  if (error) return internalError(error.message)
  return ok({ marked_read: true })
}
