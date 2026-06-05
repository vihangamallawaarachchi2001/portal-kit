'use client'

import { useState, useTransition } from 'react'
import { ClientCard } from './client-card'
import { AddClientModal } from './add-client-modal'
import {
  Users, Plus, BookOpen, MessageCircle,
  CheckCircle2, Circle, ArrowRight,
} from 'lucide-react'
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

const GETTING_STARTED = [
  {
    label: 'Complete your profile',
    description: 'Add your name, business name and avatar.',
    href: '/dashboard/settings',
    cta: 'Go to settings',
  },
  {
    label: 'Add your first client',
    description: 'Create a portal your client can access with a magic link.',
    href: null,
    cta: 'Add client',
  },
  {
    label: 'Create a project',
    description: 'Organise work into projects inside each client portal.',
    href: '/dashboard/clients',
    cta: 'View clients',
  },
  {
    label: 'Upload a file for review',
    description: 'Share deliverables and collect approvals from your client.',
    href: '/dashboard/clients',
    cta: 'View clients',
  },
  {
    label: 'Send your first invoice',
    description: 'Create and send an invoice with online payment via Stripe.',
    href: '/dashboard/invoices',
    cta: 'Go to invoices',
  },
]

export function DashboardClientList({ clients }: DashboardClientListProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [, startTransition] = useTransition()

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
        <GettingStartedEmpty onAddClient={() => setModalOpen(true)} />
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
          <button
            onClick={() => setModalOpen(true)}
            className="min-h-44 rounded-xl border-2 border-dashed border-outline-variant hover:border-ds-secondary/40 hover:bg-ds-secondary/3 transition-all flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:text-ds-secondary group"
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

function GettingStartedEmpty({ onAddClient }: { onAddClient: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-linear-to-br from-ds-secondary/8 via-ds-secondary/5 to-transparent border border-ds-secondary/15 p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="size-16 rounded-2xl bg-ds-secondary/10 flex items-center justify-center shrink-0">
          <Users className="size-8 text-ds-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-on-surface">Welcome to PortalKit</h3>
          <p className="text-sm text-on-surface-variant mt-1 leading-relaxed max-w-lg">
            Your workspace is ready. Add your first client to create a portal and start
            collaborating professionally.
          </p>
        </div>
        <button
          onClick={onAddClient}
          className="flex items-center gap-2 h-10 px-5 rounded-xl bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors shadow-sm shrink-0"
        >
          <Plus className="size-4" />
          Add your first client
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Getting started checklist — spans 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-outline-variant">
            <CheckCircle2 className="size-4 text-ds-secondary" />
            <h3 className="text-sm font-semibold text-on-surface">Getting Started</h3>
            <span className="ml-auto text-xs text-on-surface-variant">0 / {GETTING_STARTED.length} complete</span>
          </div>
          <div className="divide-y divide-outline-variant/60">
            {GETTING_STARTED.map((step, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-container/50 transition-colors group">
                <Circle className="size-4 text-outline-variant shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface">{step.label}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{step.description}</p>
                </div>
                {step.href ? (
                  <Link
                    href={step.href}
                    className="flex items-center gap-1 text-xs text-ds-secondary font-semibold opacity-0 group-hover:opacity-100 transition-opacity shrink-0 whitespace-nowrap"
                  >
                    {step.cta}
                    <ArrowRight className="size-3" />
                  </Link>
                ) : (
                  <button
                    onClick={onAddClient}
                    className="flex items-center gap-1 text-xs text-ds-secondary font-semibold opacity-0 group-hover:opacity-100 transition-opacity shrink-0 whitespace-nowrap"
                  >
                    {step.cta}
                    <ArrowRight className="size-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resource cards */}
        <div className="flex flex-col gap-4">
          <a
            href="https://docs.portalkit.io"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-2xl border border-outline-variant p-5 flex flex-col gap-3 hover:border-ds-secondary/30 hover:shadow-sm transition-all group cursor-pointer"
          >
            <div className="size-10 rounded-xl bg-ds-secondary/10 flex items-center justify-center">
              <BookOpen className="size-5 text-ds-secondary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">Read the Guide</p>
              <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                Learn how to get the most out of PortalKit with step-by-step tutorials.
              </p>
            </div>
            <span className="flex items-center gap-1 text-xs text-ds-secondary font-semibold group-hover:gap-2 transition-all">
              View Guide <ArrowRight className="size-3" />
            </span>
          </a>

          <a
            href="mailto:support@portalkit.io"
            className="bg-white rounded-2xl border border-outline-variant p-5 flex flex-col gap-3 hover:border-outline hover:shadow-sm transition-all group cursor-pointer"
          >
            <div className="size-10 rounded-xl bg-surface-container flex items-center justify-center">
              <MessageCircle className="size-5 text-on-surface-variant" />
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">Need Help?</p>
              <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                Our support team is here to answer questions and help you succeed.
              </p>
            </div>
            <span className="flex items-center gap-1 text-xs text-ds-secondary font-semibold group-hover:gap-2 transition-all">
              Contact Support <ArrowRight className="size-3" />
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}
