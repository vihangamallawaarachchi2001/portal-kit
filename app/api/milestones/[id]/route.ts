import { createClient } from '@/lib/supabase/server'
import { ok, badRequest, unauthorized, notFound, internalError } from '@/lib/api'
import { sendMilestoneCompletedEmail } from '@/lib/email'
import { sendPushToSubscriber } from '@/lib/web-push'
import { getWorkspaceContext, canAccessSub } from '@/lib/workspace'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()
  const ctx = await getWorkspaceContext(user.id, user.email ?? '')

  const { data: milestone } = await supabase
    .from('milestones')
    .select('*')
    .eq('id', id)
    .single()
  if (!milestone) return notFound('Milestone not found')
  if (milestone.freelancer_id !== ctx.ownerId) return unauthorized()

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, client_id')
    .eq('id', milestone.project_id)
    .single()
  if (!project) return notFound('Project not found')
  if (!canAccessSub(ctx, 'canViewMilestones', project.client_id, milestone.project_id)) return unauthorized()

  let body: unknown
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }
  const updates = body as { title?: string; description?: string | null; due_date?: string; completed_at?: string | null }

  const { data, error } = await supabase
    .from('milestones')
    .update({ ...updates })
    .eq('id', id)
    .select()
    .single()

  if (error) return internalError(error.message)

  // If milestone was just completed, notify client
  if (!milestone.completed_at && updates.completed_at) {
    try {
      if (project) {
        const { data: client } = await supabase
          .from('clients')
          .select('id, name, email, portal_slug')
          .eq('id', project.client_id)
          .single()

        if (client) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, plan, hide_branding')
            .eq('id', user.id)
            .single()
          const hideBranding = profile?.plan !== 'free' && (profile?.hide_branding ?? false)

          // send email (fire-and-forget)
          sendMilestoneCompletedEmail({
            to: client.email,
            clientName: client.name,
            freelancerName: profile?.full_name ?? user.user_metadata?.full_name ?? user.email ?? 'Your freelancer',
            milestoneTitle: data.title,
            projectTitle: project.title,
            portalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/p/${client.portal_slug}`,
            hideBranding,
          }).catch(err => console.error('[milestone email] send failed', err))

          // push
          sendPushToSubscriber('client', client.id, {
            title: 'Milestone completed',
            body: `${user.user_metadata?.full_name ?? 'Freelancer'} completed: ${data.title}`,
            data: { url: `/p/${client.portal_slug}` },
          }).catch(err => console.error('[milestone push] send failed', err))
        }
      }
    } catch (err) {
      console.error('[milestone notify] error', err)
    }
  }

  return ok(data)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()
  const ctx = await getWorkspaceContext(user.id, user.email ?? '')

  const { data: milestone } = await supabase
    .from('milestones')
    .select('*')
    .eq('id', id)
    .single()
  if (!milestone) return notFound('Milestone not found')
  if (milestone.freelancer_id !== ctx.ownerId) return unauthorized()

  const { data: project } = await supabase
    .from('projects')
    .select('id, client_id')
    .eq('id', milestone.project_id)
    .single()
  if (!project) return notFound('Project not found')
  if (!canAccessSub(ctx, 'canViewMilestones', project.client_id, milestone.project_id)) return unauthorized()

  const { error } = await supabase
    .from('milestones')
    .delete()
    .eq('id', id)

  if (error) return internalError(error.message)
  return ok({ deleted: true })
}
