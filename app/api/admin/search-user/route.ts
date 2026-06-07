import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { ok, unauthorized, badRequest, notFound } from '@/lib/api'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) return unauthorized()

  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')?.trim().toLowerCase()
  if (!email) return badRequest('email required')

  const service = createServiceClient()
  const { data: { users } } = await service.auth.admin.listUsers({ perPage: 1000 })
  const authUser = users.find(u => u.email?.toLowerCase() === email)
  if (!authUser) return notFound('User not found')

  const { data: profile } = await service
    .from('profiles')
    .select('id, full_name, plan, plan_grant_expires_at, plan_grant_note')
    .eq('id', authUser.id)
    .single()

  return ok({
    id: authUser.id,
    email: authUser.email,
    full_name: profile?.full_name ?? null,
    plan: (profile as { plan: string } | null)?.plan ?? 'free',
    plan_grant_expires_at: (profile as Record<string, unknown> | null)?.plan_grant_expires_at ?? null,
    plan_grant_note: (profile as Record<string, unknown> | null)?.plan_grant_note ?? null,
  })
}
