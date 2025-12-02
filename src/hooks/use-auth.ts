'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, AuthError } from '@supabase/supabase-js'

interface UseAuthReturn {
  user: User | null
  loading: boolean
  error: AuthError | null
}

/**
 * Client-side hook for accessing auth state
 * Automatically subscribes to auth state changes
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Get initial user
    const getInitialUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          setError(error)
        } else {
          setUser(user)
        }
      } catch {
        // Handle unexpected errors
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialUser()

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
        setError(null)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading, error }
}
