import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChatsView } from '@/components/dashboard/chats-view'

export const revalidate = 0

export default async function ChatsPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { client: initialClientId } = await searchParams

  const { data: clients } = await supabase
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
    .eq('freelancer_id', user.id)
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  return (
    <ChatsView
      rawClients={(clients ?? []) as never}
      initialClientId={initialClientId ?? null}
    />
  )
}
