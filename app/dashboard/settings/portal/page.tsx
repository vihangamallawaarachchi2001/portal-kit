import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PortalDomainSettings } from '@/components/dashboard/portal-domain-settings'

export const revalidate = 0

export default async function PortalSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, custom_domain, custom_domain_verified, hide_branding')
    .eq('id', user.id)
    .single()

  return (
    <PortalDomainSettings
      plan={profile?.plan ?? 'free'}
      initialDomain={profile?.custom_domain ?? null}
      initialVerified={profile?.custom_domain_verified ?? false}
      initialHideBranding={profile?.hide_branding ?? false}
    />
  )
}
