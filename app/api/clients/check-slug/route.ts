import { createClient } from '@/lib/supabase/server'
import { ok, badRequest } from '@/lib/api'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')
  if (!slug) return badRequest('slug is required')

  const supabase = await createClient()
  const { count } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('portal_slug', slug)
    .is('deleted_at', null)

  return ok({ available: (count ?? 0) === 0 })
}
