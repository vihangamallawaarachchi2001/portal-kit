import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { ok, created, unauthorized, notFound, badRequest, internalError, fromZodError } from '@/lib/api'
import { sendMessageSchema } from '@/lib/validations'
import { sendPushToSubscriber } from '@/lib/web-push'
import { getNotificationPref } from '@/lib/notification-prefs'
import { cookies } from 'next/headers'
import { ZodError } from 'zod'

async function getCallerContext(projectId: string) {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const clientId = cookieStore.get('portal_client_id')?.value

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !clientId) return null

  const service = createServiceClient()
  const { data: project } = await service
    .from('projects')
    .select('id, freelancer_id, title, clients(id, name, email, portal_slug)')
    .eq('id', projectId)
    .is('deleted_at', null)
    .single()

  if (!project) return null

  // Freelancer auth takes priority — always trust Supabase session first
  if (user && project.freelancer_id === user.id) {
    return { type: 'freelancer' as const, userId: user.id, project }
  }

  // Portal client second — only if no authenticated freelancer session
  const client = Array.isArray(project.clients) ? project.clients[0] : project.clients
  if (clientId && client?.id === clientId) {
    return { type: 'client' as const, clientId, project }
  }

  return null
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await getCallerContext(id)
  if (!ctx) return unauthorized()

  const { searchParams } = new URL(req.url)
  const since = searchParams.get('since')

  const service = createServiceClient()
  let query = service
    .from('messages')
    .select('*, profiles:sender_id(id, full_name, avatar_url)')
    .eq('project_id', id)
    .order('created_at', { ascending: true })

  if (since) query = query.gt('created_at', since)
  query = query.limit(500)

  const { data, error } = await query
  if (error) return internalError(error.message)
  return ok(data)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await getCallerContext(id)
  if (!ctx) return unauthorized()

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  let input
  try {
    input = sendMessageSchema.parse({ ...body, sender_type: ctx.type })
  } catch (e) { return fromZodError(e as ZodError) }

  const service = createServiceClient()
  const { data, error } = await service
    .from('messages')
    .insert({
      project_id: id,
      sender_type: ctx.type,
      sender_id: ctx.type === 'freelancer' ? ctx.userId : null,
      content: input.content,
    })
    .select()
    .single()

  if (error) return internalError(error.message)

  // Push notification to the OTHER party
  const project = ctx.project
  const client  = Array.isArray(project.clients) ? project.clients[0] : project.clients
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const preview = input.content.length > 120 ? input.content.slice(0, 117) + '…' : input.content

  if (ctx.type === 'freelancer') {
    // Notify portal client (no preference check — clients manage their own browser permission)
    if (client?.id) {
      sendPushToSubscriber('client', client.id, {
        title: `New message on ${project.title}`,
        body:  preview,
        tag:   `message-${project.id}`,
        data:  { url: `${appUrl}/p/${client.portal_slug}/messages` },
      }).catch(() => {})
    }
  } else {
    // Notify freelancer — respect their messages preference
    getNotificationPref(project.freelancer_id, 'messages').then(allowed => {
      if (!allowed) return
      sendPushToSubscriber('freelancer', project.freelancer_id, {
        title: `${client?.name ?? 'Client'} sent a message`,
        body:  preview,
        tag:   `message-${project.id}`,
        data:  { url: `${appUrl}/dashboard/chats` },
      }).catch(() => {})
    }).catch(() => {})
  }

  return created(data)
}

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await getCallerContext(id)
  if (!ctx) return unauthorized()

  // Mark all messages as read for this project (from the opposite sender)
  const service = createServiceClient()
  const oppositeType = ctx.type === 'freelancer' ? 'client' : 'freelancer'

  const { error } = await service
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('project_id', id)
    .eq('sender_type', oppositeType)
    .is('read_at', null)

  if (error) return internalError(error.message)
  return ok({ marked_read: true })
}
