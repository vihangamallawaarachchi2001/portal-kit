'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, FolderOpen, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS = [
  { value: 'briefing',    label: 'Briefing',     dot: 'bg-slate-400',  cls: 'text-slate-600' },
  { value: 'in_progress', label: 'In Progress',  dot: 'bg-blue-500',   cls: 'text-blue-700'  },
  { value: 'review',      label: 'In Review',    dot: 'bg-amber-500',  cls: 'text-amber-700' },
  { value: 'done',        label: 'Done',         dot: 'bg-green-500',  cls: 'text-green-700' },
]

export function AddProjectButton({ clientId }: { clientId: string }) {
  const router      = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    title:       '',
    description: '',
    status:      'briefing',
    due_date:    '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await fetch(`/api/clients/${clientId}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:       form.title,
          description: form.description || null,
          status:      form.status,
          due_date:    form.due_date || null,
        }),
      })
      if (res.ok) {
        toast.success('Project created')
        setOpen(false)
        setForm({ title: '', description: '', status: 'briefing', due_date: '' })
        router.refresh()
      } else {
        const d = await res.json()
        toast.error(d.error ?? 'Failed to create project')
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-semibold bg-ds-secondary text-white hover:bg-ds-secondary-container transition-colors"
      >
        <Plus className="size-3.5" strokeWidth={2.5} />
        Add project
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0">
          <DialogTitle className="sr-only">Create project</DialogTitle>

          {/* ── Header ──────────────────────────────── */}
          <div
            className="px-6 pt-6 pb-5 border-b border-outline-variant/30"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.05) 0%, transparent 70%)' }}
          >
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-md bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
                <FolderOpen className="size-5 text-violet-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-on-surface">Create project</h2>
                <p className="text-sm text-on-surface-variant mt-0.5 leading-relaxed">
                  Projects help you organise work, share files, and track progress with your client.
                </p>
              </div>
            </div>
          </div>

          {/* ── Form body ───────────────────────────── */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 flex flex-col gap-5">

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface" htmlFor="proj-title">
                  Project title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="proj-title"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Website Redesign"
                  required
                  disabled={isPending}
                  className="h-10 rounded-md"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface" htmlFor="proj-desc">
                  Description <span className="text-[10px] font-normal text-on-surface-variant">(optional)</span>
                </label>
                <Textarea
                  id="proj-desc"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief overview of the project scope…"
                  rows={3}
                  disabled={isPending}
                  className="rounded-md resize-none text-sm"
                />
              </div>

              {/* Status + Due date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Status</label>
                  <Select
                    value={form.status}
                    onValueChange={v => setForm(f => ({ ...f, status: v }))}
                    disabled={isPending}
                  >
                    <SelectTrigger className="h-10 rounded-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(s => (
                        <SelectItem key={s.value} value={s.value}>
                          <span className="flex items-center gap-2">
                            <span className={cn('size-1.5 rounded-full shrink-0', s.dot)} />
                            <span className={cn('text-sm font-medium', s.cls)}>{s.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface" htmlFor="proj-due">
                    Due date <span className="text-[10px] font-normal text-on-surface-variant">(optional)</span>
                  </label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-on-surface-variant/60 pointer-events-none" />
                    <Input
                      id="proj-due"
                      type="date"
                      value={form.due_date}
                      onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                      disabled={isPending}
                      className="h-10 rounded-md pl-9"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* ── Footer ────────────────────────────── */}
            <div className="px-6 py-4 border-t border-outline-variant/30 flex items-center justify-end gap-2.5 bg-surface-container/20">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="inline-flex items-center h-9 px-4 rounded-md text-sm font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={isPending || !form.title}
                className="h-9 px-5 rounded-md"
              >
                {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
                Create project
              </Button>
            </div>
          </form>

        </DialogContent>
      </Dialog>
    </>
  )
}
