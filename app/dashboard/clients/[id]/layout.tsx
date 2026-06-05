import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, LayoutGrid, Paperclip, FileText, MessageSquare, ExternalLink } from 'lucide-react'
import { getInitials } from '@/lib/format'

const TABS = [
  { href: '',          label: 'Overview',  icon: LayoutGrid   },
  { href: '/files',    label: 'Files',     icon: Paperclip    },
  { href: '/invoices', label: 'Invoices',  icon: FileText     },
  { href: '/messages', label: 'Messages',  icon: MessageSquare },
]

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

  const accent = clientAccent(client.name)

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Client header ──────────────────────────────── */}
      <div className="bg-white border-b border-outline-variant">
        {/* Accent strip */}
        <div className="h-1 w-full" style={{ background: accent }} />

        <div className="px-8 pt-5 pb-0">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-5">
            <Link href="/dashboard" className="hover:text-ds-secondary transition-colors font-medium">Dashboard</Link>
            <ChevronRight className="size-3 text-outline-variant" />
            <Link href="/dashboard/clients" className="hover:text-ds-secondary transition-colors font-medium">Clients</Link>
            <ChevronRight className="size-3 text-outline-variant" />
            <span className="text-on-surface font-semibold">{client.name}</span>
          </nav>

          {/* Client identity row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3.5">
              <div
                className="size-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0"
                style={{ background: accent }}
              >
                {getInitials(client.name)}
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-on-surface tracking-tight">{client.name}</h1>
                <p className="text-sm text-on-surface-variant">{client.email}</p>
              </div>
            </div>

            <a
              href={`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/p/${client.portal_slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 h-8 px-3.5 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface-variant hover:text-ds-secondary hover:border-ds-secondary/40 hover:bg-ds-secondary/4 transition-all"
            >
              <ExternalLink className="size-3.5" />
              View portal
            </a>
          </div>

          {/* Tabs */}
          <nav className="flex items-center gap-0 -mb-px">
            {TABS.map(tab => {
              const href = `/dashboard/clients/${id}${tab.href}`
              return (
                <ClientTab
                  key={tab.href}
                  href={href}
                  label={tab.label}
                  Icon={tab.icon}
                  badge={tab.label === 'Messages' && unreadMessages > 0 ? unreadMessages : undefined}
                />
              )
            })}
          </nav>
        </div>
      </div>

      {/* ── Page content ─────────────────────────────── */}
      <div className="flex-1 p-8 bg-surface">{children}</div>
    </div>
  )
}

function ClientTab({ href, label, Icon, badge }: {
  href: string; label: string; Icon: React.ElementType; badge?: number
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all text-on-surface-variant border-transparent hover:text-on-surface hover:border-outline-variant/50"
    >
      <Icon className="size-3.5" />
      {label}
      {badge != null && (
        <span className="ml-0.5 text-[10px] font-bold bg-ds-secondary text-white rounded-full px-1.5 py-0.5 min-w-4.5 text-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  )
}
