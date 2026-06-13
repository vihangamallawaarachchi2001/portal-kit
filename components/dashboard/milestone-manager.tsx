"use client"

import React, { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, Loader2, Plus, Trash2, CalendarCheck, CalendarDays, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Milestone {
  id: string
  title: string
  description: string | null
  due_date: string
  completed_at: string | null
}

function getMilestoneStatus(m: Milestone): 'completed' | 'overdue' | 'soon' | 'upcoming' {
  if (m.completed_at) return 'completed'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(m.due_date)
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'overdue'
  if (diffDays <= 3) return 'soon'
  return 'upcoming'
}

const STATUS_CONFIG = {
  completed: { label: 'Completed',  bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  overdue:   { label: 'Overdue',    bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-100'     },
  soon:      { label: 'Due soon',   bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-100'   },
  upcoming:  { label: 'Upcoming',   bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-100'   },
}

export function MilestoneManager({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [fetching, setFetching] = useState(false)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', dueDate: '', description: '' })
  const [isPending, startTransition] = useTransition()
  const [completing, setCompleting] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => { fetchList() }, [projectId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchList() {
    setFetching(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/milestones`)
      if (res.ok) {
        const json = await res.json()
        setMilestones(json.data ?? [])
      }
    } catch {
      toast.error('Unable to load milestones')
    } finally {
      setFetching(false)
    }
  }

  function handleClose() {
    if (!isPending) { setOpen(false); setForm({ title: '', dueDate: '', description: '' }) }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form.title.trim() || !form.dueDate) return
    startTransition(async () => {
      const res = await fetch(`/api/projects/${projectId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title.trim(), due_date: form.dueDate, description: form.description || null }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        toast.error(d.error ?? 'Failed to add milestone')
        return
      }
      handleClose()
      await fetchList()
      router.refresh()
      toast.success('Milestone added')
    })
  }

  async function completeMilestone(id: string) {
    setCompleting(id)
    try {
      const res = await fetch(`/api/milestones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed_at: new Date().toISOString() }),
      })
      if (!res.ok) { toast.error('Failed to complete milestone'); return }
      await fetchList()
      router.refresh()
      toast.success('Milestone marked as complete')
    } catch {
      toast.error('Failed to complete milestone')
    } finally {
      setCompleting(null)
    }
  }

  async function deleteMilestone(id: string) {
    setDeleting(id)
    try {
      const res = await fetch(`/api/milestones/${id}`, { method: 'DELETE' })
      if (!res.ok) { toast.error('Failed to delete milestone'); return }
      await fetchList()
      router.refresh()
      toast.success('Milestone deleted')
    } catch {
      toast.error('Failed to delete milestone')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-outline-variant/20 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="size-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
            <CalendarCheck className="size-4.5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface">Milestones</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Track checkpoints and keep your client updated on progress.</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-md bg-ds-secondary text-white text-xs font-semibold hover:bg-ds-secondary/90 transition-colors shrink-0"
        >
          <Plus className="size-3.5" /> Add milestone
        </button>
      </div>

      {/* List */}
      <div className="p-4 space-y-2.5">
        {fetching ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-on-surface-variant">
            <Loader2 className="size-4 animate-spin" /> Loading milestones…
          </div>
        ) : milestones.length === 0 ? (
          <div className="rounded-xl border border-dashed border-outline-variant/40 bg-surface-container/30 p-6 text-center">
            <CalendarCheck className="size-8 text-on-surface-variant/30 mx-auto mb-2" />
            <p className="text-sm font-medium text-on-surface-variant">No milestones yet</p>
            <p className="text-xs text-on-surface-variant/70 mt-1">Track key deliverables and keep your client updated on progress.</p>
            <button
              onClick={() => setOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 h-8 px-4 rounded-md bg-ds-secondary text-white text-xs font-semibold hover:bg-ds-secondary/90 transition-colors"
            >
              <Plus className="size-3.5" />Add first milestone
            </button>
          </div>
        ) : (
          milestones.map(m => {
            const status = getMilestoneStatus(m)
            const cfg = STATUS_CONFIG[status]
            return (
              <div
                key={m.id}
                className={cn(
                  'group flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors',
                  cfg.bg, cfg.border
                )}
              >
                <button
                  onClick={() => !m.completed_at && completeMilestone(m.id)}
                  disabled={!!m.completed_at || completing === m.id}
                  className="mt-0.5 shrink-0 text-on-surface-variant hover:text-emerald-600 disabled:cursor-default disabled:opacity-60 transition-colors"
                  title={m.completed_at ? 'Completed' : 'Mark as complete'}
                >
                  {completing === m.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : m.completed_at ? (
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  ) : (
                    <Circle className="size-4" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-semibold', m.completed_at ? 'line-through text-on-surface-variant' : 'text-on-surface')}>
                    {m.title}
                  </p>
                  {m.description && <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{m.description}</p>}
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant">
                      <CalendarDays className="size-3" />
                      {new Date(m.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full', cfg.bg, cfg.text, 'border', cfg.border)}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteMilestone(m.id)}
                  disabled={deleting === m.id}
                  className="mt-0.5 shrink-0 text-on-surface-variant/40 hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 transition-all disabled:cursor-default"
                  title="Delete milestone"
                >
                  {deleting === m.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Add milestone dialog */}
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
          <DialogTitle className="sr-only">Add milestone</DialogTitle>

          {/* Dialog header */}
          <div
            className="px-6 pt-6 pb-5 border-b border-outline-variant/30"
            style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.06) 0%, transparent 70%)' }}
          >
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-md bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                <CalendarCheck className="size-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-on-surface">Add milestone</h2>
                <p className="text-sm text-on-surface-variant mt-0.5 leading-relaxed">
                  Define a project checkpoint with a due date. Your client will be notified on completion.
                </p>
              </div>
            </div>
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface" htmlFor="ms-title">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="ms-title"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Design mockups delivered"
                  required
                  disabled={isPending}
                  className="h-10 rounded-md"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface" htmlFor="ms-due">
                  Due date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-on-surface-variant/60 pointer-events-none" />
                  <Input
                    id="ms-due"
                    type="date"
                    value={form.dueDate}
                    onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                    required
                    disabled={isPending}
                    className="h-10 rounded-md pl-9"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface" htmlFor="ms-desc">
                  Description{' '}
                  <span className="text-[10px] font-normal text-on-surface-variant">(optional)</span>
                </label>
                <Textarea
                  id="ms-desc"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="What's expected at this checkpoint…"
                  rows={3}
                  disabled={isPending}
                  className="rounded-md resize-none text-sm"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-outline-variant/30 flex items-center justify-end gap-2.5 bg-surface-container/20">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="inline-flex items-center h-9 px-4 rounded-md text-sm font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={isPending || !form.title.trim() || !form.dueDate}
                className="h-9 px-5 rounded-md"
              >
                {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
                Add milestone
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MilestoneManager
