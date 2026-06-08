import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase-client'

interface AuthState {
  session: Session | null
  user: User | null
  /** True while the initial session check is in flight */
  loading: boolean
}

const AuthContext = createContext<AuthState | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Wraps the app and keeps the Supabase session fresh.
 * Uses onAuthStateChange so that:
 *  - Token refreshes are handled automatically (EC-008)
 *  - Session is available synchronously after initial load
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
  })

  useEffect(() => {
    // Hydrate from the existing persisted session on first render
    supabase.auth.getSession().then(({ data }) => {
      setState({
        session: data.session,
        user: data.session?.user ?? null,
        loading: false,
      })
    })

    // Keep session state in sync — handles token refresh, sign-in, sign-out
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState({
          session,
          user: session?.user ?? null,
          loading: false,
        })
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

/** Access the current auth state. Must be used inside <AuthProvider>. */
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
