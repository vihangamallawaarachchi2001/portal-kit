import { createClient } from '@/lib/supabase/server'
import { ok, created, unauthorized, notFound, badRequest, internalError, fromZodError } from '@/lib/api'
import { registerFileSchema } from '@/lib/validations'
import { sendFileUploadedEmail } from '@/lib/email'
import { sendPushToSubscriber } from '@/lib/web-push'
import { ZodError } from 'zod'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!project) return notFound('Project not found')

  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('project_id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) return internalError(error.message)
  return ok(data)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  let input
  try { input = registerFileSchema.parse({ ...body, project_id: id }) } catch (e) { return fromZodError(e as ZodError) }

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, clients(id, name, email, portal_slug)')
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!project) return notFound('Project not found')

  const { data, error } = await supabase
    .from('files')
    .insert({ ...input, freelancer_id: user.id })
    .select()
    .single()

  if (error) return internalError(error.message)

  // Notify client
  const client = Array.isArray(project.clients) ? project.clients[0] : project.clients
  if (client?.email) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, business_name')
      .eq('id', user.id)
      .single()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    await sendFileUploadedEmail({
      to: client.email,
      clientName: client.name,
      freelancerName: profile?.full_name ?? '',
      businessName: profile?.business_name || profile?.full_name || '',
      projectTitle: project.title,
      filename: input.filename,
      portalUrl: `${appUrl}/p/${client.portal_slug}`,
    }).catch((err) => console.error('[email] file-uploaded notification failed', err))

    // Push notification to client
    if (client.id) {
      sendPushToSubscriber('client', client.id, {
        title: 'New file ready for review',
        body: `"${input.filename}" was uploaded in "${project.title}"`,
        tag: `file-upload-${data.id}`,
        data: { url: '/dashboard' },
      }).catch(() => {})
    }
  }

  return created(data)
}
