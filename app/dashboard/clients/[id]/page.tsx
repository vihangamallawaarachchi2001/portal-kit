import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { formatDate, formatCurrency, formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  FolderOpen, Clock, CheckCircle2, DollarSign, AlertTriangle,
  ArrowRight, Layers, TrendingUp, Paperclip, MessageSquare, Plus,
} from 'lucide-react'
import { AddProjectButton } from '@/components/dashboard/add-project-button'
import { ProjectStatusSelector } from '@/components/dashboard/project-status-selector'
import { Project } from '@/types/database'

const STATUS_CONFIG: Record<Project['status'], {
  label: string; dot: string; badge: string; border: string
}> = {
  briefing:    { label: 'Briefing',    dot: 'bg-slate-400',  badge: 'bg-slate-100 text-slate-600',  border: '#94a3b8' },
  in_progress: { label: 'In Progress', dot: 'bg-blue-500',   badge: 'bg-blue-50 text-blue-700',     border: '#3b82f6' },
  review:      { label: 'In Review',   dot: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-700',   border: '#f59e0b' },
  done:        { label: 'Done',        dot: 'bg-green-500',  badge: 'bg-green-50 text-green-700',   border: '#22c55e' },
}

const INVOICE_STATUS: Record<string, { label: string; cls: string; dot: string }> = {
  draft:   { label: 'Draft',   cls: 'bg-surface-container text-on-surface-variant', dot: 'bg-slate-400'   },
  sent:    { label: 'Sent',    cls: 'bg-blue-50 text-blue-700',                     dot: 'bg-blue-500'    },
  paid:    { label: 'Paid',    cls: 'bg-emerald-50 text-emerald-700',               dot: 'bg-emerald-500' },
  overdue: { label: 'Overdue', cls: 'bg-red-50 text-red-700',                       dot: 'bg-red-500'     },
}

export default async function ClientOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: client } = await supabase
    .from('clients')
    .select(`
      *,
      projects (
        *,
        files ( id, status ),
        messages ( id, sender_type, read_at )
      ),
      invoices ( id, invoice_number, total, currency, status, due_date, created_at )
    `)
    .eq('id', id)
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!client) notFound()

  const projects = (client.projects ?? [])
    .filter((p: { deleted_at?: string | null }) => !p.deleted_at)
    .sort((a: { updated_at: string }, b: { updated_at: string }) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

  const invoices = (client.invoices ?? [])
    .filter((i: { deleted_at?: string | null }) => !i.deleted_at)
    .sort((a: { created_at: string }, b: { created_at: string }) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const activeProjects     = projects.filter((p: { status: string }) => p.status !== 'done')
  const outstandingTotal   = (client.invoices ?? [])
    .filter((i: { status: string }) => i.status === 'sent' || i.status === 'overdue')
    .reduce((s: number, i: { total: number }) => s + Number(i.total), 0)
  const totalPendingFiles  = projects.reduce((s: number, p: { files?: { status: string }[] }) =>
    s + (p.files ?? []).filter((f: { status: string }) => f.status === 'pending').length, 0)
  const totalUnread        = projects.reduce((s: number, p: { messages?: { sender_type: string; read_at: string | null }[] }) =>
    s + (p.messages ?? []).filter((m: { sender_type: string; read_at: string | null }) => m.sender_type === 'client' && !m.read_at).length, 0)

  return (
    <div className="max-w-5xl flex flex-col gap-7">

      {/* ── Summary stat cards ───────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={FolderOpen}
          iconBg="bg-ds-secondary/10"
          iconColor="text-ds-secondary"
          label="Projects"
          value={String(projects.length)}
        />
        <StatCard
          icon={Clock}
          iconBg={activeProjects.length > 0 ? 'bg-amber-50' : 'bg-surface-container'}
          iconColor={activeProjects.length > 0 ? 'text-amber-600' : 'text-on-surface-variant'}
          label="Active"
          value={String(activeProjects.length)}
          valueColor={activeProjects.length > 0 ? 'text-amber-600' : undefined}
        />
        <StatCard
          icon={DollarSign}
          iconBg={outstandingTotal > 0 ? 'bg-ds-secondary/10' : 'bg-surface-container'}
          iconColor={outstandingTotal > 0 ? 'text-ds-secondary' : 'text-on-surface-variant'}
          label="Outstanding"
          value={formatCurrency(outstandingTotal)}
          valueColor={outstandingTotal > 0 ? 'text-ds-secondary' : undefined}
        />
        <StatCard
          icon={Layers}
          iconBg="bg-surface-container"
          iconColor="text-on-surface-variant"
          label="Portal slug"
          value={`/${client.portal_slug}`}
          mono
        />
      </div>

      {/* ── Alert chips ─────────────────────────────── */}
      {(totalPendingFiles > 0 || totalUnread > 0) && (
        <div className="flex flex-wrap gap-2 -mt-3">
          {totalPendingFiles > 0 && (
            <Link
              href={`/dashboard/clients/${id}/files`}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
            >
              <Paperclip className="size-3" />
              {totalPendingFiles} file{totalPendingFiles !== 1 ? 's' : ''} awaiting review
              <ArrowRight className="size-3" />
            </Link>
          )}
          {totalUnread > 0 && (
            <Link
              href={`/dashboard/clients/${id}/messages`}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-ds-secondary/10 text-ds-secondary hover:bg-ds-secondary/15 transition-colors"
            >
              <MessageSquare className="size-3" />
              {totalUnread} unread message{totalUnread !== 1 ? 's' : ''}
              <ArrowRight className="size-3" />
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-7">

        {/* ── Projects ─────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-on-surface">Projects</h2>
              {projects.length > 0 && (
                <span className="text-[11px] font-semibold bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full">
                  {projects.length}
                </span>
              )}
            </div>
            <AddProjectButton clientId={id} />
          </div>

          {projects.length === 0 ? (
            <div className="bg-white rounded-md shadow-sm p-10 flex flex-col items-center text-center gap-4">
              <div className="size-14 rounded-md bg-ds-secondary/8 flex items-center justify-center">
                <FolderOpen className="size-7 text-ds-secondary/60" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">No projects yet</p>
                <p className="text-xs text-on-surface-variant mt-1 max-w-xs">
                  Add a project to start tracking work, sharing files, and communicating with this client.
                </p>
              </div>
              <AddProjectButton clientId={id} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(projects as (Project & {
                files: { status: string }[]
                messages: { sender_type: string; read_at: string | null }[]
              })[]).map(project => {
                const cfg          = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.briefing
                const pendingFiles = (project.files ?? []).filter(f => f.status === 'pending').length
                const unreadMsgs   = (project.messages ?? []).filter(m => m.sender_type === 'client' && !m.read_at).length
                const isOverdue    = project.due_date && new Date(project.due_date) < new Date() && project.status !== 'done'

                return (
                  <div
                    key={project.id}
                    className="group bg-white rounded-md shadow-sm hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* Status color bar */}
                    <div className="h-[3px] w-full" style={{ background: cfg.border }} />

                    <div className="p-4 flex flex-col gap-3">
                      {/* Status badge + selector */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full', cfg.badge)}>
                          <span className={cn('size-1.5 rounded-full shrink-0', cfg.dot)} />
                          {cfg.label}
                        </span>
                        <ProjectStatusSelector projectId={project.id} currentStatus={project.status} />
                      </div>

                      {/* Title + description */}
                      <div>
                        <h3 className="font-bold text-[14px] text-on-surface leading-snug">{project.title}</h3>
                        {project.description && (
                          <p className="text-xs text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">{project.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className={cn(
                      'px-4 py-2.5 flex items-center gap-3 text-[11px]',
                      isOverdue ? 'bg-red-50' : 'bg-surface-container/40'
                    )}>
                      {project.due_date ? (
                        <span className={cn('flex items-center gap-1', isOverdue ? 'text-red-600 font-semibold' : 'text-on-surface-variant')}>
                          <Clock className="size-3 shrink-0" />
                          {isOverdue ? 'Overdue — ' : 'Due '}{formatDate(project.due_date)}
                        </span>
                      ) : (
                        <span className="text-on-surface-variant/40">No due date</span>
                      )}
                      <span className="ml-auto flex items-center gap-3">
                        {pendingFiles > 0 && (
                          <Link
                            href={`/dashboard/clients/${id}/files`}
                            className="flex items-center gap-1 text-amber-600 font-semibold hover:underline"
                          >
                            <Paperclip className="size-3" />{pendingFiles} pending
                          </Link>
                        )}
                        {unreadMsgs > 0 && (
                          <Link
                            href={`/dashboard/clients/${id}/messages`}
                            className="flex items-center gap-1 text-ds-secondary font-semibold hover:underline"
                          >
                            <MessageSquare className="size-3" />{unreadMsgs} new
                          </Link>
                        )}
                        <span className="text-on-surface-variant">{formatRelativeTime(project.updated_at)}</span>
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Recent invoices ──────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface">Recent Invoices</h2>
            <Link
              href={`/dashboard/clients/${id}/invoices`}
              className="text-xs font-semibold text-ds-secondary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="bg-white rounded-md shadow-sm overflow-hidden">
            {invoices.length === 0 ? (
              <div className="p-8 flex flex-col items-center text-center gap-3">
                <div className="size-10 rounded-md bg-surface-container flex items-center justify-center">
                  <TrendingUp className="size-5 text-on-surface-variant" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">No invoices yet</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Create invoices to track payments.</p>
                </div>
                <Link
                  href={`/dashboard/clients/${id}/invoices`}
                  className="inline-flex items-center gap-1 h-8 px-3 rounded-md bg-ds-secondary text-white text-xs font-semibold hover:bg-ds-secondary-container transition-colors mt-1"
                >
                  <Plus className="size-3.5" /> Create invoice
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/30">
                {(invoices as { id: string; invoice_number: string; total: number; currency: string; status: string; due_date: string | null }[])
                  .map(inv => {
                    const cfg       = INVOICE_STATUS[inv.status] ?? INVOICE_STATUS.draft
                    const isOverdue = inv.status === 'overdue'
                    const isPaid    = inv.status === 'paid'
                    return (
                      <div
                        key={inv.id}
                        className={cn(
                          'relative flex items-center justify-between px-4 py-3 transition-colors',
                          isOverdue ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-surface-container/30'
                        )}
                      >
                        {/* Colored left border */}
                        <div className={cn(
                          'absolute left-0 top-0 bottom-0 w-0.75',
                          isOverdue ? 'bg-red-500' : isPaid ? 'bg-emerald-500' : 'bg-transparent'
                        )} />

                        <div className="pl-1">
                          <p className="text-xs font-semibold text-on-surface">{inv.invoice_number}</p>
                          {inv.due_date && (
                            <p className={cn('text-[11px] mt-0.5', isOverdue ? 'text-red-500 font-medium' : 'text-on-surface-variant')}>
                              Due {formatDate(inv.due_date)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className={cn(
                            'text-sm font-bold tabular-nums',
                            isPaid ? 'text-emerald-600' : isOverdue ? 'text-red-600' : 'text-on-surface'
                          )}>
                            {formatCurrency(inv.total, inv.currency)}
                          </span>
                          <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full', cfg.cls)}>
                            <span className={cn('size-1 rounded-full', cfg.dot)} />
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Quick-access links */}
          <div className="flex flex-col gap-2">
            <Link
              href={`/dashboard/clients/${id}/files`}
              className="group flex items-center justify-between px-4 py-3 bg-white rounded-md shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-md bg-amber-50 flex items-center justify-center shrink-0">
                  <Paperclip className="size-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">Files</p>
                  <p className="text-xs text-on-surface-variant">Share deliverables for review</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-on-surface-variant/30 group-hover:text-ds-secondary group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link
              href={`/dashboard/clients/${id}/messages`}
              className="group flex items-center justify-between px-4 py-3 bg-white rounded-md shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-md bg-ds-secondary/8 flex items-center justify-center shrink-0">
                  <MessageSquare className="size-4 text-ds-secondary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">Messages</p>
                  <p className="text-xs text-on-surface-variant">
                    {totalUnread > 0 ? `${totalUnread} unread message${totalUnread > 1 ? 's' : ''}` : 'Chat with your client'}
                  </p>
                </div>
              </div>
              {totalUnread > 0 && (
                <span className="text-[10px] font-bold bg-ds-secondary text-white rounded-full px-1.5 py-0.5">
                  {totalUnread}
                </span>
              )}
              {!totalUnread && <ArrowRight className="size-4 text-on-surface-variant/30 group-hover:text-ds-secondary group-hover:translate-x-0.5 transition-all" />}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon, iconBg, iconColor, label, value, valueColor, mono,
}: {
  icon: React.ElementType; iconBg: string; iconColor: string
  label: string; value: string; valueColor?: string; mono?: boolean
}) {
  return (
    <div className="bg-white rounded-md shadow-sm p-4 flex flex-col gap-2.5">
      <div className={cn('size-8 rounded-md flex items-center justify-center shrink-0', iconBg)}>
        <Icon className={cn('size-4', iconColor)} />
      </div>
      <div>
        <p className={cn('text-base font-extrabold tracking-tight truncate', valueColor ?? 'text-on-surface', mono && 'font-mono text-sm')}>
          {value}
        </p>
        <p className="text-xs text-on-surface-variant mt-0.5">{label}</p>
      </div>
    </div>
  )
}

