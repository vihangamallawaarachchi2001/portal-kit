import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DataGrant {
  id: string
  clientId: string
  projectId: string | null   // null = client-level grant (all projects)
  canViewFiles: boolean
  canViewInvoices: boolean
  canViewMessages: boolean
  canViewMilestones: boolean
}

export interface WorkspacePermissions {
  clients:     boolean
  projects:    boolean
  invoices:    boolean
  files:       boolean
  messages:    boolean
  settings:    boolean
  billing:     boolean
  all_clients: boolean  // true = unrestricted row access; false = use team_data_grants
}

export interface WorkspaceContext {
  ownerId:    string
  isOwner:    boolean
  inviteId?:  string
  permissions: WorkspacePermissions
  // 'all' = member sees all owner data; 'restricted' = only granted clients/projects
  accessMode: 'all' | 'restricted'
  grants:     DataGrant[]
}

export interface WorkspaceSummary {
  inviteId:  string        // 'own' for personal workspace
  ownerId:   string
  name:      string
  avatarUrl: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const OWNER_PERMISSIONS: WorkspacePermissions = {
  clients: true, projects: true, invoices: true,
  files: true, messages: true, settings: true, billing: true,
  all_clients: true,
}

const DEFAULT_MEMBER_PERMISSIONS: WorkspacePermissions = {
  clients: true, projects: true, invoices: true,
  files: true, messages: false, settings: false, billing: false,
  all_clients: true,
}

// ─── Core resolver ────────────────────────────────────────────────────────────

/**
 * Resolves workspace context from the `pk-workspace` cookie.
 *
 * Cookie values:
 *   'own' (or absent) → personal workspace (user is owner)
 *   <invite_id>       → team workspace; owner is invite.owner_id
 *
 * Signature kept compatible with existing call sites:
 *   getWorkspaceContext(user.id, user.email ?? '')
 */
export async function getWorkspaceContext(
  userId: string,
  _userEmail: string,
): Promise<WorkspaceContext> {
  const cookieStore = await cookies()
  const activeWorkspace = cookieStore.get('pk-workspace')?.value

  // Personal workspace
  if (!activeWorkspace || activeWorkspace === 'own') {
    return {
      ownerId: userId,
      isOwner: true,
      permissions: OWNER_PERMISSIONS,
      accessMode: 'all',
      grants: [],
    }
  }

  const service = createServiceClient()

  const { data: invite } = await service
    .from('team_invites')
    .select('id, owner_id, permissions, accepted_user_id, status')
    .eq('id', activeWorkspace)
    .maybeSingle()

  // Must be a valid, accepted invite
  if (!invite || invite.status !== 'accepted') {
    return { ownerId: userId, isOwner: true, permissions: OWNER_PERMISSIONS, accessMode: 'all', grants: [] }
  }

  // Link on first switch (accepted_user_id not yet set)
  if (!invite.accepted_user_id) {
    await service.from('team_invites').update({ accepted_user_id: userId }).eq('id', invite.id)
  } else if (invite.accepted_user_id !== userId) {
    // This invite belongs to a different user
    return { ownerId: userId, isOwner: true, permissions: OWNER_PERMISSIONS, accessMode: 'all', grants: [] }
  }

  const rawPerms = (invite.permissions ?? {}) as Partial<WorkspacePermissions>
  const perms: WorkspacePermissions = { ...DEFAULT_MEMBER_PERMISSIONS, ...rawPerms }
  const allClients = perms.all_clients ?? true

  if (allClients) {
    return {
      ownerId: invite.owner_id,
      isOwner: false,
      inviteId: invite.id,
      permissions: perms,
      accessMode: 'all',
      grants: [],
    }
  }

  // Load per-client/project grants
  const { data: rawGrants } = await service
    .from('team_data_grants')
    .select('id, client_id, project_id, can_view_files, can_view_invoices, can_view_messages, can_view_milestones')
    .eq('invite_id', invite.id)

  const grants: DataGrant[] = (rawGrants ?? []).map(g => ({
    id: g.id,
    clientId: g.client_id,
    projectId: g.project_id ?? null,
    canViewFiles: g.can_view_files,
    canViewInvoices: g.can_view_invoices,
    canViewMessages: g.can_view_messages,
    canViewMilestones: g.can_view_milestones,
  }))

  return {
    ownerId: invite.owner_id,
    isOwner: false,
    inviteId: invite.id,
    permissions: perms,
    accessMode: 'restricted',
    grants,
  }
}

// ─── Grant helpers (used by API routes) ──────────────────────────────────────

/** Returns the list of client IDs this member can access, or null if unrestricted. */
export function allowedClientIds(ctx: WorkspaceContext): string[] | null {
  if (ctx.isOwner || ctx.accessMode === 'all') return null
  return [...new Set(ctx.grants.map(g => g.clientId))]
}

/**
 * Returns the list of project IDs this member can access within a given client,
 * or null if all projects are accessible (client-level grant present).
 */
export function allowedProjectIds(ctx: WorkspaceContext, clientId: string): string[] | null {
  if (ctx.isOwner || ctx.accessMode === 'all') return null
  // A client-level grant (project_id = null) unlocks all projects in that client
  if (ctx.grants.some(g => g.clientId === clientId && g.projectId === null)) return null
  return ctx.grants
    .filter(g => g.clientId === clientId && g.projectId !== null)
    .map(g => g.projectId!)
}

/**
 * Checks whether a sub-feature (files, invoices, messages, milestones) is
 * accessible for a given client+project combination.
 *
 * Resolution order: project-level grant → client-level grant → deny.
 */
export function canAccessSub(
  ctx: WorkspaceContext,
  feature: keyof Pick<DataGrant, 'canViewFiles' | 'canViewInvoices' | 'canViewMessages' | 'canViewMilestones'>,
  clientId: string,
  projectId?: string | null,
): boolean {
  if (ctx.isOwner || ctx.accessMode === 'all') return true
  const projectGrant = projectId
    ? ctx.grants.find(g => g.clientId === clientId && g.projectId === projectId)
    : undefined
  const clientGrant = ctx.grants.find(g => g.clientId === clientId && g.projectId === null)
  const grant = projectGrant ?? clientGrant
  return grant ? (grant[feature] as boolean) : false
}

// ─── Workspace list (used by layout + switcher) ───────────────────────────────

/**
 * Returns all team workspaces (accepted invites) for a user.
 * Does NOT include the personal workspace — callers prepend it manually.
 */
export async function getAvailableWorkspaces(userId: string, userEmail: string): Promise<WorkspaceSummary[]> {
  const service = createServiceClient()

  // Two separate queries to avoid PostgREST misparse of email addresses inside .or() strings,
  // and to avoid a cross-schema join (owner_id → auth.users, not profiles).
  const [byId, byEmail] = await Promise.all([
    service.from('team_invites')
      .select('id, owner_id, accepted_user_id')
      .eq('status', 'accepted')
      .eq('accepted_user_id', userId),
    service.from('team_invites')
      .select('id, owner_id, accepted_user_id')
      .eq('status', 'accepted')
      .ilike('email', userEmail),
  ])

  // Merge and deduplicate by invite id
  const seen = new Set<string>()
  const rows = [...(byId.data ?? []), ...(byEmail.data ?? [])].filter(inv => {
    if (seen.has(inv.id)) return false
    seen.add(inv.id)
    return true
  })

  if (rows.length === 0) return []

  // Link accepted_user_id for invites found via email match that haven't been linked yet.
  const unlinked = rows.filter(inv => !inv.accepted_user_id).map(inv => inv.id)
  if (unlinked.length > 0) {
    await service.from('team_invites').update({ accepted_user_id: userId }).in('id', unlinked)
  }

  // Fetch owner profiles separately (owner_id → auth.users, no direct FK to profiles)
  const ownerIds = [...new Set(rows.map(inv => inv.owner_id))]
  const { data: profiles } = await service
    .from('profiles')
    .select('id, full_name, business_name, avatar_url')
    .in('id', ownerIds)

  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

  return rows.map((inv) => {
    const profile = profileMap.get(inv.owner_id)
    return {
      inviteId:  inv.id,
      ownerId:   inv.owner_id,
      name:      profile?.business_name || profile?.full_name || 'Workspace',
      avatarUrl: profile?.avatar_url ?? null,
    }
  })
}
