import { createClient } from '@/lib/supabase/server'
import { ok, badRequest, unauthorized, notFound, internalError } from '@/lib/api'
import { sendMeetingCancelledEmail } from '@/lib/email'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data: meeting } = await supabase.from('meetings').select('*').eq('id', id).single()
  if (!meeting) return notFound('Meeting not found')
  if (meeting.freelancer_id !== user.id) return unauthorized()

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }
  const updates = body as any

  const { data, error } = await supabase.from('meetings').update(updates).eq('id', id).select().single()
  if (error) return internalError(error.message)

  // If cancelled, notify client
  if (updates.status === 'cancelled') {
    try {
      const { data: project } = await supabase.from('projects').select('id, title, client_id').eq('id', meeting.project_id).single()
      if (!project) throw new Error('Project not found')
      const { data: client } = await supabase.from('clients').select('id, name, email, portal_slug').eq('id', project.client_id).single()
      if (client?.email) {
        sendMeetingCancelledEmail({
          to: client.email,
          clientName: client.name,
          title: data.title,
        }).catch(err => console.error('[meeting email] cancel failed', err))
      }
    } catch (err) {
      console.error('[meeting notify] cancel error', err)
    }
  }

  return ok(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data: meeting } = await supabase.from('meetings').select('*').eq('id', id).single()
  if (!meeting) return notFound('Meeting not found')
  if (meeting.freelancer_id !== user.id) return unauthorized()

  // Only allow hard delete if invite not yet sent
  if (meeting.invite_sent_at) return badRequest('Cannot delete invited meeting')

  const { error } = await supabase.from('meetings').delete().eq('id', id)
  if (error) return internalError(error.message)
  return ok({ deleted: true })
}
