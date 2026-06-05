import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import type { AuthUser } from '../types'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

function toAuthUser(user: User): AuthUser {
  return { id: user.id, email: user.email }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(() => !!supabase)

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ? toAuthUser(session.user) : null)
      })
      .catch((err) => {
        console.error('[auth] getSession failed:', err)
      })
      .finally(() => {
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ? toAuthUser(session.user) : null)
      },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signInWithEmail = useCallback(async (email: string) => {
    if (!isSupabaseConfigured || !supabase) return
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    if (error) throw error
  }, [])

  const verifyOtp = useCallback(async (email: string, token: string) => {
    if (!isSupabaseConfigured || !supabase) return
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  return { user, loading, signInWithEmail, verifyOtp, signOut }
}
