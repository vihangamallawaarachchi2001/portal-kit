import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getInitials } from '@/lib/format'
import { Toaster } from '@/components/ui/sonner'
import { PortalTabBar } from '@/components/portal/portal-tab-bar'
import { PortalPushSetup } from '@/components/portal/portal-push-setup'
import { Layers } from 'lucide-react'

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
  if (!clientId) redirect(`/p/${slug}/access`)

  const service = createServiceClient()
  const { data: client } = await service
    .from('clients')
    .select(`
      id, name, portal_slug,
      profiles:freelancer_id ( full_name, business_name, avatar_url, tagline, plan, hide_branding )
    `)
    .eq('portal_slug', slug)
    .eq('id', clientId)
    .is('deleted_at', null)
    .single()

  if (!client) redirect(`/p/${slug}/access`)

  const profile = Array.isArray(client.profiles) ? (client.profiles[0] ?? null) : client.profiles
  const businessName = profile?.business_name || profile?.full_name || 'Your Portal'
  const isPro        = profile?.plan !== 'free'
  const hideBranding = isPro && (profile?.hide_branding ?? false)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f0f2f7' }}>

      {/* ── Header ─────────────────────────────────── */}
      <header className="sticky top-0 z-30" style={{ background: 'linear-gradient(135deg, #0a1f44 0%, #0051d5 100%)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Brand */}
            <div className="flex items-center gap-3 min-w-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="size-9 rounded-xl object-cover ring-2 ring-white/30 shrink-0" />
              ) : (
                <div className="size-9 rounded-xl bg-white/20 ring-2 ring-white/30 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white">{getInitials(businessName)}</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-white leading-tight truncate">{businessName}</p>
                {profile?.tagline && (
                  <p className="text-[11px] text-white/60 leading-tight truncate hidden sm:block">{profile.tagline}</p>
                )}
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-xs font-semibold text-white/90 leading-tight">{client.name}</p>
                <p className="text-[11px] text-white/50">Client portal</p>
              </div>
              {!isPro && !hideBranding && (
                <Link
                  href="https://portalkit.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] font-semibold text-white/60 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
                >
                  <Layers className="size-3" />
                  PortalKit
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-8">
            <PortalTabBar slug={slug} dark />
          </div>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 py-8">
        {children}
      </main>

      <Toaster position="bottom-right" richColors />
      <PortalPushSetup />
    </div>
  )
}
