'use client'

import { useTransition, useState } from 'react'
import { Project } from '@/types/database'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Loader2 } from 'lucide-react'

const STATUS_OPTIONS: { value: Project['status']; label: string; dot: string }[] = [
  { value: 'briefing',    label: 'Briefing',    dot: 'bg-slate-400' },
  { value: 'in_progress', label: 'In Progress', dot: 'bg-blue-500' },
  { value: 'review',      label: 'In Review',   dot: 'bg-amber-500' },
  { value: 'done',        label: 'Done',        dot: 'bg-green-500' },
]

const STATUS_STYLES: Record<Project['status'], string> = {
  briefing:    'bg-slate-50  border-slate-200  text-slate-600',
  in_progress: 'bg-blue-50   border-blue-200   text-blue-600',
  review:      'bg-amber-50  border-amber-200  text-amber-600',
  done:        'bg-green-50  border-green-200  text-green-600',
}

interface ProjectStatusSelectorProps {
  projectId: string
  currentStatus: Project['status']
}

export function ProjectStatusSelector({ projectId, currentStatus }: ProjectStatusSelectorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<Project['status']>(currentStatus)

  function updateStatus(newStatus: Project['status']) {
    if (newStatus === status) return
    setStatus(newStatus)
    startTransition(async () => {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        toast.success('Project status updated')
        router.refresh()
      } else {
        setStatus(currentStatus)
        toast.error('Failed to update status')
      }
    })
  }

  const current = STATUS_OPTIONS.find(o => o.value === status)!

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={isPending}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors shrink-0',
            STATUS_STYLES[status]
          )}
        >
          {isPending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <span className={cn('size-1.5 rounded-full shrink-0', current.dot)} />
          )}
          {current.label}
          <ChevronDown className="size-3 ml-0.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {STATUS_OPTIONS.map(opt => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => updateStatus(opt.value)}
            className={cn('gap-2', opt.value === status && 'font-semibold')}
          >
            <span className={cn('size-2 rounded-full shrink-0', opt.dot)} />
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
