import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { FileManager } from '@/components/dashboard/file-manager'

export const revalidate = 0

export default async function ClientFilesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: client } = await supabase
    .from('clients')
    .select('id, name, plan:freelancer_id(plan)')
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!client) notFound()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, status, files(*)')
    .eq('client_id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const { data: profileData } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const { count: totalFiles } = await supabase
    .from('files')
    .select('id', { count: 'exact', head: true })
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)

  return (
    <FileManager
      clientId={id}
      projects={(projects ?? []) as Parameters<typeof FileManager>[0]['projects']}
      plan={profileData?.plan ?? 'free'}
      totalFileCount={totalFiles ?? 0}
    />
  )
}
