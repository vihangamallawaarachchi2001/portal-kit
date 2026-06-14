import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GlobalFilesView } from '@/components/dashboard/global-files-view'
import { getWorkspaceContext } from '@/lib/workspace'

export const revalidate = 0

export default async function FilesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const ctx = await getWorkspaceContext(user.id, user.email ?? '')
  const { ownerId } = ctx

  const [{ data: files }, { data: profile }] = await Promise.all([
    supabase
      .from('files')
      .select(`
        id, filename, file_size, mime_type, status, version, storage_path,
        created_at, client_comment, parent_file_id, uploaded_by_client,
        projects (
          id, title, status,
          clients ( id, name )
        )
      `)
      .eq('freelancer_id', ownerId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(500),
    supabase
      .from('profiles')
      .select('plan')
      .eq('id', ownerId)
      .single(),
  ])

  return (
    <GlobalFilesView
      rawFiles={(files ?? []) as never}
      plan={profile?.plan ?? 'free'}
    />
  )
}
