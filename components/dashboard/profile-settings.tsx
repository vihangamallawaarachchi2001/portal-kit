'use client'

import { useState, useRef, useTransition } from 'react'
import { Profile } from '@/types/database'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/format'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Camera, Loader2, User, Building2, MessageSquare, Mail } from 'lucide-react'
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Avatar card */}
      <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-container/40">
          <h2 className="text-sm font-bold text-on-surface">Profile Photo</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">This appears on your portal and emails.</p>
        </div>
        <div className="p-6 flex items-center gap-5">
          <div className="relative shrink-0">
            <Avatar className="size-20">
              <AvatarImage src={avatarPreview ?? form.avatar_url} />
              <AvatarFallback className="text-2xl bg-ds-secondary/10 text-ds-secondary font-bold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 size-7 rounded-full bg-ds-secondary text-white flex items-center justify-center shadow-md hover:bg-ds-secondary-container transition-colors"
            >
              <Camera className="size-3.5" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="text-base font-semibold text-on-surface">{displayName}</p>
            <p className="text-sm text-on-surface-variant">{email}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-ds-secondary hover:underline mt-1 font-medium"
            >
              Change photo
            </button>
          </div>
        </div>
      </div>

      {/* Profile fields */}
      <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-container/40">
          <h2 className="text-sm font-bold text-on-surface">Personal Details</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Your name and business info shown to clients.</p>
        </div>
        <div className="p-6 flex flex-col gap-5">
          {/* Email — read-only */}
          <div className="flex flex-col gap-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              <Mail className="size-3.5" /> Email
            </Label>
            <div className="h-10 px-3.5 rounded-xl border border-outline-variant bg-surface-container/50 flex items-center">
              <span className="text-sm text-on-surface-variant">{email}</span>
            </div>
            <p className="text-xs text-on-surface-variant">Login email — cannot be changed here.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="s-name" className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                <User className="size-3.5" /> Full Name
              </Label>
              <Input id="s-name" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Jane Smith" className="h-10 rounded-xl" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="s-biz" className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                <Building2 className="size-3.5" /> Business Name
              </Label>
              <Input id="s-biz" value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} placeholder="Acme Design Co." className="h-10 rounded-xl" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-tagline" className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              <MessageSquare className="size-3.5" /> Tagline
            </Label>
            <Input id="s-tagline" value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="Design that drives results" className="h-10 rounded-xl" />
            <p className="text-xs text-on-surface-variant">Shown on your client portal header.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="h-10 px-6 rounded-xl">
          {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
          Save changes
        </Button>
      </div>
    </form>
  )
}
