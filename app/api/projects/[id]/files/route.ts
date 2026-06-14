import { createClient } from '@/lib/supabase/server'
import { ok, created, unauthorized, notFound, badRequest, internalError, fromZodError } from '@/lib/api'
import { registerFileSchema } from '@/lib/validations'
import { sendFileUploadedEmail } from '@/lib/email'
import { sendPushToSubscriber } from '@/lib/web-push'
import { ZodError } from 'zod'
import { getWorkspaceContext, allowedClientIds, allowedProjectIds, canAccessSub } from '@/lib/workspace'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()
  const ctx = await getWorkspaceContext(user.id, user.email ?? '')
  const { ownerId } = ctx

  const { data: project } = await supabase
    .from('projects')
    .select('id, client_id')
    .eq('id', id)
    .eq('freelancer_id', ownerId)
    .is('deleted_at', null)
    .single()

  if (!project) return notFound('Project not found')

  const clientIds = allowedClientIds(ctx)
  if (clientIds !== null && project.client_id && !clientIds.includes(project.client_id)) return notFound()
  if (!canAccessSub(ctx, 'canViewFiles', project.client_id, id)) return unauthorized()

  const { data, error } = await supabase
    .from('files')
    .select('id, filename, status, file_size, mime_type, version, client_comment, reviewed_at, created_at, storage_path, parent_file_id')
    .eq('project_id', id)
    .eq('freelancer_id', ownerId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) return internalError(error.message)
  return ok(data)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()
  const ctx = await getWorkspaceContext(user.id, user.email ?? '')
  const { ownerId } = ctx

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  let input
  try { input = registerFileSchema.parse({ ...body, project_id: id }) } catch (e) { return fromZodError(e as ZodError) }

  const { data: project } = await supabase
    .from('projects')
    .select('id, client_id, title, clients(id, name, email, portal_slug)')
    .eq('id', id)
    .eq('freelancer_id', ownerId)
    .is('deleted_at', null)
    .single()

  if (!project) return notFound('Project not found')

  const clientIds = allowedClientIds(ctx)
  if (clientIds !== null && project.client_id && !clientIds.includes(project.client_id)) return notFound()

  const { data, error } = await supabase
    .from('files')
    .insert({ ...input, freelancer_id: ownerId })
    .select()
    .single()

  if (error) return internalError(error.message)

  // Notify client
  const client = Array.isArray(project.clients) ? (project.clients[0] ?? null) : project.clients
  if (client?.email) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, business_name, plan, hide_branding')
      .eq('id', user.id)
      .single()

    const hideBranding = profile?.plan !== 'free' && (profile?.hide_branding ?? false)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    await sendFileUploadedEmail({
      to: client.email,
      clientName: client.name,
      freelancerName: profile?.full_name ?? '',
      businessName: profile?.business_name || profile?.full_name || '',
      projectTitle: project.title,
      filename: input.filename,
      portalUrl: `${appUrl}/p/${client.portal_slug}`,
      hideBranding,
    }).catch((err) => console.error('[email] file-uploaded notification failed', err))

    // Push notification to client
    if (client.id) {
      sendPushToSubscriber('client', client.id, {
        title: 'New file ready for review',
        body: `"${input.filename}" was uploaded in "${project.title}"`,
        tag: `file-upload-${data.id}`,
        data: { url: '/dashboard' },
      }).catch((err) => console.error("[push]", err))
    }
  }

  return created(data)
}
