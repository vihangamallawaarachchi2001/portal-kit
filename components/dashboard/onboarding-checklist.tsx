'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, X } from 'lucide-react'
import { toast } from 'sonner'
import { AddClientModal } from './add-client-modal'
import { CreateProjectModal } from './create-project-modal'

const STORAGE_KEY = 'portalkit_onboarding_dismissed'

const STEPS = [
  {
    label:       'Complete your profile',
    description: 'Add your name, business name and a photo.',
    kind:        'navigate' as const,
    href:        '/dashboard/settings',
    tip:         null as string | null,
  },
  {
    label:       'Add your first client',
    description: 'Create a portal link you can share with a client.',
    kind:        'add-client' as const,
    href:        null,
    tip:         null,
  },
  {
    label:       'Create a project',
    description: 'Organise your work into trackable projects.',
    kind:        'create-project' as const,
    href:        null,
    tip:         null,
  },
  {
    label:       'Share a file for review',
    description: 'Open a client → go into a project → Files tab → upload a deliverable.',
    kind:        'navigate' as const,
    href:        '/dashboard/clients',
    tip:         'On the next screen, click a client, then open a project and use the Files tab to upload your first deliverable for review.',
  },
  {
    label:       'Send your first invoice',
    description: 'Create an invoice inside a client portal and send it for online payment.',
    kind:        'navigate' as const,
    href:        '/dashboard/invoices',
    tip:         null,
  },
]

interface OnboardingChecklistProps {
  completed: boolean[]
}

export function OnboardingChecklist({ completed }: OnboardingChecklistProps) {
  const router = useRouter()
  const [addClientOpen, setAddClientOpen]         = useState(false)
  const [createProjectOpen, setCreateProjectOpen] = useState(false)
  const [dismissed, setDismissed]                 = useState(false)

  // Read localStorage after hydration to avoid SSR mismatch
  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === '1')
  }, [])

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setDismissed(true)
  }

  function handleStepClick(step: typeof STEPS[number]) {
    if (step.kind === 'navigate' && step.href) {
      if (step.tip) {
        toast.info(step.tip, { duration: 6000 })
      }
      router.push(step.href)
    } else if (step.kind === 'add-client') {
      setAddClientOpen(true)
    } else if (step.kind === 'create-project') {
      setCreateProjectOpen(true)
    }
  }

  if (dismissed) return null

  const total = STEPS.length
  const pct   = Math.round((completed.filter(Boolean).length / total) * 100)
  const doneCount = completed.filter(Boolean).length

  return (
    <>
      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 w-full bg-outline-variant/20">
          <div className="h-full bg-ds-secondary transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>

        {/* Header row with dismiss */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2.5">
            <p className="text-xs font-bold text-on-surface uppercase tracking-wider">Getting Started</p>
            <span className="text-[11px] font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
              {doneCount}/{total}
            </span>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            title="Dismiss checklist"
            className="flex items-center gap-1 text-[11px] text-on-surface-variant hover:text-on-surface transition-colors group"
          >
            <X className="size-3" />
            <span className="hidden group-hover:inline">Dismiss</span>
          </button>
        </div>

        <div className="divide-y divide-outline-variant/30 pb-1">
          {STEPS.map((step, i) => {
            const done = completed[i]

            if (done) {
              return (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5 opacity-40">
                  <div className="size-5 rounded-full flex items-center justify-center shrink-0 bg-ds-secondary">
                    <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-sm text-on-surface-variant line-through">{step.label}</p>
                </div>
              )
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleStepClick(step)}
                className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-surface-container/50 transition-colors group cursor-pointer"
              >
                <div className="size-5 rounded-full flex items-center justify-center shrink-0 border-2 border-outline-variant/50 text-[10px] font-bold text-on-surface-variant group-hover:border-ds-secondary group-hover:text-ds-secondary transition-colors">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface leading-tight">{step.label}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{step.description}</p>
                </div>
                <ArrowRight className="size-3.5 text-on-surface-variant/30 group-hover:text-ds-secondary group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            )
          })}
        </div>
      </div>

      <AddClientModal open={addClientOpen} onOpenChange={setAddClientOpen} />
      <CreateProjectModal open={createProjectOpen} onOpenChange={setCreateProjectOpen} />
    </>
  )
}
