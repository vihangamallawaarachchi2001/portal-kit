'use client'

import { Client, Project } from '@/types/database'
import { formatCurrency, formatRelativeTime, getInitials } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  Clock, MessageSquare, DollarSign, Copy, Send, Archive,
  MoreHorizontal, FolderOpen, ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const STATUS_CFG: Record<Project['status'], { label: string; dot: string; text: string }> = {
  briefing:    { label: 'Briefing',    dot: 'bg-slate-400',   text: 'text-slate-500'   },
  in_progress: { label: 'In Progress', dot: 'bg-blue-500',    text: 'text-blue-600'    },
  review:      { label: 'In Review',   dot: 'bg-amber-500',   text: 'text-amber-600'   },
  done:        { label: 'Done',        dot: 'bg-emerald-500', text: 'text-emerald-600' },
}

const ACCENTS = ['#0051d5','#7c3aed','#059669','#d97706','#dc2626','#0891b2','#9333ea','#16a34a']
export function clientAccent(name: string) {
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

  const latestActive = client.projects.find(p => p.status !== 'done') ?? client.projects[0]
  const statusCfg    = latestActive ? STATUS_CFG[latestActive.status] : null

  function copyLink() {
    navigator.clipboard.writeText(portalUrl)
    toast.success('Portal link copied')
  }

  return (
    <Link
      href={`/dashboard/clients/${client.id}`}
      className="group flex flex-col bg-white rounded-xl border border-black/6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
    >
      {/* ── Colored header band ──────────────────────── */}
      <div className="relative px-4 pt-4 pb-5 overflow-hidden bg-ds-secondary">
        {/* Inner gradient highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 55%)' }}
        />
        {/* Decorative shape */}
        <div className="absolute -right-6 -top-6 size-24 rounded-full bg-white opacity-[0.08]" />
        <div className="absolute right-4 bottom-0 size-12 rounded-full bg-white opacity-[0.05]" />

        <div className="relative flex items-start gap-3">
          {/* Avatar */}
          <div className="size-11 rounded-xl bg-white/20 ring-2 ring-white/25 flex items-center justify-center text-white text-sm font-bold shrink-0 select-none">
            {getInitials(client.name)}
          </div>

          {/* Name + email */}
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-[15px] font-bold text-white leading-tight truncate">{client.name}</p>
            <p className="text-[12px] text-white/65 truncate mt-0.5">{client.email}</p>
          </div>

          {/* 3-dot menu — stop link propagation */}
          <div onClick={e => e.preventDefault()} className="shrink-0 -mt-0.5 relative z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-white/55 hover:text-white hover:bg-white/15 data-[state=open]:bg-white/15 data-[state=open]:text-white"
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
                <DropdownMenuItem
                  onClick={() => onArchive?.(client.id)}
                  className="text-on-surface-variant"
                >
                  <Archive className="size-3.5 mr-2" />Archive client
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ── Card body ────────────────────────────────── */}
      <div className="flex flex-col gap-3.5 px-4 py-4 flex-1">
        {/* Active project status */}
        {statusCfg && latestActive ? (
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={cn('size-1.5 rounded-full shrink-0', statusCfg.dot)} />
              <span className={cn('text-[10px] font-bold uppercase tracking-wider', statusCfg.text)}>
                {statusCfg.label}
              </span>
            </div>
            <p className="text-[13px] font-semibold text-on-surface line-clamp-1">{latestActive.title}</p>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <FolderOpen className="size-3.5 text-on-surface-variant/30 shrink-0" />
            <span className="text-[12px] text-on-surface-variant/45">No active projects</span>
          </div>
        )}

        {/* Stat chips */}
        <div className="flex items-stretch gap-1.5">
          <StatChip
            icon={DollarSign}
            value={client.outstanding > 0 ? formatCurrency(client.outstanding) : '—'}
            active={client.outstanding > 0}
            activeBg="bg-ds-secondary/8"
            activeColor="text-ds-secondary"
          />
          <StatChip
            icon={Clock}
            value={client.pending_files_total > 0 ? `${client.pending_files_total} pending` : '—'}
            active={client.pending_files_total > 0}
            activeBg="bg-amber-50"
            activeColor="text-amber-600"
          />
          <StatChip
            icon={MessageSquare}
            value={client.unread_messages_total > 0 ? `${client.unread_messages_total} new` : '—'}
            active={client.unread_messages_total > 0}
            activeBg="bg-blue-50"
            activeColor="text-blue-600"
          />
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────── */}
      <div className="px-4 py-2.5 flex items-center justify-between border-t border-outline-variant/15 bg-surface-container/20">
        <p className="text-[11px] text-on-surface-variant/55">
          {client.projects.length} project{client.projects.length !== 1 ? 's' : ''}
          <span className="mx-1.5 opacity-40">·</span>
          {formatRelativeTime(client.updated_at)}
        </p>
        <div className="flex items-center gap-1 text-ds-secondary opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[11px] font-semibold">Open portal</span>
          <ArrowRight className="size-3" />
        </div>
      </div>
    </Link>
  )
}

function StatChip({
  icon: Icon, value, active, activeBg, activeColor,
}: {
  icon: React.ElementType
  value: string
  active: boolean
  activeBg: string
  activeColor: string
}) {
  return (
    <div className={cn(
      'flex items-center gap-1 px-2 py-1.5 rounded-lg flex-1 justify-center min-w-0',
      active ? activeBg : 'bg-surface-container/40',
    )}>
      <Icon className={cn('size-3 shrink-0', active ? activeColor : 'text-on-surface-variant/25')} />
      <span className={cn('text-[11px] font-bold truncate', active ? activeColor : 'text-on-surface-variant/35')}>
        {value}
      </span>
    </div>
  )
}
