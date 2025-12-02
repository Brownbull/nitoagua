import { createClient } from './server'
import type { User, Session } from '@supabase/supabase-js'

/**
 * Get the current authenticated user (server-side)
 * Returns null if not authenticated
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Get the current session (server-side)
 * Returns null if no active session
 */
export async function getSession(): Promise<Session | null> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
