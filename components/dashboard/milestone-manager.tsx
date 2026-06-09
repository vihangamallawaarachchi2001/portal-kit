"use client"

import React, { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Milestone {
  id: string
  title: string
  description: string | null
  due_date: string
  completed_at: string | null
}

export function MilestoneManager({ projectId }: { projectId: string }) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => { fetchList() }, [projectId])

  async function fetchList() {
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/milestones`)
      if (res.ok) {
        const json = await res.json()
        setMilestones(json.data ?? [])
      }
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function createMilestone() {
    if (!title || !dueDate) return
    startTransition(async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/milestones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, due_date: dueDate, description }),
        })
        if (res.ok) {
          setOpen(false)
          setTitle('')
          setDueDate('')
          setDescription('')
          fetchList()
          router.refresh()
          toast.success('Milestone added')
        } else {
          console.error('Create failed', await res.text())
          toast.error('Failed to add milestone')
        }
      } catch (err) {
        console.error(err)
        toast.error('Failed to add milestone')
      }
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold">Milestones</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Add milestone</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add milestone</DialogTitle>
            </DialogHeader>
            <div className="p-2">
              <label className="block text-sm">Title</label>
              <input className="w-full rounded border p-2" value={title} onChange={e => setTitle(e.target.value)} />
              <label className="block text-sm mt-2">Due date</label>
              <input type="date" className="w-full rounded border p-2" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              <label className="block text-sm mt-2">Description</label>
              <textarea className="w-full rounded border p-2" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>Cancel</Button>
              <Button onClick={createMilestone} disabled={isPending}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <p>Loading…</p> : (
        <ul className="space-y-2">
          {milestones.map(m => (
            <li key={m.id} className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{m.title}</div>
                <div className="text-xs text-on-surface-variant">Due {new Date(m.due_date).toLocaleDateString()}</div>
              </div>
              <div>
                {m.completed_at ? <span className="text-green-600">✅</span> : <span className="text-amber-600">🕐</span>}
              </div>
            </li>
          ))}
          {milestones.length === 0 && <li className="text-sm text-on-surface-variant">No milestones yet.</li>}
        </ul>
      )}
    </div>
  )
}

export default MilestoneManager
