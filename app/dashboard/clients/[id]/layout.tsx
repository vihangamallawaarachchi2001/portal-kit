import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, ExternalLink } from 'lucide-react'
import { getInitials } from '@/lib/format'
import { ClientTabBar } from '@/components/dashboard/client-tab-bar'
import { SendPortalLinkButton, CopyPortalLinkButton } from '@/components/dashboard/send-portal-link-button'

export default async function ClientDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: client } = await supabase
    .from('clients')
    .select(`
      id, name, email, portal_slug, status,
      projects ( id, status, messages ( id, sender_type, read_at ) )
    `)
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!client) notFound()

  const unreadMessages = (client.projects ?? []).reduce(
    (total: number, p: { messages: { sender_type: string; read_at: string | null }[] }) =>
      total + (p.messages ?? []).filter(
        (m: { sender_type: string; read_at: string | null }) => m.sender_type === 'client' && !m.read_at,
      ).length,
    0,
  )

  const activeProjects = (client.projects ?? []).filter(
    (p: { status: string }) => p.status !== 'done',
  ).length

  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/p/${client.portal_slug}`

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Client header — premium blue ─────────────── */}
      <div className="relative overflow-hidden bg-ds-secondary">
        {/* Decorative overlays */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.13) 0%, transparent 55%)' }}
        />
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-white opacity-[0.04] pointer-events-none" />
        <div className="absolute right-10 bottom-0 size-32 rounded-full bg-white opacity-[0.03] pointer-events-none" />

        <div className="relative px-4 sm:px-8 pt-5 pb-0">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-white/60 mb-5 flex-wrap">
            <Link href="/dashboard" className="hover:text-white transition-colors font-medium">
              Dashboard
            </Link>
            <ChevronRight className="size-3 shrink-0" />
            <Link href="/dashboard/clients" className="hover:text-white transition-colors font-medium">
              Clients
            </Link>
            <ChevronRight className="size-3 shrink-0" />
            <span className="text-white/90 font-semibold truncate">{client.name}</span>
          </nav>

          {/* Client identity + actions */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4 min-w-0">
              {/* Avatar */}
              <div className="size-14 sm:size-16 rounded-2xl bg-white/20 ring-2 ring-white/30 flex items-center justify-center text-white font-extrabold text-xl shrink-0 select-none shadow-lg">
                {getInitials(client.name)}
              </div>

              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight tracking-tight truncate">
                  {client.name}
                </h1>
                <p className="text-[13px] text-white/65 mt-0.5 truncate">{client.email}</p>

                {/* Meta chips */}
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  {activeProjects > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/15 text-white/90">
                      <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
                      {activeProjects} active project{activeProjects !== 1 ? 's' : ''}
                    </span>
                  )}
                  <span className="text-[11px] text-white/40 font-mono">/p/{client.portal_slug}</span>
                </div>
              </div>
            </div>

            {/* Portal actions */}
            <div className="flex items-center gap-2 shrink-0">
              <CopyPortalLinkButton clientId={id} />
              <SendPortalLinkButton clientId={id} clientEmail={client.email} />
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 h-8 sm:h-9 px-3 sm:px-4 rounded-lg bg-white text-ds-secondary text-xs sm:text-sm font-bold hover:bg-white/90 transition-colors shadow-md shrink-0"
              >
                <ExternalLink className="size-3.5 shrink-0" />
                <span className="hidden sm:inline">View portal</span>
                <span className="sm:hidden">Portal</span>
              </a>
            </div>
          </div>

          {/* Tab bar on dark bg */}
          <ClientTabBar clientId={id} dark />
        </div>
      </div>

      {/* ── Page content ─────────────────────────────── */}
      <div className="flex-1 px-4 sm:px-8 py-6 sm:py-8 bg-surface">
        {children}
      </div>
    </div>
  )
}
