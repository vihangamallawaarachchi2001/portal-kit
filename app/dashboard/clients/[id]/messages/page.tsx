import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { MessageThread } from '@/components/dashboard/message-thread'
import { getWorkspaceContext } from '@/lib/workspace'

export const revalidate = 0

export default async function ClientMessagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const ctx = await getWorkspaceContext(user.id, user.email ?? '')
  const { ownerId } = ctx

  const { data: client } = await supabase
    .from('clients')
    .select('id, name')
    .eq('id', id)
    .eq('freelancer_id', ownerId)
    .is('deleted_at', null)
    .single()

  if (!client) notFound()

  const { data: projects } = await supabase
    .from('projects')
    .select(`
      id, title,
      messages (
        id, sender_type, sender_id, content, read_at, created_at,
        profiles:sender_id ( id, full_name, avatar_url )
      )
    `)
    .eq('client_id', id)
    .eq('freelancer_id', ownerId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <MessageThread
      clientId={id}
      clientName={client.name}
      projects={(projects ?? []) as unknown as Parameters<typeof MessageThread>[0]['projects']}
      currentUser={{ id: user.id, name: profile?.full_name ?? 'You', avatar: profile?.avatar_url }}
      senderType="freelancer"
    />
  )
}
