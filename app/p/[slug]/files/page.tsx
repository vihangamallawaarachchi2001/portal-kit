import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import { PortalFileReview } from '@/components/portal/portal-file-review'

export default async function PortalFilesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const clientId = cookieStore.get('portal_client_id')?.value
  if (!clientId) redirect(`/p/${slug}/access`)

  const service = createServiceClient()
  const { data: client } = await service
    .from('clients')
    .select(`
      id,
      projects (
        id, title, status,
        files ( * )
      )
    `)
    .eq('portal_slug', slug)
    .eq('id', clientId)
    .is('deleted_at', null)
    .single()

  if (!client) redirect(`/p/${slug}/access`)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects = ((client.projects ?? []) as any[]).filter(p => !p.deleted_at)

  return <PortalFileReview projects={projects as Parameters<typeof PortalFileReview>[0]['projects']} />
}
