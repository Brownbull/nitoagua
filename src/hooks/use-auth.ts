'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createLoginRedirectUrl } from '@/lib/auth/session'
import type { User, AuthError } from '@supabase/supabase-js'

interface UseAuthReturn {
  user: User | null
  loading: boolean
  error: AuthError | null
  /**
   * Manually trigger session validation and refresh if needed
   * Useful for calling before important actions
   */
  validateSession: () => Promise<boolean>
}

/**
 * Interval for periodic session checks when tab is active (5 minutes)
 * Story 12.6-1: AC12.6.1.3 - Periodic session check
 */
const SESSION_CHECK_INTERVAL_MS = 5 * 60 * 1000

/**
 * Buffer time before expiry to trigger proactive refresh (5 minutes)
 * Story 12.6-1: AC12.6.1.3 - Proactively refresh tokens before they expire
 */
const REFRESH_BUFFER_MS = 5 * 60 * 1000

/**
 * Client-side hook for accessing auth state
 * Automatically subscribes to auth state changes
 *
 * Story 12.6-1 Enhancements:
 * - AC12.6.1.3: Add visibility change listener to refresh on app resume
 * - AC12.6.1.3: Periodic session check (every 5 minutes when active)
 * - AC12.6.1.4: Redirect to login on session expiry with return URL
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Track if we had a user before (for detecting expiry)
  const hadUserRef = useRef(false)
  // Track interval for cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * AC12.6.1.3: Proactively refresh tokens before they expire
   * Returns true if session is valid, false if needs login
   */
  const checkAndRefreshSession = useCallback(async (): Promise<boolean> => {
    const supabase = createClient()

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        return false
      }

      // Check if token expires soon (within buffer time)
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0
      const needsRefresh = Date.now() > expiresAt - REFRESH_BUFFER_MS

      if (needsRefresh) {
        console.log('[useAuth] Token expires soon, refreshing proactively...')
        const { error: refreshError } = await supabase.auth.refreshSession()

        if (refreshError) {
          console.error('[useAuth] Refresh failed:', refreshError.message)
          return false
        }

        console.log('[useAuth] Token refreshed successfully')
      }

      return true
    } catch (err) {
      console.error('[useAuth] Session check error:', err)
      return false
    }
  }, [])

  /**
   * Validate session and redirect if expired
   * Can be called manually before important actions
   */
  const validateSession = useCallback(async (): Promise<boolean> => {
    const isValid = await checkAndRefreshSession()

    if (!isValid && hadUserRef.current) {
      // Session expired - redirect to login with return URL
      console.log('[useAuth] Session expired, redirecting to login...')
      const loginUrl = createLoginRedirectUrl(pathname)
      router.push(loginUrl)
    }

    return isValid
  }, [checkAndRefreshSession, pathname, router])

  /**
   * AC12.6.1.3: Handle visibility change (app resume from background)
   */
  const handleVisibilityChange = useCallback(async () => {
    if (document.visibilityState === 'visible' && hadUserRef.current) {
      console.log('[useAuth] App resumed, validating session...')
      await validateSession()
    }
  }, [validateSession])

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
          hadUserRef.current = !!user
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
        hadUserRef.current = !!session?.user
        setLoading(false)
        setError(null)
      }
    )

    // AC12.6.1.3: Add visibility change listener for app resume
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // AC12.6.1.3: Periodic session check (every 5 minutes when active)
    intervalRef.current = setInterval(async () => {
      if (document.visibilityState === 'visible' && hadUserRef.current) {
        await checkAndRefreshSession()
      }
    }, SESSION_CHECK_INTERVAL_MS)

    return () => {
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [handleVisibilityChange, checkAndRefreshSession])

  return { user, loading, error, validateSession }
}
