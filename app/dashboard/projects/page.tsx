import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectsView, type ProjectRow } from '@/components/dashboard/projects-view'
import { getWorkspaceContext, allowedClientIds } from '@/lib/workspace'

export const revalidate = 0

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const ctx = await getWorkspaceContext(user.id, user.email ?? '')
  const { ownerId } = ctx

  let projectsQuery = supabase
    .from('projects')
    .select('id, title, status, due_date, description, clients ( id, name )')
    .eq('freelancer_id', ownerId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(500)

  const allowed = allowedClientIds(ctx)
  if (allowed) projectsQuery = projectsQuery.in('client_id', allowed)

  let clientsQuery = supabase
    .from('clients')
    .select('id, name')
    .eq('freelancer_id', ownerId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .limit(200)

  if (allowed) clientsQuery = clientsQuery.in('id', allowed)

  const [{ data: projects }, { data: clientList }] = await Promise.all([
    projectsQuery,
    clientsQuery,
  ])

  return (
    <ProjectsView
      projects={(projects ?? []) as unknown as ProjectRow[]}
      clients={clientList ?? []}
    />
  )
}
