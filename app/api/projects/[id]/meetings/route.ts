import { createClient } from '@/lib/supabase/server'
import { ok, badRequest, unauthorized, notFound, internalError } from '@/lib/api'
import { sendMeetingInviteEmail, sendMeetingInviteConfirmEmail } from '@/lib/email'
import { sendPushToSubscriber } from '@/lib/web-push'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  // Ensure project belongs to freelancer
  const { data: project } = await supabase.from('projects').select('id, freelancer_id').eq('id', id).eq('freelancer_id', user.id).single()
  if (!project) return notFound('Project not found')

  const { data, error } = await supabase.from('meetings').select('*').eq('project_id', id).order('scheduled_at', { ascending: true })
  if (error) return internalError(error.message)
  return ok(data)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  // Ensure project belongs to freelancer
  const { data: project } = await supabase.from('projects').select('id, freelancer_id, client_id').eq('id', id).eq('freelancer_id', user.id).single()
  if (!project) return notFound('Project not found')

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }
  const { title, scheduled_at, duration_mins, meet_link, description } = body as any
  if (!title || !scheduled_at || !meet_link) return badRequest('Missing title, scheduled_at or meet_link')

  const { data: meeting, error } = await supabase
    .from('meetings')
    .insert([{
      project_id: id,
      freelancer_id: user.id,
      client_id: project.client_id,
      title,
      description: description ?? null,
      scheduled_at,
      duration_mins: duration_mins ?? 30,
      meet_link,
      status: 'scheduled',
      invite_sent_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) return internalError(error.message)

  // Notify client + freelancer
  try {
    const { data: client } = await supabase.from('clients').select('id, name, email, portal_slug').eq('id', project.client_id).single()
    sendMeetingInviteEmail({
      to: client.email,
      clientName: client.name,
      freelancerName: user.user_metadata?.full_name ?? user.email ?? 'Your freelancer',
      title: meeting.title,
      scheduledAt: meeting.scheduled_at,
      durationMins: meeting.duration_mins,
      meetLink: meeting.meet_link,
    }).catch(err => console.error('[meeting email] invite failed', err))

    sendMeetingInviteConfirmEmail({
      to: user.email ?? (user.user_metadata?.email as string | undefined) ?? '',
      freelancerName: user.user_metadata?.full_name ?? user.email ?? 'You',
      clientName: client.name,
      title: meeting.title,
      scheduledAt: meeting.scheduled_at,
      meetLink: meeting.meet_link,
    }).catch(err => console.error('[meeting email] confirm failed', err))

    // Push notifications
    if (client?.id) {
      sendPushToSubscriber('client', client.id, {
        title: `Meeting scheduled: ${meeting.title}`,
        body: `Scheduled for ${new Date(meeting.scheduled_at).toLocaleString()}`,
        data: { url: `/p/${client.portal_slug}` },
      }).catch(err => console.error('[meeting push] client', err))
    }
    if (user.id) {
      sendPushToSubscriber('freelancer', user.id, {
        title: `Meeting scheduled with ${client?.name ?? 'client'}`,
        body: `${meeting.title} — ${new Date(meeting.scheduled_at).toLocaleString()}`,
        data: { url: '/dashboard/projects' },
      }).catch(err => console.error('[meeting push] freelancer', err))
    }
  } catch (err) {
    console.error('[meeting notify] failed', err)
  }

  return ok(meeting)
}
