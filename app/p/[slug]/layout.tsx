import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/format'
import { Toaster } from '@/components/ui/sonner'
import { PortalTabBar } from '@/components/portal/portal-tab-bar'

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const cookieStore = await cookies()
  const clientId = cookieStore.get('portal_client_id')?.value

  if (!clientId) {
    redirect(`/p/${slug}/access`)
  }

  const service = createServiceClient()
  const { data: client } = await service
    .from('clients')
    .select(`
      id, name, portal_slug,
      profiles:freelancer_id ( full_name, business_name, avatar_url, tagline, plan )
    `)
    .eq('portal_slug', slug)
    .eq('id', clientId)
    .is('deleted_at', null)
    .single()

  if (!client) {
    redirect(`/p/${slug}/access`)
  }

  const profile = Array.isArray(client.profiles) ? client.profiles[0] : client.profiles
  const businessName = profile?.business_name || profile?.full_name || 'Your Portal'
  const isPro = profile?.plan !== 'free'

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Portal header */}
      <header className="bg-white border-b border-outline-variant sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="text-sm bg-ds-secondary text-white font-bold">
                {getInitials(businessName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm text-on-surface leading-tight">{businessName}</p>
              {profile?.tagline && (
                <p className="text-xs text-on-surface-variant">{profile.tagline}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant hidden sm:block">
              {client.name}'s portal
            </span>
            {!isPro && (
              <span className="text-[10px] font-semibold text-on-surface-variant px-2 py-1 rounded-md bg-surface-container border border-outline-variant">
                Powered by PortalKit
              </span>
            )}
          </div>
        </div>

        {/* Tab navigation */}
        <PortalTabBar slug={slug} />
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {children}
      </main>

      <Toaster position="bottom-right" richColors />
    </div>
  )
}
