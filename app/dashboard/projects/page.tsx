import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectsView, type ProjectRow } from '@/components/dashboard/projects-view'

export const revalidate = 0

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const [{ data: projects }, { data: clientList }] = await Promise.all([
    supabase
      .from('projects')
      .select('id, title, status, due_date, description, clients ( id, name )')
      .eq('freelancer_id', user.id)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false }),
    supabase
      .from('clients')
      .select('id, name')
      .eq('freelancer_id', user.id)
      .eq('status', 'active')
      .is('deleted_at', null),
  ])

  return (
    <ProjectsView
      projects={(projects ?? []) as unknown as ProjectRow[]}
      clients={clientList ?? []}
    />
  )
}
