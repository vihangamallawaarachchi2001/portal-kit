import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ClientMeetingsView } from '@/components/dashboard/client-meetings-view'
import { getWorkspaceContext } from '@/lib/workspace'

export const revalidate = 0

export default async function ClientMeetingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const ctx = await getWorkspaceContext(user.id, user.email ?? '')
  const { ownerId, isOwner, permissions } = ctx
  if (!isOwner && !permissions.projects) redirect(`/dashboard/clients/${id}`)

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
    <ClientMeetingsView
      clientId={id}
      projects={(projects ?? []) as { id: string; title: string }[]}
    />
  )
}
