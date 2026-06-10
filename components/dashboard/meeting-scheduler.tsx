"use client"

import React, { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { CalendarDays, Clock, ExternalLink, Loader2, Plus, Video, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Meeting {
  id: string
  title: string
  description: string | null
  scheduled_at: string
  duration_mins: number
  meet_link: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

const DURATIONS = [15, 30, 45, 60, 90]

const STATUS_CONFIG = {
  scheduled:  { label: 'Scheduled',  bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-100'    },
  completed:  { label: 'Completed',  bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  cancelled:  { label: 'Cancelled',  bg: 'bg-slate-50',   text: 'text-slate-500',   border: 'border-slate-100'   },
}

export function MeetingScheduler({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [fetching, setFetching] = useState(false)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', date: '', time: '', duration: 30, link: '', description: '' })
  const [isPending, startTransition] = useTransition()
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => { fetchList() }, [projectId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchList() {
    setFetching(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/meetings`)
      if (res.ok) {
        const json = await res.json()
        setMeetings(json.data ?? [])
      }
    } catch {
      toast.error('Unable to load meetings')
    } finally {
      setFetching(false)
    }
  }

  function handleClose() {
    if (!isPending) {
      setOpen(false)
      setForm({ title: '', date: '', time: '', duration: 30, link: '', description: '' })
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form.title.trim() || !form.date || !form.time || !form.link.trim()) return
    startTransition(async () => {
      const res = await fetch(`/api/projects/${projectId}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          scheduled_at: new Date(`${form.date}T${form.time}`).toISOString(),
          duration_mins: form.duration,
          meet_link: form.link.trim(),
          description: form.description || null,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        toast.error(d.error ?? 'Failed to schedule meeting')
        return
      }
      handleClose()
      await fetchList()
      router.refresh()
      toast.success('Meeting scheduled — invite sent to client')
    })
  }

  async function cancelMeeting(id: string) {
    setCancelling(id)
    try {
      const res = await fetch(`/api/meetings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      if (!res.ok) { toast.error('Failed to cancel meeting'); return }
      await fetchList()
      router.refresh()
      toast.success('Meeting cancelled')
    } catch {
      toast.error('Failed to cancel meeting')
    } finally {
      setCancelling(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-sm">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-outline-variant/20 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="size-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
            <Video className="size-4.5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface">Meetings</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Schedule calls with your client and share a video link.</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-md bg-ds-secondary text-white text-xs font-semibold hover:bg-ds-secondary/90 transition-colors shrink-0"
        >
          <Plus className="size-3.5" /> Schedule
        </button>
      </div>

      {/* List */}
      <div className="p-4 space-y-2.5">
        {fetching ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-on-surface-variant">
            <Loader2 className="size-4 animate-spin" /> Loading meetings…
          </div>
        ) : meetings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-outline-variant/40 bg-surface-container/30 p-6 text-center">
            <Video className="size-8 text-on-surface-variant/30 mx-auto mb-2" />
            <p className="text-sm font-medium text-on-surface-variant">No meetings scheduled</p>
            <p className="text-xs text-on-surface-variant/70 mt-1">Schedule a call and your client gets an invite with the video link automatically.</p>
            <button
              onClick={() => setOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 h-8 px-4 rounded-md bg-ds-secondary text-white text-xs font-semibold hover:bg-ds-secondary/90 transition-colors"
            >
              <Plus className="size-3.5" />Schedule first meeting
            </button>
          </div>
        ) : (
          meetings.map(m => {
            const cfg = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.scheduled
            const dt = new Date(m.scheduled_at)
            return (
              <div
                key={m.id}
                className={cn('rounded-xl border px-4 py-3.5', cfg.bg, cfg.border)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={cn('text-sm font-semibold', m.status === 'cancelled' ? 'line-through text-on-surface-variant' : 'text-on-surface')}>
                        {m.title}
                      </p>
                      <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full border', cfg.bg, cfg.text, cfg.border)}>
                        {cfg.label}
                      </span>
                    </div>
                    {m.description && <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{m.description}</p>}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-on-surface-variant">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-3" />
                        {dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {' · '}
                        {dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {m.duration_mins} min
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {m.status === 'scheduled' && (
                      <>
                        <a
                          href={m.meet_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md bg-ds-secondary/10 text-xs font-semibold text-ds-secondary hover:bg-ds-secondary/15 transition-colors"
                        >
                          <ExternalLink className="size-3" /> Join
                        </a>
                        <button
                          onClick={() => cancelMeeting(m.id)}
                          disabled={cancelling === m.id}
                          className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-semibold text-on-surface-variant hover:bg-red-50 hover:text-red-600 transition-colors border border-outline-variant/40"
                          title="Cancel meeting"
                        >
                          {cancelling === m.id ? <Loader2 className="size-3 animate-spin" /> : <XCircle className="size-3" />}
                          Cancel
                        </button>
                      </>
                    )}
                    {m.status === 'completed' && (
                      <a
                        href={m.meet_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors border border-outline-variant/40"
                      >
                        <ExternalLink className="size-3" /> Link
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Schedule meeting dialog */}
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0">
          <DialogTitle className="sr-only">Schedule meeting</DialogTitle>

          {/* Dialog header */}
          <div
            className="px-6 pt-6 pb-5 border-b border-outline-variant/30"
            style={{ background: 'linear-gradient(135deg, rgba(0,81,213,0.06) 0%, transparent 70%)' }}
          >
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-md bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                <Video className="size-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-on-surface">Schedule a meeting</h2>
                <p className="text-sm text-on-surface-variant mt-0.5 leading-relaxed">
                  Add a video link and pick a time — your client will receive an invite email automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 flex flex-col gap-5">

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface" htmlFor="mtg-title">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="mtg-title"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Project kick-off call"
                  required
                  disabled={isPending}
                  className="h-10 rounded-md"
                />
              </div>

              {/* Date & time — split fields for reliable cross-browser UX */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface" htmlFor="mtg-date">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-on-surface-variant/60 pointer-events-none" />
                    <Input
                      id="mtg-date"
                      type="date"
                      value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      required
                      disabled={isPending}
                      className="h-10 rounded-md pl-9"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface" htmlFor="mtg-time">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-on-surface-variant/60 pointer-events-none" />
                    <Input
                      id="mtg-time"
                      type="time"
                      value={form.time}
                      onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                      required
                      disabled={isPending}
                      className="h-10 rounded-md pl-9"
                    />
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface">Duration</label>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map(d => (
                    <button
                      key={d}
                      type="button"
                      disabled={isPending}
                      onClick={() => setForm(f => ({ ...f, duration: d }))}
                      className={cn(
                        'h-8 px-3.5 rounded-md border text-xs font-semibold transition-all',
                        form.duration === d
                          ? 'border-ds-secondary bg-ds-secondary/10 text-ds-secondary'
                          : 'border-outline-variant/60 text-on-surface-variant hover:border-outline-variant hover:bg-surface-container/50 hover:text-on-surface'
                      )}
                    >
                      {d < 60 ? `${d} min` : `${d / 60}h`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video link */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface" htmlFor="mtg-link">
                  Video link <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    id="mtg-link"
                    value={form.link}
                    onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                    placeholder="https://meet.google.com/..."
                    required
                    disabled={isPending}
                    className="h-10 rounded-md flex-1"
                  />
                  <a
                    href="https://meet.google.com/new"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-md border border-outline-variant text-xs font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors shrink-0"
                    title="Create a new Google Meet link"
                  >
                    <ExternalLink className="size-3.5" /> New link
                  </a>
                </div>
                <p className="text-[11px] text-on-surface-variant">Supports Google Meet, Zoom, Teams, or any video URL.</p>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface" htmlFor="mtg-desc">
                  Notes{' '}
                  <span className="text-[10px] font-normal text-on-surface-variant">(optional)</span>
                </label>
                <Textarea
                  id="mtg-desc"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Agenda, topics to cover, or any prep notes…"
                  rows={2}
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
                disabled={isPending || !form.title.trim() || !form.date || !form.time || !form.link.trim()}
                className="h-9 px-5 rounded-md"
              >
                {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
                Schedule meeting
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MeetingScheduler
