import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  Clock, Layers, Paperclip, FileText, MessageSquare,
  ChevronRight, AlertTriangle, CheckCircle2,
} from 'lucide-react'
import { Project } from '@/types/database'

const STATUS_CONFIG: Record<Project['status'], {
  label: string; color: string; bg: string; dot: string; accent: string; description: string
}> = {
  briefing:    { label: 'Briefing',         color: 'text-slate-600',  bg: 'bg-slate-50',  dot: 'bg-slate-400',  accent: '#94a3b8', description: 'Getting started — gathering requirements' },
  in_progress: { label: 'In Progress',      color: 'text-blue-600',   bg: 'bg-blue-50',   dot: 'bg-blue-500',   accent: '#3b82f6', description: 'Active development underway' },
  review:      { label: 'Ready for Review', color: 'text-amber-600',  bg: 'bg-amber-50',  dot: 'bg-amber-500',  accent: '#f59e0b', description: 'Awaiting your feedback and approval' },
  done:        { label: 'Complete',         color: 'text-green-600',  bg: 'bg-green-50',  dot: 'bg-green-500',  accent: '#22c55e', description: 'Project successfully delivered' },
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
      profiles:freelancer_id ( full_name, business_name, avatar_url ),
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

  const profile = Array.isArray(client.profiles) ? (client.profiles[0] ?? null) : client.profiles
  const businessName = profile?.business_name || profile?.full_name || 'Your Portal'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects = ((client.projects ?? []) as any[]).filter(p => !p.deleted_at)
  const activeProjects = projects.filter((p: Project) => p.status !== 'done')
  const doneProjects = projects.filter((p: Project) => p.status === 'done')
  const pendingFiles = projects.reduce((s: number, p: { files: { status: string }[] }) =>
    s + (p.files ?? []).filter((f: { status: string }) => f.status === 'pending').length, 0)
  const unreadMessages = projects.reduce((s: number, p: { messages: { sender_type: string; read_at: string | null }[] }) =>
    s + (p.messages ?? []).filter((m: { sender_type: string; read_at: string | null }) => m.sender_type === 'freelancer' && !m.read_at).length, 0)
  const outstanding = (client.invoices ?? [])
    .filter((i: { status: string }) => i.status === 'sent' || i.status === 'overdue')
    .reduce((s: number, i: { total: number }) => s + Number(i.total), 0)
  const overdueInvoices = (client.invoices ?? []).filter((i: { status: string }) => i.status === 'overdue').length

  return (
    <div className="flex flex-col gap-8 pb-12">

      {/* Hero strip */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="relative px-8 py-8" style={{ background: 'linear-gradient(135deg, #f8faff 0%, #eef3ff 100%)' }}>
          <div className="absolute right-0 top-0 bottom-0 w-64 opacity-30 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 80% 50%, #3b82f6 0%, transparent 70%)' }} />
          <div className="relative">
            <p className="text-xs font-semibold text-ds-secondary uppercase tracking-wider mb-2">Your workspace</p>
            <h1 className="text-3xl font-extrabold text-on-surface leading-tight">
              Welcome back, {client.name}
            </h1>
            <p className="text-sm text-on-surface-variant mt-2">
              Here's what's happening across your {projects.length} project{projects.length !== 1 ? 's' : ''} with {businessName}.
            </p>
          </div>
        </div>

        {/* Stat bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 border-t border-slate-100">
          {[
            { label: 'Active projects',  value: activeProjects.length,                        icon: Layers,        color: '#0051d5', href: null },
            { label: 'Files to review',  value: pendingFiles,                                 icon: Paperclip,     color: '#f59e0b', href: pendingFiles > 0   ? `/p/${slug}/files`    : null },
            { label: 'Unread messages',  value: unreadMessages,                               icon: MessageSquare, color: '#0051d5', href: unreadMessages > 0 ? `/p/${slug}/messages` : null },
            { label: 'Outstanding',      value: outstanding > 0 ? formatCurrency(outstanding) : '—', icon: FileText, color: overdueInvoices > 0 ? '#ef4444' : '#64748b', href: outstanding > 0 ? `/p/${slug}/invoices` : null },
          ].map(stat => {
            const El = stat.href ? Link : 'div'
            return (
              <El
                key={stat.label}
                // @ts-expect-error href only on Link
                href={stat.href ?? undefined}
                className={cn('flex items-center gap-3 px-6 py-5', stat.href && 'hover:bg-slate-50 transition-colors cursor-pointer group')}
              >
                <div className="size-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: stat.color + '15' }}>
                  <stat.icon className="size-4.5" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-xl font-bold text-on-surface leading-none">{stat.value}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{stat.label}</p>
                </div>
                {stat.href && <ChevronRight className="size-4 text-slate-300 group-hover:text-ds-secondary ml-auto transition-colors" />}
              </El>
            )
          })}
        </div>
      </div>

      {/* Action alerts */}
      {(pendingFiles > 0 || unreadMessages > 0 || overdueInvoices > 0) && (
        <div className="flex flex-col gap-2">
          {pendingFiles > 0 && (
            <Link href={`/p/${slug}/files`} className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 hover:bg-amber-100 transition-colors group shadow-sm">
              <div className="size-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0"><Paperclip className="size-4 text-amber-700" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800">{pendingFiles} file{pendingFiles > 1 ? 's' : ''} awaiting your review</p>
                <p className="text-xs text-amber-600">Download, review, then approve or request changes</p>
              </div>
              <ChevronRight className="size-4 text-amber-400 group-hover:text-amber-700 transition-colors" />
            </Link>
          )}
          {overdueInvoices > 0 && (
            <Link href={`/p/${slug}/invoices`} className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 hover:bg-red-100 transition-colors group shadow-sm">
              <div className="size-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0"><AlertTriangle className="size-4 text-red-600" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">{overdueInvoices} overdue invoice{overdueInvoices > 1 ? 's' : ''}</p>
                <p className="text-xs text-red-500">Payment past due — click to pay now</p>
              </div>
              <ChevronRight className="size-4 text-red-400 group-hover:text-red-600 transition-colors" />
            </Link>
          )}
          {unreadMessages > 0 && (
            <Link href={`/p/${slug}/messages`} className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-3.5 hover:bg-blue-100 transition-colors group shadow-sm">
              <div className="size-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0"><MessageSquare className="size-4 text-blue-600" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-800">{unreadMessages} new message{unreadMessages > 1 ? 's' : ''} from {businessName}</p>
                <p className="text-xs text-blue-500">Click to read and reply</p>
              </div>
              <ChevronRight className="size-4 text-blue-400 group-hover:text-blue-600 transition-colors" />
            </Link>
          )}
        </div>
      )}

      {/* Projects — two-column grid on wide screens */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface">Your Projects</h2>
          {doneProjects.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-on-surface-variant">
              <CheckCircle2 className="size-3.5 text-green-500" />
              {doneProjects.length} completed
            </span>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-14 flex flex-col items-center text-center gap-4">
            <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Layers className="size-7 text-slate-400" />
            </div>
            <div>
              <p className="font-semibold text-on-surface">No projects yet</p>
              <p className="text-sm text-on-surface-variant mt-1">{businessName} will add your projects here soon.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(projects as (Project & { files: { status: string }[]; messages: { sender_type: string; read_at: string | null }[] })[]).map(project => {
              const cfg = STATUS_CONFIG[project.status]
              const pending = (project.files ?? []).filter(f => f.status === 'pending').length
              const unread = (project.messages ?? []).filter(m => m.sender_type === 'freelancer' && !m.read_at).length

              return (
                <div key={project.id} className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Color accent top strip */}
                  <div className="h-1.5 w-full" style={{ background: cfg.accent }} />
                  <div className="p-6 flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-on-surface text-base leading-tight">{project.title}</h3>
                        {project.description && (
                          <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">{project.description}</p>
                        )}
                      </div>
                      <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg shrink-0', cfg.color, cfg.bg)}>
                        <span className={cn('size-1.5 rounded-full', cfg.dot)} />
                        {cfg.label}
                      </span>
                    </div>

                    <p className="text-xs text-on-surface-variant italic">{cfg.description}</p>

                    {/* Alerts for this project */}
                    {(pending > 0 || unread > 0) && (
                      <div className="flex flex-col gap-1.5">
                        {pending > 0 && (
                          <Link href={`/p/${slug}/files`} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors">
                            <Paperclip className="size-3.5 text-amber-600 shrink-0" />
                            <span className="text-xs font-semibold text-amber-700">{pending} file{pending > 1 ? 's' : ''} awaiting review →</span>
                          </Link>
                        )}
                        {unread > 0 && (
                          <Link href={`/p/${slug}/messages`} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors">
                            <MessageSquare className="size-3.5 text-blue-600 shrink-0" />
                            <span className="text-xs font-semibold text-blue-700">{unread} new message{unread > 1 ? 's' : ''} →</span>
                          </Link>
                        )}
                      </div>
                    )}

                    {/* Footer meta */}
                    <div className="flex items-center gap-4 text-xs text-on-surface-variant pt-1 border-t border-slate-100">
                      {project.due_date && (
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />Due {formatDate(project.due_date)}
                        </span>
                      )}
                      <span className="ml-auto">Updated {formatRelativeTime(project.updated_at)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {([
          { href: `/p/${slug}/files`,    icon: Paperclip,     label: 'Review Files',    desc: 'Download and approve deliverables',   accent: '#f59e0b', badge: pendingFiles > 0   ? pendingFiles   : null },
          { href: `/p/${slug}/invoices`, icon: FileText,      label: 'Invoices',        desc: 'View and pay outstanding invoices',   accent: '#0051d5', badge: null },
          { href: `/p/${slug}/messages`, icon: MessageSquare, label: 'Messages',        desc: `Chat directly with ${businessName}`,  accent: '#0051d5', badge: unreadMessages > 0 ? unreadMessages : null },
        ] as const).map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="relative bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:border-ds-secondary/40 transition-all group"
          >
            <div className="size-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: link.accent + '15' }}>
              <link.icon className="size-5" style={{ color: link.accent }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-on-surface">{link.label}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{link.desc}</p>
            </div>
            {link.badge !== null && (
              <span className="size-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0" style={{ background: link.accent }}>
                {link.badge}
              </span>
            )}
            <ChevronRight className="size-4 text-slate-300 group-hover:text-ds-secondary transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}
