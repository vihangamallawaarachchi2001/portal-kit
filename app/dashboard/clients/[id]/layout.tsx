import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, LayoutGrid, Paperclip, FileText, MessageSquare, MoreHorizontal } from 'lucide-react'

const TABS = [
  { href: '', label: 'Overview', icon: LayoutGrid },
  { href: '/files', label: 'Files', icon: Paperclip },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
]

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
      projects (
        id,
        messages ( id, sender_type, read_at )
      )
    `)
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!client) notFound()

  const unreadMessages = (client.projects ?? []).reduce((total: number, p: { messages: { sender_type: string; read_at: string | null }[] }) =>
    total + (p.messages ?? []).filter((m: { sender_type: string; read_at: string | null }) => m.sender_type === 'client' && !m.read_at).length, 0)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top bar */}
      <div className="bg-white border-b border-outline-variant px-8 pt-6 pb-0">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-4">
          <Link href="/dashboard" className="hover:text-on-surface transition-colors">Dashboard</Link>
          <ChevronRight className="size-3" />
          <span className="text-on-surface font-medium">{client.name}</span>
        </nav>

        {/* Client header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-on-surface">{client.name}</h1>
            <p className="text-sm text-on-surface-variant">{client.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/p/${client.portal_slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 px-3 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:border-ds-secondary/40 transition-colors"
            >
              View portal ↗
            </a>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-0.5 -mb-px">
          {TABS.map(tab => {
            const href = `/dashboard/clients/${id}${tab.href}`
            const isMessages = tab.label === 'Messages'
            return (
              <ClientTab
                key={tab.href}
                href={href}
                label={tab.label}
                Icon={tab.icon}
                badge={isMessages && unreadMessages > 0 ? unreadMessages : undefined}
              />
            )
          })}
        </nav>
      </div>

      {/* Page content */}
      <div className="flex-1 p-8">{children}</div>
    </div>
  )
}

function ClientTab({
  href,
  label,
  Icon,
  badge,
}: {
  href: string
  label: string
  Icon: React.ElementType
  badge?: number
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors text-on-surface-variant border-transparent hover:text-on-surface hover:border-outline-variant/60"
    >
      <Icon className="size-3.5" />
      {label}
      {badge != null && (
        <span className="ml-0.5 text-[10px] font-bold bg-ds-secondary text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  )
}
