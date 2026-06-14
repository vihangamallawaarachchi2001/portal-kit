import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import { PortalMessages } from '@/components/portal/portal-messages'

export default async function PortalMessagesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const clientId = cookieStore.get('portal_client_id')?.value
  if (!clientId) redirect(`/p/${slug}/access`)

  const service = createServiceClient()
  const { data: client } = await service
    .from('clients')
    .select(`
      id, name, portal_features,
      profiles:freelancer_id ( id, full_name, business_name, avatar_url ),
      projects (
        id, title,
        messages (
          id, sender_type, sender_id, content, read_at, created_at,
          profiles:sender_id ( id, full_name, avatar_url )
        ),
        files ( id, filename, status )
      )
    `)
    .eq('portal_slug', slug)
    .eq('id', clientId)
    .is('deleted_at', null)
    .single()

  if (!client) redirect(`/p/${slug}/access`)
  const features = client.portal_features as Record<string, boolean> | null
  if (features && features.messages === false) redirect(`/p/${slug}`)

  const profile = Array.isArray(client.profiles) ? (client.profiles[0] ?? null) : client.profiles
  const freelancerName = profile?.business_name || profile?.full_name || 'Your Team'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects = ((client.projects ?? []) as any[]).filter(p => !p.deleted_at)

  return (
    <PortalMessages
      clientId={clientId}
      clientName={client.name}
      projects={projects}
      freelancerName={freelancerName}
      freelancerAvatar={profile?.avatar_url ?? null}
    />
  )
}
