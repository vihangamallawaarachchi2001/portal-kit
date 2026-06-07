import { createClient } from '@/lib/supabase/server'
import { ok, unauthorized } from '@/lib/api'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  // Unread client messages — join through projects to filter by freelancer
  const { data: msgs } = await supabase
    .from('messages')
    .select(`
      id, content, created_at,
      projects!inner ( id, title, freelancer_id, clients!inner ( id, name ) )
    `)
    .eq('sender_type', 'client')
    .is('read_at', null)
    .eq('projects.freelancer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Pending file reviews
  const { data: files } = await supabase
    .from('files')
    .select(`
      id, filename, created_at, mime_type,
      projects!inner ( id, title, clients!inner ( id, name ) )
    `)
    .eq('freelancer_id', user.id)
    .eq('status', 'pending')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(10)

  return ok({ messages: msgs ?? [], files: files ?? [] })
}
