'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { CreateProjectModal } from './create-project-modal'

interface NewProjectButtonProps {
  clients: { id: string; name: string }[]
  label?: string
}

export function NewProjectButton({ clients, label = 'New Project' }: NewProjectButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 h-9 px-4 rounded-md bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors shadow-sm"
      >
        <Plus className="size-3.5" strokeWidth={2.5} />
        {label}
      </button>

      <CreateProjectModal
        open={open}
        onOpenChange={setOpen}
        preloadedClients={clients}
      />
    </>
  )
}
