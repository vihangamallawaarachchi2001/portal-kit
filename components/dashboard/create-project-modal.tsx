'use client'

import { useState, useEffect, useTransition } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2, FolderOpen, Users, CalendarDays, ArrowRight, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/format'
import Link from 'next/link'

/* ─── Status options with full visual config ─── */
const STATUS_OPTIONS = [
  {
    value: 'briefing',
    label: 'Briefing',
    dot:          'bg-slate-400',
    activeBorder: 'border-slate-300',
    activeBg:     'bg-slate-50',
    activeText:   'text-slate-700',
  },
  {
    value: 'in_progress',
    label: 'In Progress',
    dot:          'bg-blue-500',
    activeBorder: 'border-blue-300',
    activeBg:     'bg-blue-50',
    activeText:   'text-blue-700',
  },
  {
    value: 'review',
    label: 'In Review',
    dot:          'bg-amber-500',
    activeBorder: 'border-amber-300',
    activeBg:     'bg-amber-50',
    activeText:   'text-amber-700',
  },
  {
    value: 'done',
    label: 'Done',
    dot:          'bg-green-500',
    activeBorder: 'border-green-300',
    activeBg:     'bg-green-50',
    activeText:   'text-green-700',
  },
]

/* ─── Deterministic accent per client name ─── */
const ACCENTS = ['#0051d5','#7c3aed','#059669','#d97706','#dc2626','#0891b2','#9333ea','#16a34a']
function clientAccent(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
  return ACCENTS[Math.abs(h) % ACCENTS.length]
}

interface Client { id: string; name: string }

interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preloadedClients?: Client[]
  defaultClientId?: string
}

export function CreateProjectModal({
  open,
  onOpenChange,
  preloadedClients,
  defaultClientId,
}: CreateProjectModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [clients, setClients]         = useState<Client[]>(preloadedClients ?? [])
  const [loading, setLoading]         = useState(false)
  const [limitHit, setLimitHit]       = useState<{ limit: number; current: number } | null>(null)
  const [form, setForm] = useState({
    clientId:    defaultClientId ?? '',
    title:       '',
    description: '',
    status:      'briefing',
    due_date:    '',
  })

  useEffect(() => {
    if (!open) return
    if (preloadedClients && preloadedClients.length > 0) {
      setClients(preloadedClients)
      return
    }
    setLoading(true)
    fetch('/api/clients')
      .then(r => r.json())
      .then((data: Client[]) => { setClients(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleClose() {
    if (!isPending) {
      setLimitHit(null)
      onOpenChange(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.clientId || !form.title.trim()) return
    startTransition(async () => {
      const res = await fetch(`/api/clients/${form.clientId}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(), description: form.description || null,
          status: form.status, due_date: form.due_date || null,
        }),
      })
      if (res.ok) {
        toast.success('Project created')
        onOpenChange(false)
        setForm({ clientId: defaultClientId ?? '', title: '', description: '', status: 'briefing', due_date: '' })
        setLimitHit(null)
        router.refresh()
        router.push(`/dashboard/clients/${form.clientId}`)
      } else if (res.status === 402) {
        const d = await res.json()
        setLimitHit({ limit: d.limit ?? 2, current: d.current ?? 2 })
      } else {
        const d = await res.json()
        toast.error(d.error ?? 'Failed to create project')
      }
    })
  }

  const selectedClient   = clients.find(c => c.id === form.clientId)
  const selectedStatus   = STATUS_OPTIONS.find(s => s.value === form.status)!
  const noClients        = !loading && clients.length === 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0">
        <DialogTitle className="sr-only">Create project</DialogTitle>

        {/* ── Header ────────────────────────────────── */}
        <div
          className="px-6 pt-6 pb-5 border-b border-outline-variant/30"
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, transparent 70%)' }}
        >
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-md bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
              <FolderOpen className="size-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface">Create project</h2>
              <p className="text-sm text-on-surface-variant mt-0.5 leading-relaxed">
                Projects live inside a client portal — select a client to get started.
              </p>
            </div>
          </div>
        </div>

        {/* ── Plan limit gate ──────────────────────── */}
        {limitHit ? (
          <div className="px-6 py-10 flex flex-col items-center text-center gap-4">
            <div className="size-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Zap className="size-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">Project limit reached</p>
              <p className="text-xs text-on-surface-variant mt-1.5 max-w-xs leading-relaxed">
                You&apos;ve used {limitHit.current} of {limitHit.limit} projects on the Free plan.
                Upgrade to Pro for unlimited projects.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleClose}
                className="inline-flex items-center h-9 px-4 rounded-md text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <Link
                href="/dashboard/settings/billing"
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
              >
                <Zap className="size-3.5" />
                Upgrade to Pro
              </Link>
            </div>
          </div>
        ) : /* ── No clients state ──────────────────────── */
        noClients ? (
          <div className="px-6 py-10 flex flex-col items-center text-center gap-4">
            <div className="size-12 rounded-md bg-surface-container flex items-center justify-center">
              <Users className="size-6 text-on-surface-variant" />
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">No clients yet</p>
              <p className="text-xs text-on-surface-variant mt-1 max-w-xs">
                Add a client first — every project belongs to a client portal.
              </p>
            </div>
            <Link
              href="/dashboard/clients"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors"
            >
              Add a Client <ArrowRight className="size-3.5" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 flex flex-col gap-5">

              {/* ── Client selector ─────────────────── */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface">
                  Client <span className="text-red-500">*</span>
                </label>

                {loading ? (
                  <div className="h-12 rounded-md border border-input bg-surface-container/40 flex items-center px-4 gap-2.5">
                    <Loader2 className="size-4 animate-spin text-on-surface-variant" />
                    <span className="text-sm text-on-surface-variant">Loading clients…</span>
                  </div>
                ) : (
                  <Select
                    value={form.clientId}
                    onValueChange={v => setForm(f => ({ ...f, clientId: v }))}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      className="h-12 rounded-md border-outline-variant px-3 gap-2 data-open:border-ds-secondary data-open:ring-2 data-open:ring-ds-secondary/20"
                    >
                      {selectedClient ? (
                        /* ── Selected client: show avatar + name ── */
                        <span className="flex items-center gap-2.5 flex-1 min-w-0">
                          <span
                            className="size-7 rounded-md flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                            style={{ background: clientAccent(selectedClient.name) }}
                          >
                            {getInitials(selectedClient.name)}
                          </span>
                          <span className="text-sm font-semibold text-on-surface truncate">
                            {selectedClient.name}
                          </span>
                        </span>
                      ) : (
                        /* ── Placeholder ── */
                        <span className="flex items-center gap-2.5 flex-1">
                          <span className="size-7 rounded-md bg-surface-container flex items-center justify-center shrink-0">
                            <Users className="size-3.5 text-on-surface-variant" />
                          </span>
                          <span className="text-sm text-on-surface-variant">Choose a client…</span>
                        </span>
                      )}
                    </SelectTrigger>

                    <SelectContent className="p-1">
                      {clients.map(c => {
                        const accent = clientAccent(c.name)
                        return (
                          <SelectItem
                            key={c.id}
                            value={c.id}
                            className="rounded-md py-2 px-2 cursor-pointer"
                          >
                            <span className="flex items-center gap-2.5">
                              <span
                                className="size-7 rounded-md flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                                style={{ background: accent }}
                              >
                                {getInitials(c.name)}
                              </span>
                              <span className="text-sm font-medium text-on-surface">{c.name}</span>
                            </span>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* ── Project title ───────────────────── */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface" htmlFor="cp-title">
                  Project title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="cp-title"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Website Redesign"
                  required
                  disabled={isPending}
                  className="h-10 rounded-md"
                />
              </div>

              {/* ── Description ─────────────────────── */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface" htmlFor="cp-desc">
                  Description{' '}
                  <span className="text-[10px] font-normal text-on-surface-variant">(optional)</span>
                </label>
                <Textarea
                  id="cp-desc"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief overview of the project scope…"
                  rows={2}
                  disabled={isPending}
                  className="rounded-md resize-none text-sm"
                />
              </div>

              {/* ── Status — visual button grid ─────── */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map(s => {
                    const active = form.status === s.value
                    return (
                      <button
                        key={s.value}
                        type="button"
                        disabled={isPending}
                        onClick={() => setForm(f => ({ ...f, status: s.value }))}
                        className={cn(
                          'flex items-center gap-2.5 px-3.5 py-2.5 rounded-md border-2 text-sm font-medium transition-all text-left',
                          active
                            ? `${s.activeBorder} ${s.activeBg} ${s.activeText}`
                            : 'border-outline-variant/40 text-on-surface-variant hover:border-outline-variant hover:bg-surface-container/50 hover:text-on-surface'
                        )}
                      >
                        <span className={cn('size-2 rounded-full shrink-0', s.dot)} />
                        {s.label}
                        {active && (
                          <span className="ml-auto">
                            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                              <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── Due date ────────────────────────── */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface" htmlFor="cp-due">
                  Due date{' '}
                  <span className="text-[10px] font-normal text-on-surface-variant">(optional)</span>
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-on-surface-variant/60 pointer-events-none" />
                  <Input
                    id="cp-due"
                    type="date"
                    value={form.due_date}
                    onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                    disabled={isPending}
                    className="h-10 rounded-md pl-9"
                  />
                </div>
              </div>

            </div>

            {/* ── Footer ──────────────────────────── */}
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
                disabled={isPending || !form.clientId || !form.title.trim()}
                className="inline-flex items-center h-9 px-5 rounded-md"
              >
                {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
                Create project
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
