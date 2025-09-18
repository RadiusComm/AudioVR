import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client for client-side operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Create Supabase client for server-side operations (with service role key)
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Audio storage configuration
export const AUDIO_STORAGE_BUCKET = 'audio-assets'
export const AVATAR_STORAGE_BUCKET = 'avatars'

// Helper functions for audio file management
export const uploadAudioFile = async (
  file: File,
  path: string,
  userId?: string
) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = userId ? `${userId}/${path}/${fileName}` : `${path}/${fileName}`

  const { data, error } = await supabase.storage
    .from(AUDIO_STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error
  return data
}

export const getAudioUrl = (path: string) => {
  const { data } = supabase.storage
    .from(AUDIO_STORAGE_BUCKET)
    .getPublicUrl(path)
  return data.publicUrl
}

export const deleteAudioFile = async (path: string) => {
  const { error } = await supabase.storage
    .from(AUDIO_STORAGE_BUCKET)
    .remove([path])
  if (error) throw error
}

// Mystery data helpers
export const getMysteries = async (filters?: {
  world?: string
  difficulty?: string
  creator_id?: string
}) => {
  let query = supabase
    .from('mysteries')
    .select(`
      *,
      worlds(*),
      creators(*),
      user_progress(completion_percentage),
      user_ratings(rating)
    `)
    .eq('status', 'published')

  if (filters?.world) {
    query = query.eq('world_id', filters.world)
  }
  
  if (filters?.difficulty) {
    query = query.eq('difficulty_level', filters.difficulty)
  }
  
  if (filters?.creator_id) {
    query = query.eq('creator_id', filters.creator_id)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const getMysteryById = async (id: string, userId?: string) => {
  const { data, error } = await supabase
    .from('mysteries')
    .select(`
      *,
      worlds(*),
      creators(*),
      story_elements(*),
      characters(*),
      ${userId ? `user_progress!user_progress_user_id_fkey(*)` : ''}
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// User progress tracking
export const updateUserProgress = async (
  userId: string,
  mysteryId: string,
  progress: {
    completion_percentage?: number
    current_scene?: string
    collected_evidence?: string[]
    choices_made?: Record<string, any>
  }
) => {
  const { data, error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      mystery_id: mysteryId,
      ...progress,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Analytics helpers
export const trackUserSession = async (
  userId: string,
  sessionData: {
    mystery_id?: string
    session_duration?: number
    voice_commands_used?: number
    accessibility_features_used?: string[]
  }
) => {
  const { error } = await supabase
    .from('user_sessions')
    .insert({
      user_id: userId,
      ...sessionData,
      created_at: new Date().toISOString(),
    })

  if (error) throw error
}

export const trackVoiceCommand = async (
  userId: string,
  commandData: {
    command_text: string
    recognition_confidence: number
    processing_time_ms: number
    success: boolean
    context?: string
  }
) => {
  const { error } = await supabase
    .from('voice_commands')
    .insert({
      user_id: userId,
      ...commandData,
      created_at: new Date().toISOString(),
    })

  if (error) throw error
}

// Accessibility analytics
export const trackAccessibilityUsage = async (
  userId: string,
  accessibilityData: {
    screen_reader_enabled: boolean
    voice_only_mode: boolean
    haptic_enabled: boolean
    spatial_audio_score: number
    feature_usage: Record<string, number>
  }
) => {
  const { error } = await supabase
    .from('accessibility_usage')
    .insert({
      user_id: userId,
      ...accessibilityData,
      created_at: new Date().toISOString(),
    })

  if (error) throw error
}

// Real-time subscriptions for live features
export const subscribeToDashboardMetrics = (callback: (payload: any) => void) => {
  return supabase
    .channel('dashboard-metrics')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_sessions',
      },
      callback
    )
    .subscribe()
}

export const subscribeToVoiceCommands = (callback: (payload: any) => void) => {
  return supabase
    .channel('voice-commands')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'voice_commands',
      },
      callback
    )
    .subscribe()
}

// Content management helpers
export const createMystery = async (
  creatorId: string,
  mysteryData: {
    title: string
    description: string
    world_id: string
    difficulty_level: string
    estimated_duration: number
    accessibility_features: string[]
    content_warnings: string[]
  }
) => {
  const { data, error } = await supabase
    .from('mysteries')
    .insert({
      creator_id: creatorId,
      status: 'draft',
      ...mysteryData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const addStoryElement = async (
  mysteryId: string,
  elementData: {
    type: string
    title: string
    content: string
    audio_description: string
    spatial_position?: { x: number; y: number; z: number }
    trigger_conditions?: string[]
    accessibility_notes: string
    order_index: number
  }
) => {
  const { data, error } = await supabase
    .from('story_elements')
    .insert({
      mystery_id: mysteryId,
      ...elementData,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Error handling wrapper
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  
  if (error.code === 'PGRST301') {
    throw new Error('Resource not found')
  }
  
  if (error.code === '23505') {
    throw new Error('Resource already exists')
  }
  
  if (error.code === 'PGRST116') {
    throw new Error('Access denied')
  }
  
  throw new Error(error.message || 'Database operation failed')
}

export default supabase