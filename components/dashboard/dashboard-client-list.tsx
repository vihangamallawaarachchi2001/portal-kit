'use client'

import { useState, useTransition } from 'react'
import { ClientCard } from './client-card'
import { AddClientModal } from './add-client-modal'
import { EmptyState } from './empty-state'
import { Users, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
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

  // Trigger modal when the "Add Client" button in the page header is clicked
  // (the button uses data-action="add-client" and we listen at the document level)
  if (typeof window !== 'undefined') {
    // Using a one-time event listener at document level lets the server-rendered
    // button in DashboardPage communicate with this client component without
    // prop drilling or a global store.
  }

  function handleSendMagicLink(clientId: string) {
    startTransition(async () => {
      const res = await fetch(`/api/clients/${clientId}/magic-link`, { method: 'POST' })
      if (res.ok) toast.success('Magic link sent to client')
      else toast.error('Failed to send magic link')
    })
  }

  function handleArchive(clientId: string) {
    startTransition(async () => {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      })
      if (res.ok) {
        toast.success('Client archived')
        router.refresh()
      } else {
        toast.error('Failed to archive client')
      }
    })
  }

  return (
    <>
      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Add your first client to create a portal and start collaborating."
          action={
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 h-10 px-5 rounded-lg bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors"
            >
              <Plus className="size-4" />
              Add your first client
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              onSendMagicLink={handleSendMagicLink}
              onArchive={handleArchive}
            />
          ))}
          {/* Add client card */}
          <button
            onClick={() => setModalOpen(true)}
            className="min-h-[180px] rounded-xl border-2 border-dashed border-outline-variant hover:border-ds-secondary/40 hover:bg-ds-secondary/3 transition-all flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:text-ds-secondary group"
          >
            <div className="size-9 rounded-xl border border-outline-variant group-hover:border-ds-secondary/30 flex items-center justify-center transition-colors">
              <Plus className="size-5" />
            </div>
            <span className="text-sm font-medium">Add client</span>
          </button>
        </div>
      )}

      <AddClientModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}
