import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import { formatDate, formatCurrency, formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { CheckCircle2, Clock, Circle, ChevronRight, FileText, Paperclip, MessageSquare } from 'lucide-react'
import { Project } from '@/types/database'

const STATUS_CONFIG: Record<Project['status'], { label: string; color: string; dot: string; description: string }> = {
  briefing:    { label: 'Briefing',     color: 'text-slate-600',  dot: 'bg-slate-400',  description: 'Getting started — gathering requirements' },
  in_progress: { label: 'In Progress',  color: 'text-blue-600',   dot: 'bg-blue-500',   description: 'Active development underway' },
  review:      { label: 'Ready for Review', color: 'text-amber-600', dot: 'bg-amber-500', description: 'Awaiting your feedback and approval' },
  done:        { label: 'Complete',     color: 'text-green-600',  dot: 'bg-green-500',  description: 'Project successfully delivered' },
}

export default async function PortalOverviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const clientId = cookieStore.get('portal_client_id')?.value
  if (!clientId) redirect(`/p/${slug}/access`)

  const service = createServiceClient()
  const { data: client } = await service
    .from('clients')
    .select(`
      id, name, portal_slug,
      profiles:freelancer_id ( full_name, business_name ),
      projects (
        id, title, description, status, due_date, updated_at,
        files ( id, status ),
        messages ( id, sender_type, read_at )
      ),
      invoices ( id, total, currency, status )
    `)
    .eq('portal_slug', slug)
    .eq('id', clientId)
    .is('deleted_at', null)
    .single()

  if (!client) redirect(`/p/${slug}/access`)

  const profile = Array.isArray(client.profiles) ? client.profiles[0] : client.profiles
  const businessName = profile?.business_name || profile?.full_name || 'Your Portal'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects = ((client.projects ?? []) as any[]).filter(p => !p.deleted_at)
  const activeProjects = projects.filter((p: Project) => p.status !== 'done')
  const pendingFiles = projects.reduce((s: number, p: { files: { status: string }[] }) =>
    s + (p.files ?? []).filter((f: { status: string }) => f.status === 'pending').length, 0)
  const unreadMessages = projects.reduce((s: number, p: { messages: { sender_type: string; read_at: string | null }[] }) =>
    s + (p.messages ?? []).filter((m: { sender_type: string; read_at: string | null }) => m.sender_type === 'freelancer' && !m.read_at).length, 0)
  const outstanding = (client.invoices ?? [])
    .filter((i: { status: string }) => i.status === 'sent' || i.status === 'overdue')
    .reduce((s: number, i: { total: number; currency: string }) => s + Number(i.total), 0)

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Welcome back, {client.name} 👋</h1>
        <p className="text-sm text-on-surface-variant mt-1">Here's your project snapshot with {businessName}.</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active projects', value: activeProjects.length, href: null },
          { label: 'Awaiting your review', value: pendingFiles, href: `/p/${slug}/files`, highlight: pendingFiles > 0 },
          { label: 'Unread messages', value: unreadMessages, href: `/p/${slug}/messages`, highlight: unreadMessages > 0 },
          { label: 'Outstanding invoices', value: outstanding > 0 ? formatCurrency(outstanding) : '—', href: `/p/${slug}/invoices`, highlight: outstanding > 0 },
        ].map(stat => (
          <div key={stat.label} className={cn(
            'bg-white rounded-xl border p-4 flex flex-col gap-1',
            stat.highlight ? 'border-ds-secondary/30' : 'border-outline-variant'
          )}>
            <p className={cn('text-xl font-bold', stat.highlight ? 'text-ds-secondary' : 'text-on-surface')}>
              {stat.value}
            </p>
            <p className="text-xs text-on-surface-variant">{stat.label}</p>
            {stat.href && (
              <Link href={stat.href} className="text-[11px] font-semibold text-ds-secondary hover:underline mt-1">
                View →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Projects */}
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-on-surface">Your Projects</h2>

        {projects.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No projects added yet. Your freelancer will add them shortly.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {(projects as (Project & {
              files: { status: string }[]
              messages: { sender_type: string; read_at: string | null }[]
            })[]).map(project => {
              const cfg = STATUS_CONFIG[project.status]
              const pending = (project.files ?? []).filter(f => f.status === 'pending').length
              const unread = (project.messages ?? []).filter(m => m.sender_type === 'freelancer' && !m.read_at).length

              return (
                <div key={project.id} className="bg-white rounded-xl border border-outline-variant p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-on-surface">{project.title}</h3>
                      {project.description && (
                        <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{project.description}</p>
                      )}
                    </div>
                    <div className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0', cfg.color)}>
                      <span className={cn('size-1.5 rounded-full', cfg.dot)} />
                      {cfg.label}
                    </div>
                  </div>

                  <p className="text-xs text-on-surface-variant">{cfg.description}</p>

                  <div className="flex items-center gap-4 text-xs text-on-surface-variant flex-wrap">
                    {project.due_date && <span>Due {formatDate(project.due_date)}</span>}
                    {pending > 0 && (
                      <Link href={`/p/${slug}/files`} className="text-amber-600 font-semibold hover:underline">
                        {pending} file{pending > 1 ? 's' : ''} awaiting review →
                      </Link>
                    )}
                    {unread > 0 && (
                      <Link href={`/p/${slug}/messages`} className="text-ds-secondary font-semibold hover:underline">
                        {unread} new message{unread > 1 ? 's' : ''} →
                      </Link>
                    )}
                    <span className="ml-auto">Updated {formatRelativeTime(project.updated_at)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { href: `/p/${slug}/files`, icon: Paperclip, label: 'Review Files', desc: 'View and approve deliverables' },
          { href: `/p/${slug}/invoices`, icon: FileText, label: 'Invoices', desc: 'View and pay outstanding invoices' },
          { href: `/p/${slug}/messages`, icon: MessageSquare, label: 'Messages', desc: 'Send a message to your team' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-white rounded-xl border border-outline-variant p-4 flex items-center gap-3 hover:border-ds-secondary/40 hover:shadow-sm transition-all group"
          >
            <div className="size-9 rounded-lg bg-ds-secondary/8 flex items-center justify-center shrink-0">
              <link.icon className="size-4 text-ds-secondary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-on-surface">{link.label}</p>
              <p className="text-xs text-on-surface-variant">{link.desc}</p>
            </div>
            <ChevronRight className="size-4 text-on-surface-variant ml-auto group-hover:text-ds-secondary transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}
