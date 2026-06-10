'use client'

import { useState, useTransition } from 'react'
import { TeamInvite } from '@/types/database'
import { cn } from '@/lib/utils'
import { Users, UserPlus, Trash2, Loader2, Mail, Zap, Shield, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Link from 'next/link'

const TEAM_LIMIT = 5

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

  return (
    <div className="flex flex-col gap-6 px-8 pt-8 pb-12">
      <div className="mb-2">
        <h2 className="text-lg font-bold text-on-surface tracking-tight">Team Members</h2>
        <p className="text-sm text-on-surface-variant mt-0.5">Invite collaborators to manage your PortalKit workspace.</p>
      </div>

      {/* Business plan gate */}
      {!isBusinessPlan && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex flex-col items-center text-center gap-4">
          <div className="size-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <Zap className="size-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">Team members is a Business feature</p>
            <p className="text-xs text-on-surface-variant mt-1.5 max-w-sm leading-relaxed">
              Invite up to {TEAM_LIMIT} collaborators to your workspace on the Business plan. Manage clients, projects, and invoices together.
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
              <div className="divide-y divide-outline-variant/20">
                {members.map(m => (
                  <div key={m.id} className="flex items-center justify-between px-5 py-3.5 group hover:bg-surface-container/20 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        'size-8 rounded-full flex items-center justify-center shrink-0',
                        m.status === 'accepted' ? 'bg-ds-secondary/10' : 'bg-surface-container',
                      )}>
                        {m.role === 'admin'
                          ? <Shield className={cn('size-4', m.status === 'accepted' ? 'text-ds-secondary' : 'text-on-surface-variant')} />
                          : <Users  className={cn('size-4', m.status === 'accepted' ? 'text-ds-secondary' : 'text-on-surface-variant')} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-on-surface truncate">{m.email}</p>
                        <p className="text-xs text-on-surface-variant capitalize">{m.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={cn(
                        'inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border',
                        m.status === 'accepted'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200',
                      )}>
                        {m.status === 'pending' && <Clock className="size-2.5" />}
                        {m.status === 'accepted' ? 'Active' : 'Pending'}
                      </span>
                      <button
                        onClick={() => handleRemove(m.id)}
                        disabled={isPending}
                        className="md:opacity-0 md:group-hover:opacity-100 size-7 rounded-md flex items-center justify-center text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40"
                        title="Remove member"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
