'use client';
import { createContext, ReactNode, useContext, useEffect, useState}  from 'react';
import { type User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client';

type AuthContextValue = {
  user: User | null,
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
})

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode,
  initialUser: User | null
}) {
  const [user, setUser] = useState<User | null>( initialUser);

  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading: false }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useUser() {
  return useContext(AuthContext)
}