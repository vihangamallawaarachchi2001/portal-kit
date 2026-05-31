'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'  // ← browser client, not server

export default function AuthPage() {
  const [email, setEmail]       = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()  // ← no await, browser client is sync

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSubmitted(true)
    }

    setLoading(false)
  }

  if (submitted) {
    return (
      <div>
        <h1>Check your email</h1>
        <p>We sent a sign-in link to <strong>{email}</strong></p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Sign in to PortalKit</h1>

      <label htmlFor="email">Email address</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        autoFocus
      />

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Sending…' : 'Send sign-in link'}
      </button>
    </form>
  )
}
