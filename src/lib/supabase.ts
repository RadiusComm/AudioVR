import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '../types/supabase'

// Public client for client-side operations
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Client component client (for use in React components)
export const createClientComponentSupabase = () => {
  return createClientComponentClient<Database>()
}

// Server component client (for use in server components)
export const createServerComponentSupabase = () => {
  return createServerComponentClient<Database>({ cookies })
}

// Admin client with service role key (for server-side operations)
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Utility functions for common operations
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

export const getMysteries = async (limit = 10) => {
  const { data, error } = await supabase
    .from('mysteries')
    .select(`
      *,
      worlds(*),
      creators:user_profiles(*)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching mysteries:', error)
    return []
  }

  return data
}

export const getMysteryById = async (mysteryId: string) => {
  const { data, error } = await supabase
    .from('mysteries')
    .select(`
      *,
      worlds(*),
      creators:user_profiles(*),
      grouped_elements:mystery_elements(*)
    `)
    .eq('id', mysteryId)
    .single()

  if (error) {
    console.error('Error fetching mystery:', error)
    return null
  }

  return data
}

export const savePlayerProgress = async (progressData: any) => {
  const { data, error } = await supabase
    .from('player_progress')
    .upsert(progressData, {
      onConflict: 'user_id,mystery_id'
    })

  if (error) {
    console.error('Error saving player progress:', error)
    return false
  }

  return true
}

export const trackAnalyticsEvent = async (eventData: {
  user_id?: string
  event_type: string
  event_data: any
  mystery_id?: string
  world_id?: string
  session_id?: string
  accessibility_context?: any
}) => {
  // TODO: Implement after Supabase schema is deployed
  console.log('Analytics event tracked (local):', eventData)
  return true
}

// Authentication helpers
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  return { data, error }
}

export const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })

  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Real-time subscriptions
export const subscribeToMysteryUpdates = (mysteryId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`mystery-${mysteryId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'mysteries',
        filter: `id=eq.${mysteryId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToPlayerProgress = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`progress-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'player_progress',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}