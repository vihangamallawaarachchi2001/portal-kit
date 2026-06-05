import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { formatDate, formatCurrency, formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import {
  Plus, CheckCircle2, Clock, XCircle, Circle,
  ChevronRight, FolderOpen,
} from 'lucide-react'
import { AddProjectButton } from '@/components/dashboard/add-project-button'
import { ProjectStatusSelector } from '@/components/dashboard/project-status-selector'
import { Project } from '@/types/database'

const STATUS_CONFIG: Record<Project['status'], { label: string; color: string; bg: string; icon: React.ElementType }> = {
  briefing:    { label: 'Briefing',     color: 'text-slate-600',  bg: 'bg-slate-50 border-slate-200',  icon: Circle },
  in_progress: { label: 'In Progress',  color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200',    icon: Clock },
  review:      { label: 'In Review',    color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200',  icon: Clock },
  done:        { label: 'Complete',     color: 'text-green-600',  bg: 'bg-green-50 border-green-200',  icon: CheckCircle2 },
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

  const outstandingTotal = (client.invoices ?? [])
    .filter((i: { status: string }) => i.status === 'sent' || i.status === 'overdue')
    .reduce((s: number, i: { total: number }) => s + Number(i.total), 0)

  return (
    <div className="max-w-5xl flex flex-col gap-8">
      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total projects', value: projects.length },
          { label: 'Active', value: projects.filter((p: { status: string }) => p.status !== 'done').length },
          { label: 'Outstanding', value: formatCurrency(outstandingTotal) },
          { label: 'Portal slug', value: `/${client.portal_slug}` },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-outline-variant p-4">
            <p className="text-xs text-on-surface-variant mb-1">{s.label}</p>
            <p className="text-base font-bold text-on-surface truncate">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* Projects */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-on-surface">Projects</h2>
            <AddProjectButton clientId={id} />
          </div>

          {projects.length === 0 ? (
            <div className="bg-white rounded-xl border border-outline-variant p-8 text-center">
              <FolderOpen className="size-8 text-on-surface-variant mx-auto mb-3" />
              <p className="text-sm font-semibold text-on-surface mb-1">No projects yet</p>
              <p className="text-xs text-on-surface-variant">Add a project to start tracking work for this client.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {projects.map((project: Project & {
                files: { status: string }[]
                messages: { sender_type: string; read_at: string | null }[]
              }) => {
                const config = STATUS_CONFIG[project.status]
                const pendingFiles = (project.files ?? []).filter((f: { status: string }) => f.status === 'pending').length
                const unreadMsgs = (project.messages ?? []).filter((m: { sender_type: string; read_at: string | null }) => m.sender_type === 'client' && !m.read_at).length

                return (
                  <div key={project.id} className="bg-white rounded-xl border border-outline-variant p-5 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-on-surface text-sm mb-0.5 truncate">{project.title}</h3>
                        {project.description && (
                          <p className="text-xs text-on-surface-variant line-clamp-2">{project.description}</p>
                        )}
                      </div>
                      <ProjectStatusSelector projectId={project.id} currentStatus={project.status} />
                    </div>

                    <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                      {project.due_date && (
                        <span className={cn(
                          'flex items-center gap-1',
                          new Date(project.due_date) < new Date() && project.status !== 'done' ? 'text-red-500 font-semibold' : ''
                        )}>
                          Due {formatDate(project.due_date)}
                        </span>
                      )}
                      {pendingFiles > 0 && (
                        <span className="text-amber-600 font-medium">{pendingFiles} pending approval</span>
                      )}
                      {unreadMsgs > 0 && (
                        <span className="text-ds-secondary font-medium">{unreadMsgs} new message{unreadMsgs > 1 ? 's' : ''}</span>
                      )}
                      <span className="ml-auto text-on-surface-variant">Updated {formatRelativeTime(project.updated_at)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent invoices */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-on-surface">Recent Invoices</h2>
            <Link href={`/dashboard/clients/${id}/invoices`} className="text-xs text-ds-secondary hover:underline font-semibold">
              View all →
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-outline-variant overflow-hidden">
            {invoices.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-on-surface-variant">No invoices yet</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant">
                {invoices.map((inv: { id: string; invoice_number: string; total: number; currency: string; status: string; due_date: string | null }) => (
                  <div key={inv.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold text-on-surface">{inv.invoice_number}</p>
                      {inv.due_date && <p className="text-[11px] text-on-surface-variant">Due {formatDate(inv.due_date)}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-on-surface">{formatCurrency(inv.total, inv.currency)}</span>
                      <InvoiceStatusBadge status={inv.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    draft:   { label: 'Draft',   className: 'bg-surface-container text-on-surface-variant' },
    sent:    { label: 'Sent',    className: 'bg-blue-50 text-blue-600' },
    paid:    { label: 'Paid',    className: 'bg-green-50 text-green-700' },
    overdue: { label: 'Overdue', className: 'bg-red-50 text-red-600' },
  }
  const c = config[status] ?? config.draft
  return (
    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-md', c.className)}>
      {c.label}
    </span>
  )
}
