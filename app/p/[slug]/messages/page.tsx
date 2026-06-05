import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import { MessageThread } from '@/components/dashboard/message-thread'

export default async function PortalMessagesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const clientId = cookieStore.get('portal_client_id')?.value
  if (!clientId) redirect(`/p/${slug}/access`)

  const service = createServiceClient()
  const { data: client } = await service
    .from('clients')
    .select(`
      id, name,
      profiles:freelancer_id ( id, full_name, avatar_url ),
      projects (
        id, title,
        messages (
          id, sender_type, sender_id, content, read_at, created_at,
          profiles:sender_id ( id, full_name, avatar_url )
        )
      )
    `)
    .eq('portal_slug', slug)
    .eq('id', clientId)
    .is('deleted_at', null)
    .single()

  if (!client) redirect(`/p/${slug}/access`)

  const profile = Array.isArray(client.profiles) ? client.profiles[0] : client.profiles
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects = ((client.projects ?? []) as any[]).filter(p => !p.deleted_at)

  return (
    <MessageThread
      clientId={clientId}
      clientName={client.name}
      projects={projects}
      currentUser={{ id: clientId, name: client.name, avatar: null }}
      senderType="client"
    />
  )
}
