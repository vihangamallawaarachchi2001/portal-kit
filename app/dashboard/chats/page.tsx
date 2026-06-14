import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChatsView } from '@/components/dashboard/chats-view'
import { getWorkspaceContext, allowedClientIds } from '@/lib/workspace'

export const revalidate = 0

export default async function ChatsPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const ctx = await getWorkspaceContext(user.id, user.email ?? '')
  const { ownerId } = ctx

  const { client: initialClientId } = await searchParams

  let query = supabase
    .from('clients')
    .select(`
      id, name, email, portal_slug,
      projects (
        id, title, status,
        messages (
          id, content, sender_type, read_at, created_at
        ),
        files ( id, filename, status )
      )
    `)
    .eq('freelancer_id', ownerId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  const clientIds = allowedClientIds(ctx)
  if (clientIds !== null) {
    query = query.in('id', clientIds)
  }

  const { data: clients } = await query

  return (
    <ChatsView
      rawClients={(clients ?? []) as never}
      initialClientId={initialClientId ?? null}
    />
  )
}
