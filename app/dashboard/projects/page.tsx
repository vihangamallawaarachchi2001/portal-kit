import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FolderOpen, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

export const revalidate = 0

const STATUS_LABEL: Record<string, string> = {
  briefing: 'Briefing',
  in_progress: 'In Progress',
  review: 'In Review',
  done: 'Done',
}

const STATUS_CLASS: Record<string, string> = {
  briefing: 'bg-surface-container text-on-surface-variant',
  in_progress: 'bg-ds-secondary/10 text-ds-secondary',
  review: 'bg-amber-50 text-amber-700',
  done: 'bg-green-50 text-green-700',
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: projects } = await supabase
    .from('projects')
    .select('*, clients ( id, name, portal_slug )')
    .eq('freelancer_id', user.id)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  const active = (projects ?? []).filter(p => p.status !== 'done')
  const completed = (projects ?? []).filter(p => p.status === 'done')

  return (
    <div className="w-full p-8 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Projects</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">
          All projects across your client portals.
        </p>
      </div>

      {projects?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="size-14 rounded-2xl bg-surface-container flex items-center justify-center">
            <FolderOpen className="size-6 text-on-surface-variant" />
          </div>
          <div>
            <p className="text-base font-semibold text-on-surface">No projects yet</p>
            <p className="text-sm text-on-surface-variant mt-1">
              Add a client first, then create projects inside their portal.
            </p>
          </div>
          <Link
            href="/dashboard/clients"
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors"
          >
            Go to Clients
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {active.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-on-surface">
                Active <span className="text-on-surface-variant font-normal">({active.length})</span>
              </h2>
              <div className="bg-white rounded-2xl border border-outline-variant divide-y divide-outline-variant/60 overflow-hidden">
                {active.map(p => (
                  <ProjectRow key={p.id} project={p} />
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-on-surface">
                Completed <span className="text-on-surface-variant font-normal">({completed.length})</span>
              </h2>
              <div className="bg-white rounded-2xl border border-outline-variant divide-y divide-outline-variant/60 overflow-hidden opacity-70">
                {completed.map(p => (
                  <ProjectRow key={p.id} project={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function ProjectRow({ project }: { project: { id: string; title: string; status: string; due_date: string | null; clients: { id: string; name: string; portal_slug: string } | null } }) {
  const client = project.clients
  return (
    <Link
      href={client ? `/dashboard/clients/${client.id}` : '#'}
      className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-container/50 transition-colors group"
    >
      <div className="size-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
        <FolderOpen className="size-4 text-on-surface-variant" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-on-surface truncate">{project.title}</p>
        {client && (
          <p className="text-xs text-on-surface-variant mt-0.5">{client.name}</p>
        )}
      </div>
      {project.due_date && (
        <span className="text-xs text-on-surface-variant hidden sm:block shrink-0">
          Due {formatDate(project.due_date)}
        </span>
      )}
      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-md shrink-0', STATUS_CLASS[project.status] ?? STATUS_CLASS.briefing)}>
        {STATUS_LABEL[project.status] ?? project.status}
      </span>
      <ArrowRight className="size-4 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </Link>
  )
}
