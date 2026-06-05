'use client'

import { useState, useRef, useTransition } from 'react'
import { Profile } from '@/types/database'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/format'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Camera, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ProfileSettingsProps {
  profile: Profile | null
  email: string
}

export function ProfileSettings({ profile, email }: ProfileSettingsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    full_name:     profile?.full_name     ?? '',
    business_name: profile?.business_name ?? '',
    tagline:       profile?.tagline       ?? '',
    avatar_url:    profile?.avatar_url    ?? '',
  })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile]       = useState<File | null>(null)

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      let avatarUrl = form.avatar_url
      if (avatarFile) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const ext  = avatarFile.name.split('.').pop()
        const path = `avatars/${user.id}/avatar.${ext}`
        const { error } = await supabase.storage
          .from('portalkit_bucket')
          .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type })
        if (error) { toast.error('Failed to upload avatar'); return }
        const { data } = supabase.storage.from('portalkit_bucket').getPublicUrl(path)
        avatarUrl = data.publicUrl
      }
      const res = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name:     form.full_name     || null,
          business_name: form.business_name || null,
          tagline:       form.tagline       || null,
          avatar_url:    avatarUrl          || null,
        }),
      })
      if (res.ok) { toast.success('Profile saved'); router.refresh() }
      else          toast.error('Failed to save profile')
    })
  }

  const displayName = form.business_name || form.full_name || 'Me'

  return (
    <form onSubmit={handleSubmit}>
      {/* ── Page title ────────────────────────────── */}
      <div className="px-8 pt-8 pb-8">
        <h2 className="text-lg font-bold text-on-surface tracking-tight">Profile</h2>
        <p className="text-sm text-on-surface-variant mt-0.5">
          This information is shown to your clients in their portals.
        </p>
      </div>

      {/* ── Avatar row ────────────────────────────── */}
      <SettingsRow
        label="Avatar"
        description="Shown on your client portal and outgoing emails."
      >
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <Avatar className="size-16">
              <AvatarImage src={avatarPreview ?? form.avatar_url} />
              <AvatarFallback className="text-xl bg-ds-secondary/10 text-ds-secondary font-bold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 size-6 rounded-full bg-ds-secondary text-white flex items-center justify-center shadow-md hover:bg-ds-secondary-container transition-colors"
            >
              <Camera className="size-3" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-semibold text-ds-secondary hover:text-ds-secondary-container transition-colors text-left"
            >
              Upload new photo
            </button>
            <p className="text-xs text-on-surface-variant">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>
      </SettingsRow>

      <Divider />

      {/* ── Name fields ───────────────────────────── */}
      <SettingsRow
        label="Full Name"
        description="Your personal name used on emails and the portal."
      >
        <Input
          value={form.full_name}
          onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
          placeholder="Jane Smith"
          className="rounded-md h-10 max-w-xs"
        />
      </SettingsRow>

      <Divider />

      <SettingsRow
        label="Business Name"
        description="Shown as your sender identity on client portals."
      >
        <Input
          value={form.business_name}
          onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
          placeholder="Acme Design Co."
          className="rounded-md h-10 max-w-xs"
        />
      </SettingsRow>

      <Divider />

      {/* ── Tagline ───────────────────────────────── */}
      <SettingsRow
        label="Tagline"
        description="A short line shown below your name on client portals."
      >
        <Input
          value={form.tagline}
          onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
          placeholder="Design that drives results"
          className="rounded-md h-10 max-w-sm"
        />
      </SettingsRow>

      <Divider />

      {/* ── Email (read-only) ─────────────────────── */}
      <SettingsRow
        label="Email"
        description="Your login email. Contact support to change it."
      >
        <div className="h-10 px-3.5 rounded-md border border-outline-variant/60 bg-surface-container/60 flex items-center max-w-xs">
          <span className="text-sm text-on-surface-variant select-all">{email}</span>
        </div>
      </SettingsRow>

      {/* ── Footer ────────────────────────────────── */}
      <div className="px-8 py-6 flex justify-end border-t border-outline-variant/30 mt-2">
        <Button type="submit" disabled={isPending} className="h-10 px-6 rounded-md">
          {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
          Save changes
        </Button>
      </div>
    </form>
  )
}

function SettingsRow({ label, description, children }: {
  label: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="px-8 py-5 flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
      {/* Left: label + description */}
      <div className="sm:w-52 shrink-0">
        <p className="text-sm font-semibold text-on-surface">{label}</p>
        <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{description}</p>
      </div>
      {/* Right: control */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

function Divider() {
  return <div className="mx-8 h-px bg-outline-variant/25" />
}
