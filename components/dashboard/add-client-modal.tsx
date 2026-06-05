'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { slugify } from '@/lib/format'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'

interface AddClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddClientModal({ open, onOpenChange }: AddClientModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [slugError, setSlugError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleNameChange(value: string) {
    setName(value)
    if (!slugManual) setSlug(slugify(value))
  }

  function handleSlugChange(value: string) {
    setSlugManual(true)
    setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
    setSlugError(null)
  }

  async function checkSlug(value: string) {
    if (!value) return
    const res = await fetch(`/api/clients/check-slug?slug=${encodeURIComponent(value)}`)
    const data = await res.json()
    if (!data.available) setSlugError('This slug is already taken. Try another.')
    else setSlugError(null)
  }

  function reset() {
    setName('')
    setEmail('')
    setSlug('')
    setSlugManual(false)
    setSlugError(null)
    setError(null)
  }

  function handleClose() {
    if (!isPending) {
      reset()
      onOpenChange(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (slugError) return

    startTransition(async () => {
      setError(null)
      try {
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), portal_slug: slug }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error ?? 'Failed to create client')
          return
        }
        toast.success(`${name} added — portal is live!`)
        reset()
        onOpenChange(false)
        router.refresh()
      } catch {
        setError('Something went wrong. Please try again.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add new client</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ac-name">Client or company name <span className="text-red-500">*</span></Label>
            <Input
              id="ac-name"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="Acme Corp"
              required
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ac-email">Client email <span className="text-red-500">*</span></Label>
            <Input
              id="ac-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="hello@acmecorp.com"
              required
              disabled={isPending}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ac-slug">Portal URL slug <span className="text-red-500">*</span></Label>
            <div className="flex items-center rounded-lg border border-input bg-white overflow-hidden focus-within:ring-2 focus-within:ring-ds-secondary/50 focus-within:border-ds-secondary">
              <span className="px-3 text-sm text-on-surface-variant bg-surface-container border-r border-input py-2 shrink-0 select-none">
                /p/
              </span>
              <input
                id="ac-slug"
                value={slug}
                onChange={e => handleSlugChange(e.target.value)}
                onBlur={() => checkSlug(slug)}
                placeholder="acme-corp"
                required
                disabled={isPending}
                className="flex-1 px-3 py-2 text-sm outline-none bg-transparent"
              />
            </div>
            {slugError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="size-3" />{slugError}
              </p>
            )}
            <p className="text-xs text-on-surface-variant">Lowercase letters, numbers, and hyphens only.</p>
          </div>

          {error && (
            <p className="text-sm text-red-500 flex items-center gap-1.5">
              <AlertCircle className="size-4 shrink-0" />{error}
            </p>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !!slugError || !name || !email || !slug}>
              {isPending && <Loader2 className="size-4 mr-2 animate-spin" />}
              Create portal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
