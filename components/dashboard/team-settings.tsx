'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { TeamInvite } from '@/types/database'
import { WorkspacePermissions } from '@/lib/workspace'
import { cn } from '@/lib/utils'
import {
  Users, UserPlus, Trash2, Loader2, Mail, Zap, Shield, Clock,
  ChevronDown, ChevronUp, ChevronRight, FolderOpen, Check,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Link from 'next/link'

const TEAM_LIMIT = 5

// ─── Permission toggle config ─────────────────────────────────────────────────

const FEATURE_PERMISSIONS: { key: keyof WorkspacePermissions; label: string; description: string }[] = [
  { key: 'clients',  label: 'Clients',  description: 'View and manage client profiles' },
  { key: 'projects', label: 'Projects', description: 'View and manage projects' },
  { key: 'invoices', label: 'Invoices', description: 'View and send invoices' },
  { key: 'files',    label: 'Files',    description: 'Upload and review files' },
  { key: 'settings', label: 'Settings', description: 'Access workspace settings' },
]

const SUB_PERMS = [
  { key: 'canViewFiles',      label: 'Files'      },
  { key: 'canViewInvoices',   label: 'Invoices'   },
  { key: 'canViewMessages',   label: 'Messages'   },
  { key: 'canViewMilestones', label: 'Milestones' },
] as const

const DEFAULT_PERMISSIONS: WorkspacePermissions = {
  clients: true, projects: true, invoices: true,
  files: true, messages: false, settings: false, billing: false,
  all_clients: true,
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClientSummary { id: string; name: string }
interface ProjectSummary { id: string; title: string; client_id: string }

interface DataGrant {
  clientId: string
  projectId: string | null
  canViewFiles: boolean
  canViewInvoices: boolean
  canViewMessages: boolean
  canViewMilestones: boolean
}

// ─── Sub-permission row ───────────────────────────────────────────────────────

function SubPermToggle({
  label, checked, onChange, disabled,
}: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled: boolean }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative shrink-0 w-7 h-4 rounded-full transition-colors duration-150 focus:outline-none disabled:opacity-40',
          checked ? 'bg-ds-secondary' : 'bg-outline-variant',
        )}
      >
        <span className={cn(
          'absolute top-0.5 left-0.5 size-3 rounded-full bg-white shadow-sm transition-transform duration-150',
          checked ? 'translate-x-3' : 'translate-x-0',
        )} />
      </button>
      <span className="text-xs text-on-surface-variant">{label}</span>
    </label>
  )
}

// ─── Project grant row ────────────────────────────────────────────────────────

interface ProjectGrantRowProps {
  project: ProjectSummary
  grant: DataGrant | undefined
  clientGrant: DataGrant | undefined  // client-level grant as fallback defaults
  onToggle: (projectId: string, checked: boolean) => void
  onSubPerm: (projectId: string, key: string, value: boolean) => void
  disabled: boolean
}

function ProjectGrantRow({ project, grant, clientGrant, onToggle, onSubPerm, disabled }: ProjectGrantRowProps) {
  const isChecked = !!grant

  return (
    <div className={cn(
      'border rounded-lg overflow-hidden transition-colors',
      isChecked ? 'border-ds-secondary/20 bg-ds-secondary/3' : 'border-outline-variant/20 bg-transparent',
    )}>
      <div className="flex items-center gap-2.5 px-3 py-2">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={e => onToggle(project.id, e.target.checked)}
          disabled={disabled}
          className="size-3.5 rounded accent-ds-secondary cursor-pointer"
        />
        <FolderOpen className="size-3.5 text-on-surface-variant shrink-0" />
        <span className="text-xs font-medium text-on-surface flex-1 truncate">{project.title}</span>
      </div>
      {isChecked && (
        <div className="px-3 pb-2.5 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-ds-secondary/10 pt-2 ml-8">
          {SUB_PERMS.map(sp => (
            <SubPermToggle
              key={sp.key}
              label={sp.label}
              checked={grant?.[sp.key] ?? (clientGrant?.[sp.key] ?? true)}
              onChange={v => onSubPerm(project.id, sp.key, v)}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Client grant row ─────────────────────────────────────────────────────────

interface ClientGrantRowProps {
  client: ClientSummary
  projects: ProjectSummary[]
  grants: DataGrant[]        // all grants for this invite
  onGrantsChange: (next: DataGrant[]) => void
  loadProjects: (clientId: string) => Promise<void>
  disabled: boolean
}

function ClientGrantRow({ client, projects, grants, onGrantsChange, loadProjects, disabled }: ClientGrantRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [projectsExpanded, setProjectsExpanded] = useState(false)

  const clientGrant = grants.find(g => g.clientId === client.id && g.projectId === null)
  const isChecked = !!clientGrant
  const clientProjects = projects.filter(p => p.client_id === client.id)
  const projectGrants = grants.filter(g => g.clientId === client.id && g.projectId !== null)
  const allProjectsMode = !projectGrants.length || (isChecked && !projectsExpanded)

  function toggleClient(checked: boolean) {
    if (checked) {
      // Add client-level grant with defaults
      onGrantsChange([...grants, {
        clientId: client.id, projectId: null,
        canViewFiles: true, canViewInvoices: true, canViewMessages: true, canViewMilestones: true,
      }])
    } else {
      // Remove client-level grant AND all project grants for this client
      onGrantsChange(grants.filter(g => g.clientId !== client.id))
    }
  }

  function updateClientSubPerm(key: string, value: boolean) {
    onGrantsChange(grants.map(g =>
      g.clientId === client.id && g.projectId === null ? { ...g, [key]: value } : g
    ))
  }

  function toggleProject(projectId: string, checked: boolean) {
    if (checked) {
      const defaults = clientGrant ?? { canViewFiles: true, canViewInvoices: true, canViewMessages: true, canViewMilestones: true }
      onGrantsChange([...grants, {
        clientId: client.id, projectId,
        canViewFiles: defaults.canViewFiles, canViewInvoices: defaults.canViewInvoices,
        canViewMessages: defaults.canViewMessages, canViewMilestones: defaults.canViewMilestones,
      }])
    } else {
      onGrantsChange(grants.filter(g => !(g.clientId === client.id && g.projectId === projectId)))
    }
  }

  function updateProjectSubPerm(projectId: string, key: string, value: boolean) {
    onGrantsChange(grants.map(g =>
      g.clientId === client.id && g.projectId === projectId ? { ...g, [key]: value } : g
    ))
  }

  async function handleExpandProjects() {
    if (!projectsExpanded) await loadProjects(client.id)
    setProjectsExpanded(v => !v)
  }

  return (
    <div className={cn(
      'border rounded-xl overflow-hidden transition-all',
      isChecked ? 'border-ds-secondary/30' : 'border-outline-variant/30',
    )}>
      {/* Client header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={e => toggleClient(e.target.checked)}
          disabled={disabled}
          className="size-4 rounded accent-ds-secondary cursor-pointer"
        />
        <div className="size-7 rounded-full bg-ds-secondary/10 flex items-center justify-center shrink-0">
          <Users className="size-3.5 text-ds-secondary" />
        </div>
        <span className="text-sm font-semibold text-on-surface flex-1 truncate">{client.name}</span>
        {isChecked && (
          <button
            onClick={() => { setExpanded(v => !v) }}
            className="flex items-center gap-1 text-[11px] text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
          >
            Sub-permissions
            {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </button>
        )}
      </div>

      {/* Client-level sub-permissions */}
      {isChecked && expanded && (
        <div className="px-4 pb-3 border-t border-outline-variant/20 pt-2.5 bg-surface-container/20">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
            Default for all projects
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 mb-3">
            {SUB_PERMS.map(sp => (
              <SubPermToggle
                key={sp.key}
                label={sp.label}
                checked={clientGrant?.[sp.key] ?? true}
                onChange={v => updateClientSubPerm(sp.key, v)}
                disabled={disabled}
              />
            ))}
          </div>

          {/* Per-project access */}
          <button
            onClick={handleExpandProjects}
            className="flex items-center gap-1.5 text-[11px] font-medium text-ds-secondary hover:underline"
          >
            <ChevronRight className={cn('size-3 transition-transform', projectsExpanded && 'rotate-90')} />
            Restrict to specific projects
          </button>

          {projectsExpanded && (
            <div className="mt-2.5 flex flex-col gap-1.5">
              {clientProjects.length === 0 ? (
                <p className="text-xs text-on-surface-variant py-1">No projects found for this client.</p>
              ) : (
                clientProjects.map(p => (
                  <ProjectGrantRow
                    key={p.id}
                    project={p}
                    grant={grants.find(g => g.clientId === client.id && g.projectId === p.id)}
                    clientGrant={clientGrant}
                    onToggle={toggleProject}
                    onSubPerm={updateProjectSubPerm}
                    disabled={disabled}
                  />
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Member row ───────────────────────────────────────────────────────────────

interface MemberRowProps {
  member: TeamInvite
  onRemove: (id: string) => void
  onPermissionsChange: (id: string, perms: WorkspacePermissions) => void
  isPending: boolean
}

function MemberRow({ member, onRemove, onPermissionsChange, isPending }: MemberRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [grantsSection, setGrantsSection] = useState(false)
  const [saving, startSave] = useTransition()
  const [savingGrants, startSaveGrants] = useTransition()

  // Feature-level permissions
  const perms: WorkspacePermissions = { ...DEFAULT_PERMISSIONS, ...(member.permissions ?? {}) }

  // Client/project grants state
  const [allClients, setAllClients] = useState<boolean>(perms.all_clients ?? true)
  const [clients, setClients] = useState<ClientSummary[]>([])
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [grants, setGrants] = useState<DataGrant[]>([])
  const [grantsLoaded, setGrantsLoaded] = useState(false)

  const loadGrants = useCallback(async () => {
    if (grantsLoaded) return
    const [clientsRes, grantsRes] = await Promise.all([
      fetch('/api/clients'),
      fetch(`/api/settings/team/${member.id}/grants`),
    ])
    if (clientsRes.ok) {
      const data = await clientsRes.json()
      setClients((data ?? []).map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })))
    }
    if (grantsRes.ok) {
      const data: { client_id: string; project_id: string | null; can_view_files: boolean; can_view_invoices: boolean; can_view_messages: boolean; can_view_milestones: boolean }[] = await grantsRes.json()
      setGrants((data ?? []).map(g => ({
        clientId: g.client_id,
        projectId: g.project_id,
        canViewFiles: g.can_view_files,
        canViewInvoices: g.can_view_invoices,
        canViewMessages: g.can_view_messages,
        canViewMilestones: g.can_view_milestones,
      })))
    }
    setGrantsLoaded(true)
  }, [member.id, grantsLoaded])

  async function loadProjects(clientId: string) {
    if (projects.some(p => p.client_id === clientId)) return
    const res = await fetch(`/api/clients/${clientId}/projects`)
    if (res.ok) {
      const data = await res.json()
      setProjects(prev => [
        ...prev.filter(p => p.client_id !== clientId),
        ...(data ?? []).map((p: { id: string; title: string }) => ({ id: p.id, title: p.title, client_id: clientId })),
      ])
    }
  }

  function handleOpenGrants() {
    if (!grantsSection) loadGrants()
    setGrantsSection(v => !v)
  }

  function togglePerm(key: keyof WorkspacePermissions) {
    const next = { ...perms, [key]: !perms[key] }
    startSave(async () => {
      const res = await fetch(`/api/settings/team/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: next }),
      })
      if (res.ok) onPermissionsChange(member.id, next)
      else toast.error('Failed to update permissions')
    })
  }

  function toggleAllClients(val: boolean) {
    setAllClients(val)
    const next = { ...perms, all_clients: val }
    startSave(async () => {
      const res = await fetch(`/api/settings/team/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: next }),
      })
      if (res.ok) onPermissionsChange(member.id, next)
      else toast.error('Failed to update permissions')
    })
  }

  function saveGrants(nextGrants: DataGrant[]) {
    setGrants(nextGrants)
    startSaveGrants(async () => {
      const res = await fetch(`/api/settings/team/${member.id}/grants`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grants: nextGrants.map(g => ({
            clientId: g.clientId,
            projectId: g.projectId,
            canViewFiles: g.canViewFiles,
            canViewInvoices: g.canViewInvoices,
            canViewMessages: g.canViewMessages,
            canViewMilestones: g.canViewMilestones,
          })),
        }),
      })
      if (!res.ok) toast.error('Failed to save access grants')
    })
  }

  return (
    <div className="border-b border-outline-variant/20 last:border-b-0">
      {/* Member header */}
      <div className="flex items-center justify-between px-5 py-3.5 group hover:bg-surface-container/20 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            'size-8 rounded-full flex items-center justify-center shrink-0',
            member.status === 'accepted' ? 'bg-ds-secondary/10' : 'bg-surface-container',
          )}>
            {member.role === 'admin'
              ? <Shield className={cn('size-4', member.status === 'accepted' ? 'text-ds-secondary' : 'text-on-surface-variant')} />
              : <Users  className={cn('size-4', member.status === 'accepted' ? 'text-ds-secondary' : 'text-on-surface-variant')} />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-on-surface truncate">{member.email}</p>
            <p className="text-xs text-on-surface-variant capitalize">{member.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={cn(
            'inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border',
            member.status === 'accepted'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200',
          )}>
            {member.status === 'pending' && <Clock className="size-2.5" />}
            {member.status === 'accepted' ? 'Active' : 'Pending'}
          </span>

          {member.status === 'accepted' && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="h-7 px-2 rounded-md flex items-center gap-1 text-xs font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Permissions
              {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </button>
          )}

          <button
            onClick={() => onRemove(member.id)}
            disabled={isPending}
            className="md:opacity-0 md:group-hover:opacity-100 size-7 rounded-md flex items-center justify-center text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40"
            title="Remove member"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Permissions panel */}
      {expanded && (
        <div className="border-t border-outline-variant/10 bg-surface-container/10">
          {/* Feature-level toggles */}
          <div className="px-5 pt-3 pb-2">
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
              Feature access
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
              {FEATURE_PERMISSIONS.map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between gap-3 py-1.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-on-surface">{label}</p>
                    <p className="text-[11px] text-on-surface-variant">{description}</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={perms[key] as boolean}
                    disabled={saving}
                    onClick={() => togglePerm(key)}
                    className={cn(
                      'relative shrink-0 w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ds-secondary/30 disabled:opacity-50',
                      perms[key] ? 'bg-ds-secondary' : 'bg-outline-variant',
                    )}
                  >
                    <span className={cn(
                      'absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                      perms[key] ? 'translate-x-4' : 'translate-x-0',
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Client/project data access */}
          <div className="px-5 pb-4 pt-1 border-t border-outline-variant/10">
            <div className="flex items-center justify-between mb-2 mt-2">
              <div>
                <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide">
                  Data access
                </p>
              </div>
              <button
                onClick={handleOpenGrants}
                className="flex items-center gap-1 text-[11px] font-medium text-ds-secondary hover:underline"
              >
                {grantsSection ? 'Hide' : 'Configure'}
                <ChevronDown className={cn('size-3 transition-transform', grantsSection && 'rotate-180')} />
              </button>
            </div>

            {/* All clients toggle */}
            <div className="flex items-center justify-between py-2 rounded-lg bg-surface-container/30 px-3 mb-2">
              <div>
                <p className="text-sm font-medium text-on-surface">Access to all clients</p>
                <p className="text-[11px] text-on-surface-variant">
                  {allClients ? 'Member sees all workspace clients and projects' : 'Member only sees specifically granted clients'}
                </p>
              </div>
              <button
                role="switch"
                aria-checked={allClients}
                disabled={saving}
                onClick={() => toggleAllClients(!allClients)}
                className={cn(
                  'relative shrink-0 w-9 h-5 rounded-full transition-colors duration-200 disabled:opacity-50',
                  allClients ? 'bg-ds-secondary' : 'bg-outline-variant',
                )}
              >
                <span className={cn(
                  'absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                  allClients ? 'translate-x-4' : 'translate-x-0',
                )} />
              </button>
            </div>

            {/* Per-client grants (only when all_clients = false) */}
            {!allClients && grantsSection && (
              <div className="mt-2">
                {!grantsLoaded ? (
                  <div className="flex items-center gap-2 py-4 text-xs text-on-surface-variant">
                    <Loader2 className="size-3.5 animate-spin" /> Loading clients…
                  </div>
                ) : clients.length === 0 ? (
                  <p className="text-xs text-on-surface-variant py-2">No clients found in this workspace.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {clients.map(c => (
                      <ClientGrantRow
                        key={c.id}
                        client={c}
                        projects={projects}
                        grants={grants}
                        onGrantsChange={saveGrants}
                        loadProjects={loadProjects}
                        disabled={savingGrants}
                      />
                    ))}
                  </div>
                )}
                {savingGrants && (
                  <p className="flex items-center gap-1.5 text-[11px] text-on-surface-variant mt-2">
                    <Loader2 className="size-3 animate-spin" /> Saving…
                  </p>
                )}
              </div>
            )}

            {/* Summary when all_clients = false + grants section closed */}
            {!allClients && !grantsSection && grantsLoaded && (
              <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant mt-1">
                <Check className="size-3 text-emerald-500" />
                {grants.filter(g => g.projectId === null).length} client{grants.filter(g => g.projectId === null).length !== 1 ? 's' : ''} granted
                {grants.filter(g => g.projectId !== null).length > 0 && ` · ${grants.filter(g => g.projectId !== null).length} specific project${grants.filter(g => g.projectId !== null).length !== 1 ? 's' : ''}`}
              </div>
            )}
          </div>

          {saving && (
            <p className="flex items-center gap-1.5 text-[11px] text-on-surface-variant px-5 pb-3">
              <Loader2 className="size-3 animate-spin" /> Saving…
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface TeamSettingsProps {
  plan: string
  initialMembers: TeamInvite[]
}

export function TeamSettings({ plan, initialMembers }: TeamSettingsProps) {
  const [members, setMembers]        = useState<TeamInvite[]>(initialMembers)
  const [email, setEmail]            = useState('')
  const [role, setRole]              = useState<'admin' | 'member'>('member')
  const [isPending, startTransition] = useTransition()

  const isBusinessPlan = plan === 'business'
  const seatsUsed      = members.length
  const seatsLeft      = Math.max(0, TEAM_LIMIT - seatsUsed)

  function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    startTransition(async () => {
      const res = await fetch('/api/settings/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role }),
      })
      if (res.ok) {
        const invite = await res.json()
        setMembers(prev => [invite, ...prev])
        setEmail('')
        toast.success(`Invitation sent to ${invite.email}`)
      } else if (res.status === 402) {
        const d = await res.json()
        toast.error(d.code === 'team_gating'
          ? 'Team members are available on the Business plan.'
          : `Seat limit reached (${d.limit} max on Business plan).`)
      } else if (res.status === 409) {
        toast.error('This email has already been invited.')
      } else {
        toast.error('Failed to send invitation.')
      }
    })
  }

  function handleRemove(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/settings/team/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== id))
        toast.success('Member removed')
      } else {
        toast.error('Failed to remove member')
      }
    })
  }

  function handlePermissionsChange(id: string, perms: WorkspacePermissions) {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, permissions: perms } : m))
  }

  return (
    <div className="flex flex-col gap-6 px-8 pt-8 pb-12">
      <div className="mb-2">
        <h2 className="text-lg font-bold text-on-surface tracking-tight">Team Members</h2>
        <p className="text-sm text-on-surface-variant mt-0.5">Invite collaborators and configure exactly what they can access.</p>
      </div>

      {!isBusinessPlan && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex flex-col items-center text-center gap-4">
          <div className="size-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <Zap className="size-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">Team members is a Business feature</p>
            <p className="text-xs text-on-surface-variant mt-1.5 max-w-sm leading-relaxed">
              Invite up to {TEAM_LIMIT} collaborators to your workspace on the Business plan.
            </p>
          </div>
          <Link
            href="/dashboard/settings/billing"
            className="inline-flex items-center gap-1.5 h-9 px-5 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
          >
            <Zap className="size-3.5" />
            Upgrade to Business
          </Link>
        </div>
      )}

      {isBusinessPlan && (
        <>
          {/* Seat usage */}
          <div className="bg-white rounded-md shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-outline-variant/40 bg-surface-container/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-md bg-ds-secondary/10 flex items-center justify-center">
                  <Users className="size-3.5 text-ds-secondary" />
                </div>
                <p className="text-sm font-bold text-on-surface">Seats</p>
              </div>
              <span className="text-xs text-on-surface-variant">
                <span className="font-semibold text-on-surface">{seatsUsed}</span> / {TEAM_LIMIT} used
              </span>
            </div>
            <div className="px-5 py-4">
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', seatsUsed >= TEAM_LIMIT ? 'bg-red-500' : 'bg-ds-secondary')}
                  style={{ width: `${Math.min((seatsUsed / TEAM_LIMIT) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-on-surface-variant mt-2">
                {seatsLeft > 0
                  ? `${seatsLeft} seat${seatsLeft !== 1 ? 's' : ''} remaining`
                  : 'All seats used — remove a member to invite someone new'}
              </p>
            </div>
          </div>

          {/* Invite form */}
          {seatsLeft > 0 && (
            <div className="bg-white rounded-md shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-outline-variant/40 bg-surface-container/30 flex items-center gap-2.5">
                <div className="size-7 rounded-md bg-ds-secondary/10 flex items-center justify-center">
                  <UserPlus className="size-3.5 text-ds-secondary" />
                </div>
                <p className="text-sm font-bold text-on-surface">Invite a team member</p>
              </div>
              <form onSubmit={handleInvite} className="px-5 py-4 flex items-end gap-3">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Email address</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    required
                    disabled={isPending}
                    className="h-10 rounded-md"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-on-surface">Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as 'admin' | 'member')}
                    disabled={isPending}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-ds-secondary/30"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isPending || !email.trim()}
                  className="h-10 px-5 rounded-md bg-ds-secondary text-white text-sm font-semibold hover:bg-ds-secondary-container transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  {isPending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
                  Send invite
                </button>
              </form>
            </div>
          )}

          {/* Members list */}
          <div className="bg-white rounded-md shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-outline-variant/40 bg-surface-container/30 flex items-center gap-2.5">
              <div className="size-7 rounded-md bg-ds-secondary/10 flex items-center justify-center">
                <Users className="size-3.5 text-ds-secondary" />
              </div>
              <p className="text-sm font-bold text-on-surface">Members</p>
            </div>

            {members.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center px-6">
                <Users className="size-7 text-on-surface-variant/30" />
                <p className="text-sm text-on-surface-variant">No team members yet — invite someone above.</p>
              </div>
            ) : (
              <div>
                {members.map(m => (
                  <MemberRow
                    key={m.id}
                    member={m}
                    onRemove={handleRemove}
                    onPermissionsChange={handlePermissionsChange}
                    isPending={isPending}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
