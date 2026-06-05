import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, ExternalLink } from 'lucide-react'
import { getInitials } from '@/lib/format'
import { ClientTabBar } from '@/components/dashboard/client-tab-bar'

// Deterministic accent per client name
const ACCENT_COLORS = ['#0051d5','#7c3aed','#059669','#d97706','#dc2626','#0891b2','#9333ea','#16a34a']
function clientAccent(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
  return ACCENT_COLORS[Math.abs(h) % ACCENT_COLORS.length]
}

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
      projects ( id, messages ( id, sender_type, read_at ) )
    `)
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!client) notFound()

  const unreadMessages = (client.projects ?? []).reduce((total: number, p: { messages: { sender_type: string; read_at: string | null }[] }) =>
    total + (p.messages ?? []).filter((m: { sender_type: string; read_at: string | null }) => m.sender_type === 'client' && !m.read_at).length, 0)

  const accent    = clientAccent(client.name)
  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/p/${client.portal_slug}`

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Client header ──────────────────────────────── */}
      <div className="bg-white border-b border-outline-variant">
        {/* Accent strip */}
        <div className="h-1 w-full" style={{ background: accent }} />

        <div className="px-8 pt-5 pb-0">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-4">
            <Link href="/dashboard" className="hover:text-ds-secondary transition-colors font-medium">Dashboard</Link>
            <ChevronRight className="size-3 text-outline-variant" />
            <Link href="/dashboard/clients" className="hover:text-ds-secondary transition-colors font-medium">Clients</Link>
            <ChevronRight className="size-3 text-outline-variant" />
            <span className="text-on-surface font-semibold">{client.name}</span>
          </nav>

          {/* Client identity row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              {/* Avatar with accent ring */}
              <div className="relative shrink-0">
                <div
                  className="size-12 rounded-md flex items-center justify-center text-white font-bold text-sm shadow-sm"
                  style={{ background: accent }}
                >
                  {getInitials(client.name)}
                </div>
              </div>
              <div>
                <h1 className="text-[1.25rem] font-extrabold text-on-surface tracking-tight leading-tight">{client.name}</h1>
                <p className="text-sm text-on-surface-variant mt-0.5">{client.email}</p>
              </div>
            </div>

            {/* Actions */}
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 h-8 px-3.5 rounded-md bg-ds-secondary text-white text-xs font-semibold hover:bg-ds-secondary-container transition-colors shadow-sm shadow-ds-secondary/20"
            >
              <ExternalLink className="size-3.5" />
              View portal
            </a>
          </div>

          {/* Tabs — client component for active state */}
          <ClientTabBar clientId={id} unreadMessages={unreadMessages} />
        </div>
      </div>

      {/* ── Page content ─────────────────────────────── */}
      <div className="flex-1 px-8 py-7 bg-surface">{children}</div>
    </div>
  )
}
