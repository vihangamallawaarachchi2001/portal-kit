'use client'

import { useState, useTransition } from 'react'
import { ClientCard } from './client-card'
import { AddClientModal } from './add-client-modal'
import { Plus, BookOpen, MessageCircle, ArrowRight, Sparkles } from 'lucide-react'
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
    startTransition(async () => {
      const res = await fetch(`/api/clients/${clientId}/magic-link`, { method: 'POST' })
      if (res.ok) toast.success('Magic link sent')
      else        toast.error('Failed to send magic link')
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
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
          className="min-h-40 rounded-2xl border-2 border-dashed border-outline-variant/60 hover:border-ds-secondary/40 hover:bg-ds-secondary/2 transition-all flex flex-col items-center justify-center gap-2.5 text-on-surface-variant hover:text-ds-secondary group"
        >
          <div className="size-8 rounded-xl bg-surface-container group-hover:bg-ds-secondary/10 flex items-center justify-center transition-colors">
            <Plus className="size-4" />
          </div>
          <span className="text-[13px] font-semibold">Add client</span>
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
    <div className="flex flex-col gap-4">
      {/* Primary empty-state card */}
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm">
        {/* Decorative gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 80% 0%, rgba(0,81,213,0.07) 0%, transparent 60%)' }}
        />

        <div className="relative px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center gap-8">
          {/* Icon treatment */}
          <div className="shrink-0">
            <div className="size-16 rounded-2xl bg-ds-secondary/10 flex items-center justify-center">
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
            className="flex items-center gap-2 h-10 px-5 rounded-xl bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors shadow-sm shadow-ds-secondary/20 shrink-0"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Add your first client
          </button>
        </div>
      </div>

      {/* Resource cards — 2-up */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href="https://docs.portalkit.io"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 flex items-start gap-4"
        >
          <div className="size-10 rounded-xl bg-ds-secondary/10 flex items-center justify-center shrink-0">
            <BookOpen className="size-5 text-ds-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-on-surface">Read the Guide</p>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Step-by-step setup to start delivering work through PortalKit.
            </p>
            <span className="flex items-center gap-1 mt-2 text-xs font-semibold text-ds-secondary group-hover:gap-1.5 transition-all">
              View guide <ArrowRight className="size-3" />
            </span>
          </div>
        </a>

        <a
          href="mailto:support@portalkit.io"
          className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 flex items-start gap-4"
        >
          <div className="size-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
            <MessageCircle className="size-5 text-on-surface-variant" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-on-surface">Need help?</p>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Our support team typically responds within a few hours.
            </p>
            <span className="flex items-center gap-1 mt-2 text-xs font-semibold text-ds-secondary group-hover:gap-1.5 transition-all">
              Contact support <ArrowRight className="size-3" />
            </span>
          </div>
        </a>
      </div>
    </div>
  )
}
