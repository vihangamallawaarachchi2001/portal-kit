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
    full_name: profile?.full_name ?? '',
    business_name: profile?.business_name ?? '',
    tagline: profile?.tagline ?? '',
    avatar_url: profile?.avatar_url ?? '',
  })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

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

        const ext = avatarFile.name.split('.').pop()
        const path = `avatars/${user.id}/avatar.${ext}`
        const { error } = await supabase.storage
          .from('portalkit_bucket')
          .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type })

        if (error) {
          toast.error('Failed to upload avatar')
          return
        }
        const { data } = supabase.storage.from('portalkit_bucket').getPublicUrl(path)
        avatarUrl = data.publicUrl
      }

      const res = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name,
          business_name: form.business_name || null,
          tagline: form.tagline || null,
          avatar_url: avatarUrl || null,
        }),
      })

      if (res.ok) {
        toast.success('Profile updated')
        router.refresh()
      } else {
        toast.error('Failed to update profile')
      }
    })
  }

  const displayName = form.business_name || form.full_name || 'Me'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-white rounded-xl border border-outline-variant p-6">
      <h2 className="text-base font-semibold text-on-surface">Profile</h2>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="size-16">
            <AvatarImage src={avatarPreview ?? form.avatar_url} />
            <AvatarFallback className="text-lg bg-ds-secondary/10 text-ds-secondary font-bold">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 size-6 rounded-full bg-ds-secondary text-white flex items-center justify-center shadow-sm hover:bg-ds-secondary-container transition-colors"
          >
            <Camera className="size-3" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <p className="text-sm font-semibold text-on-surface">{displayName}</p>
          <p className="text-xs text-on-surface-variant">{email}</p>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-ds-secondary hover:underline mt-0.5">
            Change photo
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="s-name">Full name</Label>
          <Input id="s-name" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="s-biz">Business name</Label>
          <Input id="s-biz" value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} placeholder="Optional" />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="s-tagline">Tagline</Label>
          <Input id="s-tagline" value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="Design that drives results" />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
          Save changes
        </Button>
      </div>
    </form>
  )
}
