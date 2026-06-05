import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BillingSettings } from '@/components/dashboard/billing-settings'

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, subscription_status, stripe_customer_id')
    .eq('id', user.id)
    .single()

  const { count: clientCount } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('freelancer_id', user.id)
    .eq('status', 'active')
    .is('deleted_at', null)

  const { count: fileCount } = await supabase
    .from('files')
    .select('id', { count: 'exact', head: true })
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)

  const { upgraded } = await searchParams

  return (
    <BillingSettings
      plan={profile?.plan ?? 'free'}
      subscriptionStatus={profile?.subscription_status ?? null}
      hasBilling={!!profile?.stripe_customer_id}
      usage={{ clients: clientCount ?? 0, files: fileCount ?? 0 }}
      justUpgraded={upgraded === 'true'}
    />
  )
}
