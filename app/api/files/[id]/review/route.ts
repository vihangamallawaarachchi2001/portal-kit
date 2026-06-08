import { createServiceClient } from '@/lib/supabase/service'
import { ok, unauthorized, notFound, badRequest, internalError, fromZodError } from '@/lib/api'
import { reviewFileSchema } from '@/lib/validations'
import { sendFileReviewedEmail } from '@/lib/email'
import { getNotificationPref } from '@/lib/notification-prefs'
import { sendPushToSubscriber } from '@/lib/web-push'
import { cookies } from 'next/headers'
import { ZodError } from 'zod'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const clientId = cookieStore.get('portal_client_id')?.value

  if (!clientId) return unauthorized('No portal session')

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  let input
  try { input = reviewFileSchema.parse(body) } catch (e) { return fromZodError(e as ZodError) }

  const service = createServiceClient()

  // Verify the file belongs to a project owned by this client
  const { data: file } = await service
    .from('files')
    .select('id, filename, freelancer_id, project_id, projects(client_id, title, clients(id, name))')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!file) return notFound('File not found')

  const project = Array.isArray(file.projects) ? (file.projects[0] ?? null) : file.projects
  if (project?.client_id !== clientId) return unauthorized('Access denied')

  const { data, error } = await service
    .from('files')
    .update({
      status: input.status,
      client_comment: input.client_comment ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return internalError(error.message)

  // Notify freelancer
  const { data: freelancerProfile } = await service
    .from('profiles')
    .select('full_name')
    .eq('id', file.freelancer_id)
    .single()

  const { data: authUser } = await service.auth.admin.getUserById(file.freelancer_id)
  const client = Array.isArray(project.clients) ? (project.clients[0] ?? null) : project.clients

  const allowed = await getNotificationPref(file.freelancer_id, 'file_review').catch(() => true)

  if (authUser?.user?.email && allowed) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    await sendFileReviewedEmail({
      to: authUser.user.email,
      freelancerName: freelancerProfile?.full_name ?? '',
      clientName: client?.name ?? 'Your client',
      projectTitle: project.title,
      filename: file.filename,
      status: input.status as 'approved' | 'changes_requested',
      comment: input.client_comment ?? null,
      dashboardUrl: `${appUrl}/dashboard`,
    }).catch((err) => console.error('[email] file-review notification failed', err))
  }

  // Push notification to freelancer
  if (allowed) {
    const label = input.status === 'approved' ? 'approved' : 'requested changes on'
    sendPushToSubscriber('freelancer', file.freelancer_id, {
      title: 'File reviewed',
      body: `${client?.name ?? 'A client'} ${label} "${file.filename}"`,
      tag: `file-review-${id}`,
      data: { url: '/dashboard' },
    }).catch((err) => console.error("[push]", err))
  }

  return ok(data)
}
