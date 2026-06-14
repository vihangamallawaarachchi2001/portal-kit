'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Check, ChevronDown, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { WorkspaceSummary } from '@/lib/workspace'
import { getInitials } from '@/lib/format'

interface WorkspaceSwitcherProps {
  currentWorkspaceId: string
  workspaces: (WorkspaceSummary & { isPersonal: boolean })[]
  collapsed?: boolean
}

export function WorkspaceSwitcher({ currentWorkspaceId, workspaces, collapsed = false }: WorkspaceSwitcherProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [switching, startSwitch] = useTransition()

  const current = workspaces.find(w => w.inviteId === currentWorkspaceId) ?? workspaces[0]

  // Only render the switcher when the user has team workspaces to switch to
  if (workspaces.length <= 1) return null

  function switchWorkspace(inviteId: string) {
    if (inviteId === currentWorkspaceId) { setOpen(false); return }
    startSwitch(async () => {
      await fetch('/api/settings/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId }),
      })
      setOpen(false)
      router.refresh()
    })
  }

  if (collapsed) {
    return (
      <div className="relative px-2 mb-2">
        <button
          onClick={() => setOpen(v => !v)}
          title={current?.name ?? 'Switch workspace'}
          className="w-full flex items-center justify-center size-9 rounded-lg hover:bg-surface-container transition-colors"
        >
          <Avatar className="size-6">
            <AvatarImage src={current?.avatarUrl ?? undefined} />
            <AvatarFallback className="text-[10px] bg-ds-secondary/10 text-ds-secondary font-bold">
              {current?.isPersonal ? <User className="size-3" /> : getInitials(current?.name ?? 'W')}
            </AvatarFallback>
          </Avatar>
        </button>
        {open && (
          <WorkspaceDropdown
            workspaces={workspaces}
            currentId={currentWorkspaceId}
            onSelect={switchWorkspace}
            switching={switching}
            className="left-12 top-0"
          />
        )}
      </div>
    )
  }

  return (
    <div className="relative px-3 mb-2">
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-outline-variant/40 bg-surface-container/30 hover:bg-surface-container/60 transition-colors',
          open && 'bg-surface-container/60',
        )}
      >
        <Avatar className="size-6 shrink-0">
          <AvatarImage src={current?.avatarUrl ?? undefined} />
          <AvatarFallback className="text-[10px] bg-ds-secondary/10 text-ds-secondary font-bold">
            {current?.isPersonal ? <User className="size-3" /> : getInitials(current?.name ?? 'W')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-semibold text-on-surface truncate">{current?.name ?? 'Workspace'}</p>
          <p className="text-[10px] text-on-surface-variant">{current?.isPersonal ? 'Personal' : 'Team workspace'}</p>
        </div>
        <ChevronDown className={cn('size-3.5 text-on-surface-variant shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <WorkspaceDropdown
          workspaces={workspaces}
          currentId={currentWorkspaceId}
          onSelect={switchWorkspace}
          switching={switching}
          className="left-3 right-3 top-full mt-1"
        />
      )}

      {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />}
    </div>
  )
}

interface DropdownProps {
  workspaces: (WorkspaceSummary & { isPersonal: boolean })[]
  currentId: string
  onSelect: (id: string) => void
  switching: boolean
  className?: string
}

function WorkspaceDropdown({ workspaces, currentId, onSelect, switching, className }: DropdownProps) {
  return (
    <div className={cn(
      'absolute z-20 bg-white rounded-xl border border-outline-variant/30 shadow-lg overflow-hidden py-1',
      className,
    )}>
      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-3 pt-1.5 pb-1">
        Workspaces
      </p>
      {workspaces.map(w => (
        <button
          key={w.inviteId}
          onClick={() => onSelect(w.inviteId)}
          disabled={switching}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-surface-container/40 transition-colors disabled:opacity-50',
            w.inviteId === currentId && 'bg-ds-secondary/5',
          )}
        >
          <Avatar className="size-6 shrink-0">
            <AvatarImage src={w.avatarUrl ?? undefined} />
            <AvatarFallback className="text-[10px] bg-ds-secondary/10 text-ds-secondary font-bold">
              {w.isPersonal ? <User className="size-3" /> : getInitials(w.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-on-surface truncate">{w.name}</p>
            <p className="text-[10px] text-on-surface-variant">{w.isPersonal ? 'Personal' : 'Team workspace'}</p>
          </div>
          {w.inviteId === currentId && <Check className="size-3.5 text-ds-secondary shrink-0" />}
          {!w.isPersonal && w.inviteId !== currentId && <Building2 className="size-3 text-on-surface-variant/40 shrink-0" />}
        </button>
      ))}
    </div>
  )
}
