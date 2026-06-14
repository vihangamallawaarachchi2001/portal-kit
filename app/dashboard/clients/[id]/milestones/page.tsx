import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ClientMilestonesView } from '@/components/dashboard/client-milestones-view'
import { getWorkspaceContext } from '@/lib/workspace'

export const revalidate = 0

export default async function ClientMilestonesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const ctx = await getWorkspaceContext(user.id, user.email ?? '')
  const { ownerId } = ctx

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('id', id)
    .eq('freelancer_id', ownerId)
    .is('deleted_at', null)
    .single()

  if (!client) notFound()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, title')
    .eq('client_id', id)
    .eq('freelancer_id', ownerId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  return (
    <ClientMilestonesView
      clientId={id}
      projects={(projects ?? []) as { id: string; title: string }[]}
    />
  )
}
