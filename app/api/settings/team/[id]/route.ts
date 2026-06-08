import { createClient } from '@/lib/supabase/server'
import { noContent, unauthorized, notFound, internalError } from '@/lib/api'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data: invite } = await supabase
    .from('team_invites')
    .select('id')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!invite) return notFound('Invite not found')

  const { error } = await supabase
    .from('team_invites')
    .delete()
    .eq('id', id)

  if (error) return internalError(error.message)
  return noContent()
}
