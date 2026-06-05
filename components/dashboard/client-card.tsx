'use client'

import { Client, Project } from '@/types/database'
import { formatCurrency, formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Clock, MessageSquare, DollarSign, ChevronRight, Copy, Send, Archive } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'

const STATUS_CONFIG: Record<Project['status'], { label: string; color: string; dot: string }> = {
  briefing:    { label: 'Briefing',     color: 'text-slate-600',  dot: 'bg-slate-400' },
  in_progress: { label: 'In Progress',  color: 'text-blue-600',   dot: 'bg-blue-500' },
  review:      { label: 'In Review',    color: 'text-amber-600',  dot: 'bg-amber-500' },
  done:        { label: 'Done',         color: 'text-green-600',  dot: 'bg-green-500' },
}

interface ClientCardProps {
  client: Client & {
    projects: (Project & { pending_files: number; unread_messages: number })[]
    outstanding: number
    pending_files_total: number
    unread_messages_total: number
  }
  onSendMagicLink?: (clientId: string) => void
  onArchive?: (clientId: string) => void
}

export function ClientCard({ client, onSendMagicLink, onArchive }: ClientCardProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const portalUrl = `${appUrl}/p/${client.portal_slug}`

  const activeProjects = client.projects.filter(p => p.status !== 'done')
  const latestProject = activeProjects[0] ?? client.projects[0]
  const statusConfig = latestProject ? STATUS_CONFIG[latestProject.status] : null

  function copyLink() {
    navigator.clipboard.writeText(portalUrl)
    toast.success('Portal link copied to clipboard')
  }

  return (
    <div className="bg-white rounded-xl border border-outline-variant hover:border-ds-secondary/30 hover:shadow-md transition-all duration-200 group flex flex-col">
      {/* Card header */}
      <div className="flex items-start justify-between p-5 pb-4">
        <div className="flex flex-col gap-1 min-w-0">
          <Link href={`/dashboard/clients/${client.id}`} className="group/name">
            <h3 className="font-semibold text-on-surface text-sm leading-tight group-hover/name:text-ds-secondary transition-colors truncate max-w-[200px]">
              {client.name}
            </h3>
          </Link>
          <p className="text-xs text-on-surface-variant truncate max-w-[200px]">{client.email}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={copyLink}>
              <Copy className="size-3.5 mr-2" />Copy portal link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSendMagicLink?.(client.id)}>
              <Send className="size-3.5 mr-2" />Send magic link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onArchive?.(client.id)}
              className="text-on-surface-variant"
            >
              <Archive className="size-3.5 mr-2" />Archive client
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Project status */}
      {latestProject && statusConfig && (
        <div className="px-5 pb-3">
          <div className="flex items-center gap-1.5 bg-surface-container rounded-lg px-3 py-2">
            <span className={cn('size-1.5 rounded-full shrink-0', statusConfig.dot)} />
            <span className={cn('text-xs font-medium', statusConfig.color)}>{statusConfig.label}</span>
            <span className="text-xs text-on-surface-variant truncate">· {latestProject.title}</span>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="px-5 pb-4 grid grid-cols-3 gap-3 mt-auto">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <DollarSign className="size-3 text-on-surface-variant" />
            <span className="text-[10px] font-medium text-on-surface-variant">Outstanding</span>
          </div>
          <span className={cn('text-sm font-bold', client.outstanding > 0 ? 'text-ds-secondary' : 'text-on-surface-variant')}>
            {client.outstanding > 0 ? formatCurrency(client.outstanding) : '—'}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <Clock className="size-3 text-on-surface-variant" />
            <span className="text-[10px] font-medium text-on-surface-variant">Pending</span>
          </div>
          <span className={cn('text-sm font-bold', client.pending_files_total > 0 ? 'text-amber-600' : 'text-on-surface-variant')}>
            {client.pending_files_total > 0 ? `${client.pending_files_total} file${client.pending_files_total > 1 ? 's' : ''}` : '—'}
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <MessageSquare className="size-3 text-on-surface-variant" />
            <span className="text-[10px] font-medium text-on-surface-variant">Messages</span>
          </div>
          <span className={cn('text-sm font-bold', client.unread_messages_total > 0 ? 'text-ds-secondary' : 'text-on-surface-variant')}>
            {client.unread_messages_total > 0 ? `${client.unread_messages_total} new` : '—'}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-outline-variant px-5 py-3 flex items-center justify-between">
        <p className="text-[11px] text-on-surface-variant">
          {client.projects.length} project{client.projects.length !== 1 ? 's' : ''}
          {' · '}Updated {formatRelativeTime(client.updated_at)}
        </p>
        <Link
          href={`/dashboard/clients/${client.id}`}
          className="flex items-center gap-0.5 text-[11px] font-semibold text-ds-secondary hover:text-ds-secondary-container transition-colors"
        >
          View <ChevronRight className="size-3" />
        </Link>
      </div>
    </div>
  )
}
