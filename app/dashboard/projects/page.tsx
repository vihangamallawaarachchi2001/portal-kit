import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { FolderOpen, Clock, ArrowRight, Layers, Users } from 'lucide-react'
import Link from 'next/link'
import { NewProjectButton } from '@/components/dashboard/new-project-button'

export const revalidate = 0

const STATUS_CONFIG = {
  briefing:    { label: 'Briefing',    dot: 'bg-slate-400',  badge: 'bg-slate-100 text-slate-600',  border: '#94a3b8', strip: 'bg-slate-100' },
  in_progress: { label: 'In Progress', dot: 'bg-blue-500',   badge: 'bg-blue-50 text-blue-700',     border: '#3b82f6', strip: 'bg-blue-50'   },
  review:      { label: 'In Review',   dot: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-700',   border: '#f59e0b', strip: 'bg-amber-50'  },
  done:        { label: 'Done',        dot: 'bg-green-500',  badge: 'bg-green-50 text-green-700',   border: '#22c55e', strip: 'bg-green-50'  },
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const [{ data: projects }, { data: clientList }] = await Promise.all([
    supabase.from('projects').select('*, clients ( id, name )').eq('freelancer_id', user.id).is('deleted_at', null).order('updated_at', { ascending: false }),
    supabase.from('clients').select('id, name').eq('freelancer_id', user.id).eq('status', 'active').is('deleted_at', null),
  ])

  const all    = projects ?? []
  const active = all.filter(p => p.status !== 'done')
  const done   = all.filter(p => p.status === 'done')

  // Status distribution for the visual chips
  const statusCounts = Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
    key, cfg, count: all.filter(p => p.status === key).length,
  })).filter(s => s.count > 0)

  return (
    <div className="w-full min-h-screen">
      {/* ── Page header ─────────────────────────────────── */}
      <div className="px-8 pt-8 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-on-surface tracking-tight">Projects</h1>
            <p className="text-sm text-on-surface-variant mt-0.5">
              {all.length > 0 ? `${active.length} active · ${done.length} completed` : 'All your work in one place'}
            </p>
            {/* Status distribution chips */}
            {statusCounts.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                {statusCounts.map(({ key, cfg, count }) => (
                  <span
                    key={key}
                    className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full', cfg.badge)}
                  >
                    <span className={cn('size-1.5 rounded-full', cfg.dot)} />
                    {count} {cfg.label}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="shrink-0 mt-0.5">
            <NewProjectButton clients={clientList ?? []} />
          </div>
        </div>
      </div>

      <div className="px-8 pb-12">
        {all.length === 0 ? (
          <EmptyProjects clients={clientList ?? []} />
        ) : (
          <div className="flex flex-col gap-8">
            {active.length > 0 && <ProjectGroup title="Active" projects={active} />}
            {done.length > 0  && <ProjectGroup title="Completed" projects={done} faded />}
          </div>
        )}
      </div>
    </div>
  )
}

type ProjectRow = {
  id: string; title: string; status: string; due_date: string | null; description: string | null
  clients: { id: string; name: string } | null
}

function ProjectGroup({ title, projects, faded }: { title: string; projects: ProjectRow[]; faded?: boolean }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-bold text-on-surface">{title}</h2>
        <span className="text-[11px] font-semibold bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full">
          {projects.length}
        </span>
      </div>
      <div className={cn('grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3', faded && 'opacity-55')}>
        {projects.map(p => <ProjectCard key={p.id} project={p} />)}
      </div>
    </section>
  )
}

function ProjectCard({ project: p }: { project: ProjectRow }) {
  const cfg       = STATUS_CONFIG[p.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.briefing
  const isOverdue = p.due_date && new Date(p.due_date) < new Date() && p.status !== 'done'

  return (
    <Link
      href={p.clients ? `/dashboard/clients/${p.clients.id}` : '#'}
      className="group block bg-white rounded-md shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      {/* Status colour bar */}
      <div className="h-[3px] w-full" style={{ background: cfg.border }} />

      <div className="p-5 flex flex-col gap-4">
        {/* Top row: status badge + hover arrow */}
        <div className="flex items-center justify-between gap-2">
          <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full', cfg.badge)}>
            <span className={cn('size-1.5 rounded-full shrink-0', cfg.dot)} />
            {cfg.label}
          </span>
          <ArrowRight className="size-3.5 text-on-surface-variant/30 opacity-0 group-hover:opacity-100 group-hover:text-ds-secondary group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Title + client */}
        <div>
          <h3 className="font-bold text-[15px] text-on-surface leading-snug group-hover:text-ds-secondary transition-colors">
            {p.title}
          </h3>
          {p.clients && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <Users className="size-3 text-on-surface-variant/50 shrink-0" />
              <p className="text-xs text-on-surface-variant">{p.clients.name}</p>
            </div>
          )}
        </div>

        {/* Description */}
        {p.description && (
          <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2 -mt-1">{p.description}</p>
        )}
      </div>

      {/* Footer */}
      <div className={cn(
        'px-5 py-2.5 flex items-center gap-2',
        isOverdue ? 'bg-red-50' : 'bg-surface-container/30'
      )}>
        {p.due_date ? (
          <>
            <Clock className={cn('size-3 shrink-0', isOverdue ? 'text-red-500' : 'text-on-surface-variant/50')} />
            <span className={cn('text-[11px] font-medium', isOverdue ? 'text-red-600 font-semibold' : 'text-on-surface-variant')}>
              {isOverdue ? 'Overdue — ' : 'Due '}{formatDate(p.due_date)}
            </span>
          </>
        ) : (
          <span className="text-[11px] text-on-surface-variant/40">No due date set</span>
        )}
      </div>
    </Link>
  )
}

function EmptyProjects({ clients }: { clients: { id: string; name: string }[] }) {
  const hasClients = clients.length > 0
  return (
    <div className="flex flex-col items-center justify-center min-h-[58vh] text-center px-6">
      <div className="relative mb-8">
        <div className="size-28 rounded-3xl bg-ds-secondary/8 flex items-center justify-center">
          <div className="size-18 rounded-2xl bg-ds-secondary/12 flex items-center justify-center">
            <FolderOpen className="size-10 text-ds-secondary/70" strokeWidth={1.5} />
          </div>
        </div>
        <div className="absolute -top-1.5 -right-1.5 size-6 rounded-full bg-ds-secondary/20 flex items-center justify-center">
          <Layers className="size-3 text-ds-secondary" />
        </div>
        <div className="absolute -bottom-1 -left-3 size-4 rounded-full bg-amber-200" />
        <div className="absolute top-3 -left-4 size-2.5 rounded-full bg-ds-secondary/25" />
      </div>
      <h2 className="text-2xl font-bold text-on-surface tracking-tight max-w-xs">No projects yet</h2>
      <p className="text-base text-on-surface-variant mt-3 max-w-sm leading-relaxed">
        {hasClients
          ? 'You have clients ready — create your first project to start organising work.'
          : 'Projects live inside client portals. Add a client first, then create projects.'}
      </p>
      <div className="flex items-center gap-3 mt-8">
        {hasClients ? (
          <NewProjectButton clients={clients} label="Create First Project" />
        ) : (
          <Link href="/dashboard/clients" className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors shadow-sm shadow-ds-secondary/20">
            Add a Client
          </Link>
        )}
        <a href="https://docs.portalkit.io" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-10 px-6 rounded-md border border-outline-variant text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors">
          View Guide
        </a>
      </div>
      <p className="mt-10 text-xs text-on-surface-variant/60 max-w-xs">
        Tip: Each client gets their own portal with unlimited projects on the Pro plan.
      </p>
    </div>
  )
}
