"use client"

import React, { useEffect, useState } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function MeetingScheduler({ projectId }: { projectId: string }) {
  const [meetings, setMeetings] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [datetime, setDatetime] = useState('')
  const [duration, setDuration] = useState(30)
  const [link, setLink] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => { fetchList() }, [projectId])

  async function fetchList() {
    try {
      const res = await fetch(`/api/projects/${projectId}/meetings`)
      if (res.ok) {
        const json = await res.json()
        setMeetings(json.data ?? [])
      }
    } catch (err) { console.error(err) }
  }

  async function createMeeting() {
    if (!title || !datetime || !link) return
    try {
      const res = await fetch(`/api/projects/${projectId}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, scheduled_at: new Date(datetime).toISOString(), duration_mins: duration, meet_link: link, description }),
      })
      if (res.ok) {
        setOpen(false)
        setTitle('')
        setDatetime('')
        setLink('')
        setDescription('')
        fetchList()
      }
    } catch (err) { console.error(err) }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold">Meetings</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Schedule meeting</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule meeting</DialogTitle>
            </DialogHeader>
            <div className="p-2">
              <label className="block text-sm">Title</label>
              <input className="w-full rounded border p-2" value={title} onChange={e => setTitle(e.target.value)} />
              <label className="block text-sm mt-2">Date & time</label>
              <input type="datetime-local" className="w-full rounded border p-2" value={datetime} onChange={e => setDatetime(e.target.value)} />
              <label className="block text-sm mt-2">Duration (minutes)</label>
              <input type="number" min={15} max={480} className="w-full rounded border p-2" value={duration} onChange={e => setDuration(Number(e.target.value))} />
              <label className="block text-sm mt-2">Video link</label>
              <div className="flex gap-2">
                <input className="flex-1 rounded border p-2" value={link} onChange={e => setLink(e.target.value)} />
                <a href="https://meet.google.com/new" target="_blank" rel="noreferrer" className="inline-flex items-center px-3 rounded bg-slate-100">Meet</a>
              </div>
              <label className="block text-sm mt-2">Description</label>
              <textarea className="w-full rounded border p-2" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={createMeeting}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ul className="space-y-2">
        {meetings.map(m => (
          <li key={m.id} className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{m.title}</div>
              <div className="text-xs">{new Date(m.scheduled_at).toLocaleString()}</div>
            </div>
            <div>
              <a href={m.meet_link} target="_blank" rel="noreferrer" className="text-sm text-blue-600">Join</a>
            </div>
          </li>
        ))}
        {meetings.length === 0 && <li className="text-sm text-on-surface-variant">No meetings scheduled.</li>}
      </ul>
    </div>
  )
}

export default MeetingScheduler
