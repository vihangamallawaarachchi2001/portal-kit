import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PortalSettingsPanel } from '@/components/dashboard/portal-settings-panel'
import { DEFAULT_PORTAL_FEATURES } from '@/lib/validations'

export const revalidate = 0

export default async function PortalSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: client } = await supabase
    .from('clients')
    .select('id, name, portal_features, portal_closed')
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!client) notFound()

  const features = {
    ...DEFAULT_PORTAL_FEATURES,
    ...(typeof client.portal_features === 'object' && client.portal_features !== null
      ? client.portal_features
      : {}),
  }

  return (
    <PortalSettingsPanel
      clientId={id}
      clientName={client.name}
      portalFeatures={features}
      portalClosed={(client as { portal_closed?: boolean }).portal_closed ?? false}
    />
  )
}
