'use client'

import { useState } from 'react'
import { Plus, ArrowRight } from 'lucide-react'
import { AddClientModal } from './add-client-modal'
import Link from 'next/link'

export function DashboardHeroActions() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex flex-row sm:flex-col gap-2.5 shrink-0">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-md bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors shadow-sm shadow-ds-secondary/25"
        >
          <Plus className="size-3.5" strokeWidth={2.5} />
          New Client
        </button>
        <Link
          href="https://docs.portalkit.io"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-md text-sm font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
        >
          View Guide <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <AddClientModal open={open} onOpenChange={setOpen} />
    </>
  )
}
