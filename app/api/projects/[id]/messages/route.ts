import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { ok, created, unauthorized, notFound, badRequest, internalError, fromZodError } from '@/lib/api'
import { sendMessageSchema } from '@/lib/validations'
import { sendNewMessageEmail } from '@/lib/email'
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

  // Freelancer
  if (user && project.freelancer_id === user.id) {
    return { type: 'freelancer' as const, userId: user.id, project }
  }

  // Client
  const client = Array.isArray(project.clients) ? project.clients[0] : project.clients
  if (clientId && client?.id === clientId) {
    return { type: 'client' as const, clientId, project }
  }

  return null
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await getCallerContext(id)
  if (!ctx) return unauthorized()

  const service = createServiceClient()
  const { data, error } = await service
    .from('messages')
    .select('*, profiles:sender_id(id, full_name, avatar_url)')
    .eq('project_id', id)
    .order('created_at', { ascending: true })

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

  // Send notification to the OTHER party (debounced by business logic)
  const project = ctx.project
  const client = Array.isArray(project.clients) ? project.clients[0] : project.clients
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  if (ctx.type === 'freelancer') {
    // Notify the client
    if (client?.email) {
      const { data: profile } = await service
        .from('profiles')
        .select('full_name, business_name')
        .eq('id', ctx.userId)
        .single()

      await sendNewMessageEmail({
        to: client.email,
        recipientName: client.name,
        senderName: profile?.full_name ?? '',
        senderBusiness: profile?.business_name || profile?.full_name || '',
        projectTitle: project.title,
        messagePreview: input.content,
        portalUrl: `${appUrl}/p/${client.portal_slug}`,
      }).catch(() => {})
    }
  } else {
    // Notify the freelancer
    const { data: authUser } = await service.auth.admin.getUserById(project.freelancer_id)
    const { data: profile } = await service
      .from('profiles')
      .select('full_name, business_name')
      .eq('id', project.freelancer_id)
      .single()

    if (authUser?.user?.email) {
      await sendNewMessageEmail({
        to: authUser.user.email,
        recipientName: profile?.full_name ?? '',
        senderName: client?.name ?? 'Client',
        senderBusiness: client?.name ?? '',
        projectTitle: project.title,
        messagePreview: input.content,
        portalUrl: `${appUrl}/dashboard/clients/${client?.id}`,
      }).catch(() => {})
    }
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
