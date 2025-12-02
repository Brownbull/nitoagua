import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Re-export Database types for convenience
export type { Database } from '@/types/database'

// Typed Supabase client
export type TypedSupabaseClient = SupabaseClient<Database>

// Table types for easy access
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type WaterRequest = Database['public']['Tables']['water_requests']['Row']
export type WaterRequestInsert = Database['public']['Tables']['water_requests']['Insert']
export type WaterRequestUpdate = Database['public']['Tables']['water_requests']['Update']

// Re-export commonly used auth types
export type { User, Session, AuthError } from '@supabase/supabase-js'
