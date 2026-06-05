import { createClient } from '@/lib/supabase/server'
import { ok, unauthorized } from '@/lib/api'

const PLAN_LIMITS = {
  free: { clients: 1, files: 3, storage_gb: null },
  pro: { clients: null, files: null, storage_gb: 5 },
  business: { clients: null, files: null, storage_gb: 20 },
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, subscription_status, stripe_customer_id, stripe_subscription_id')
    .eq('id', user.id)
    .single()

  const plan = (profile?.plan ?? 'free') as keyof typeof PLAN_LIMITS
  const limits = PLAN_LIMITS[plan]

  // Current usage
  const [{ count: clientCount }, { count: fileCount }] = await Promise.all([
    supabase.from('clients').select('id', { count: 'exact', head: true })
      .eq('freelancer_id', user.id).eq('status', 'active').is('deleted_at', null),
    supabase.from('files').select('id', { count: 'exact', head: true })
      .eq('freelancer_id', user.id).is('deleted_at', null),
  ])

  return ok({
    plan,
    subscription_status: profile?.subscription_status ?? null,
    has_billing: !!profile?.stripe_customer_id,
    limits,
    usage: {
      clients: clientCount ?? 0,
      files: fileCount ?? 0,
    },
  })
}
