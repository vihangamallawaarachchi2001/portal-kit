import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BillingSettings } from '@/components/dashboard/billing-settings'
import { getWorkspaceContext } from '@/lib/workspace'
import { Lock } from 'lucide-react'
import type { BankDetails } from '@/types/database'

export const revalidate = 0

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string; stripe_connect?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { isOwner } = await getWorkspaceContext(user.id, user.email ?? '')
  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-8 py-24 text-center">
        <div className="size-12 rounded-xl bg-surface-container flex items-center justify-center">
          <Lock className="size-5 text-on-surface-variant" />
        </div>
        <div>
          <p className="text-sm font-bold text-on-surface">Owner only</p>
          <p className="text-xs text-on-surface-variant mt-1 max-w-xs">
            Billing is managed by the workspace owner. Contact them to make changes to the plan.
          </p>
        </div>
      </div>
    )
  }

  const [
    { data: profile },
    { count: clientCount },
    { count: fileCount },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('plan, subscription_status, stripe_customer_id, stripe_connect_account_id, stripe_connect_onboarded, bank_details')
      .eq('id', user.id)
      .single(),
    supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('freelancer_id', user.id)
      .eq('status', 'active')
      .is('deleted_at', null),
    supabase
      .from('files')
      .select('id', { count: 'exact', head: true })
      .eq('freelancer_id', user.id)
      .is('deleted_at', null),
  ])

  const { upgraded, stripe_connect } = await searchParams

  return (
    <div className="px-8 pt-8 pb-12">
      <h2 className="text-lg font-bold text-on-surface tracking-tight">Billing</h2>
      <p className="text-sm text-on-surface-variant mt-0.5 mb-8">Manage your plan and payment receiving.</p>
      <BillingSettings
        plan={profile?.plan ?? 'free'}
        subscriptionStatus={profile?.subscription_status ?? null}
        hasBilling={!!profile?.stripe_customer_id}
        usage={{ clients: clientCount ?? 0, files: fileCount ?? 0 }}
        justUpgraded={upgraded === 'true'}
        stripeConnectStatus={(stripe_connect as 'success' | 'pending' | 'error' | null) ?? null}
        connectAccountId={profile?.stripe_connect_account_id ?? null}
        connectOnboarded={profile?.stripe_connect_onboarded ?? false}
        bankDetails={(profile?.bank_details as BankDetails | null) ?? null}
      />
    </div>
  )
}
