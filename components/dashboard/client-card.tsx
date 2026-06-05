'use client'

import { Client, Project } from '@/types/database'
import { formatCurrency, formatRelativeTime, getInitials } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Clock, MessageSquare, DollarSign, Copy, Send, Archive, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const STATUS_CONFIG: Record<Project['status'], { label: string; dot: string; text: string; bg: string }> = {
  briefing:    { label: 'Briefing',    dot: 'bg-slate-400',  text: 'text-slate-500',  bg: 'bg-slate-50'  },
  in_progress: { label: 'In Progress', dot: 'bg-blue-500',   text: 'text-blue-600',   bg: 'bg-blue-50'   },
  review:      { label: 'In Review',   dot: 'bg-amber-500',  text: 'text-amber-600',  bg: 'bg-amber-50'  },
  done:        { label: 'Done',        dot: 'bg-green-500',  text: 'text-green-600',  bg: 'bg-green-50'  },
}

// Deterministic accent hue per client name — used only on the avatar
const ACCENTS = ['#0051d5','#7c3aed','#059669','#d97706','#dc2626','#0891b2','#9333ea','#16a34a']
function clientAccent(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
  return ACCENTS[Math.abs(h) % ACCENTS.length]
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
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const portalUrl = `${appUrl}/p/${client.portal_slug}`
  const accent    = clientAccent(client.name)

  const latestActive = client.projects.find(p => p.status !== 'done') ?? client.projects[0]
  const statusCfg    = latestActive ? STATUS_CONFIG[latestActive.status] : null

  function copyLink() {
    navigator.clipboard.writeText(portalUrl)
    toast.success('Portal link copied')
  }

  return (
    <Link
      href={`/dashboard/clients/${client.id}`}
      className="group block bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden"
    >
      {/* ── Card body ─────────────────────────────────── */}
      <div className="p-5">
        {/* Header row: avatar + name + menu */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className="size-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
            style={{ background: accent }}
          >
            {getInitials(client.name)}
          </div>

          {/* Name + email */}
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-[15px] font-semibold text-on-surface leading-tight truncate group-hover:text-ds-secondary transition-colors">
              {client.name}
            </p>
            <p className="text-[13px] text-on-surface-variant truncate mt-0.5">{client.email}</p>
          </div>

          {/* Actions — stop propagation so the Link doesn't fire */}
          <div onClick={e => e.preventDefault()} className="shrink-0 -mt-0.5 -mr-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                >
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
                <DropdownMenuItem onClick={() => onArchive?.(client.id)} className="text-on-surface-variant">
                  <Archive className="size-3.5 mr-2" />Archive client
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Project status */}
        <div className="mt-3.5">
          {statusCfg ? (
            <span className={cn('inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-lg', statusCfg.bg, statusCfg.text)}>
              <span className={cn('size-1.5 rounded-full', statusCfg.dot)} />
              {statusCfg.label}
              <span className="opacity-60">· {latestActive?.title}</span>
            </span>
          ) : (
            <span className="inline-flex items-center text-[12px] font-medium px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant">
              No active projects
            </span>
          )}
        </div>

        {/* Inline stats */}
        <div className="mt-4 flex items-center gap-4">
          <InlineStat
            icon={DollarSign}
            value={client.outstanding > 0 ? formatCurrency(client.outstanding) : '—'}
            active={client.outstanding > 0}
            color="text-ds-secondary"
          />
          <InlineStat
            icon={Clock}
            value={client.pending_files_total > 0 ? `${client.pending_files_total} pending` : '—'}
            active={client.pending_files_total > 0}
            color="text-amber-600"
          />
          <InlineStat
            icon={MessageSquare}
            value={client.unread_messages_total > 0 ? `${client.unread_messages_total} new` : '—'}
            active={client.unread_messages_total > 0}
            color="text-ds-secondary"
          />
        </div>
      </div>

      {/* ── Footer strip ──────────────────────────────── */}
      <div className="px-5 py-2.5 bg-surface-container/40 flex items-center justify-between">
        <p className="text-[11px] text-on-surface-variant">
          {client.projects.length} project{client.projects.length !== 1 ? 's' : ''}
          <span className="mx-1.5 opacity-40">·</span>
          {formatRelativeTime(client.updated_at)}
        </p>
        <p className="text-[11px] font-semibold text-ds-secondary opacity-0 group-hover:opacity-100 transition-opacity">
          Open portal →
        </p>
      </div>
    </Link>
  )
}

function InlineStat({ icon: Icon, value, active, color }: {
  icon: React.ElementType; value: string; active: boolean; color: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className={cn('size-3 shrink-0', active ? color : 'text-on-surface-variant/40')} />
      <span className={cn('text-xs font-semibold', active ? color : 'text-on-surface-variant/50')}>
        {value}
      </span>
    </div>
  )
}
