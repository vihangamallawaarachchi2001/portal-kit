'use client'

import { useState, useTransition } from 'react'
import { ClientCard } from './client-card'
import { AddClientModal } from './add-client-modal'
import { Plus, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Client, Project } from '@/types/database'

type EnrichedClient = Client & {
  projects: (Project & { pending_files: number; unread_messages: number })[]
  outstanding: number
  pending_files_total: number
  unread_messages_total: number
}

interface DashboardClientListProps {
  clients: EnrichedClient[]
}

export function DashboardClientList({ clients }: DashboardClientListProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [, startTransition] = useTransition()

  function handleSendMagicLink(clientId: string) {
    const email = clients.find(c => c.id === clientId)?.email
    startTransition(async () => {
      const res = await fetch(`/api/clients/${clientId}/magic-link`, { method: 'POST' })
      if (res.ok) toast.success(email
        ? `Access link sent to ${email}. You'll be notified when they open their portal.`
        : 'Access link sent to client.')
      else toast.error('Failed to send access link')
    })
  }

  function handleArchive(clientId: string) {
    startTransition(async () => {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      })
      if (res.ok) { toast.success('Client archived'); router.refresh() }
      else          toast.error('Failed to archive client')
    })
  }

  if (clients.length === 0) {
    return (
      <>
        <EmptyPortals onAddClient={() => setModalOpen(true)} />
        <AddClientModal open={modalOpen} onOpenChange={setModalOpen} />
      </>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {clients.map(client => (
          <ClientCard
            key={client.id}
            client={client}
            onSendMagicLink={handleSendMagicLink}
            onArchive={handleArchive}
          />
        ))}
        {/* Add new client card */}
        <button
          onClick={() => setModalOpen(true)}
          className="min-h-55 rounded-xl border-2 border-dashed border-outline-variant/50 hover:border-ds-secondary/50 hover:bg-white transition-all flex flex-col items-center justify-center gap-3 text-on-surface-variant hover:text-ds-secondary group"
        >
          <div className="size-10 rounded-xl bg-surface-container group-hover:bg-ds-secondary/10 flex items-center justify-center transition-colors shadow-sm">
            <Plus className="size-5" />
          </div>
          <div className="text-center">
            <p className="text-[13px] font-semibold">Add client</p>
            <p className="text-[11px] text-on-surface-variant/50 mt-0.5">Create a new portal</p>
          </div>
        </button>
      </div>
      <AddClientModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}

/* ─────────────────────────────────────────────────────────────
   Empty state — shown when zero clients exist
   ───────────────────────────────────────────────────────────── */
function EmptyPortals({ onAddClient }: { onAddClient: () => void }) {
  return (
    <div>
      {/* Primary empty-state card */}
      <div className="relative overflow-hidden rounded-md bg-white shadow-sm">
        {/* Decorative gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 80% 0%, rgba(0,81,213,0.07) 0%, transparent 60%)' }}
        />

        <div className="relative px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center gap-8">
          {/* Icon treatment */}
          <div className="shrink-0">
            <div className="size-16 rounded-md bg-ds-secondary/10 flex items-center justify-center">
              <Sparkles className="size-8 text-ds-secondary" />
            </div>
          </div>

          {/* Copy */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-on-surface tracking-tight">
              Your workspace is ready
            </h3>
            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed max-w-md">
              Add your first client to create a branded portal they can access
              with a magic link — no account required on their end.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={onAddClient}
            className="flex items-center gap-2 h-10 px-5 rounded-md bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors shadow-sm shadow-ds-secondary/20 shrink-0"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Add your first client
          </button>
        </div>
      </div>

    </div>
  )
}
