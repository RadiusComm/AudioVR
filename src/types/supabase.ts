// Basic Supabase types for AudioVR
// This will be updated when you deploy the full schema

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          user_id: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          accessibility_preferences: any | null
          voice_settings: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          accessibility_preferences?: any | null
          voice_settings?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          accessibility_preferences?: any | null
          voice_settings?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      mysteries: {
        Row: {
          id: string
          title: string
          description: string | null
          creator_id: string
          world_id: string | null
          difficulty_level: string | null
          estimated_duration: number | null
          accessibility_features: string[] | null
          content_warnings: string[] | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          creator_id: string
          world_id?: string | null
          difficulty_level?: string | null
          estimated_duration?: number | null
          accessibility_features?: string[] | null
          content_warnings?: string[] | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          creator_id?: string
          world_id?: string | null
          difficulty_level?: string | null
          estimated_duration?: number | null
          accessibility_features?: string[] | null
          content_warnings?: string[] | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      worlds: {
        Row: {
          id: string
          name: string
          description: string | null
          creator_id: string
          theme: string | null
          difficulty_level: string | null
          estimated_duration: number | null
          accessibility_features: string[] | null
          content_warnings: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          creator_id: string
          theme?: string | null
          difficulty_level?: string | null
          estimated_duration?: number | null
          accessibility_features?: string[] | null
          content_warnings?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          creator_id?: string
          theme?: string | null
          difficulty_level?: string | null
          estimated_duration?: number | null
          accessibility_features?: string[] | null
          content_warnings?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          event_data: any | null
          mystery_id: string | null
          world_id: string | null
          session_id: string | null
          accessibility_context: any | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          event_data?: any | null
          mystery_id?: string | null
          world_id?: string | null
          session_id?: string | null
          accessibility_context?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          event_data?: any | null
          mystery_id?: string | null
          world_id?: string | null
          session_id?: string | null
          accessibility_context?: any | null
          created_at?: string
        }
      }
      mystery_elements: {
        Row: {
          id: string
          mystery_id: string
          world_id: string | null
          element_type: string
          title: string
          content: string | null
          audio_description: string | null
          spatial_position: any | null
          interaction_triggers: any | null
          accessibility_metadata: any | null
          order_index: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mystery_id: string
          world_id?: string | null
          element_type: string
          title: string
          content?: string | null
          audio_description?: string | null
          spatial_position?: any | null
          interaction_triggers?: any | null
          accessibility_metadata?: any | null
          order_index?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mystery_id?: string
          world_id?: string | null
          element_type?: string
          title?: string
          content?: string | null
          audio_description?: string | null
          spatial_position?: any | null
          interaction_triggers?: any | null
          accessibility_metadata?: any | null
          order_index?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      player_progress: {
        Row: {
          id: string
          user_id: string
          mystery_id: string
          world_id: string | null
          current_scene: string | null
          discovered_evidence: any | null
          character_interactions: any | null
          voice_commands_used: any | null
          accessibility_aids_used: any | null
          completion_percentage: number | null
          session_duration: number | null
          hints_used: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mystery_id: string
          world_id?: string | null
          current_scene?: string | null
          discovered_evidence?: any | null
          character_interactions?: any | null
          voice_commands_used?: any | null
          accessibility_aids_used?: any | null
          completion_percentage?: number | null
          session_duration?: number | null
          hints_used?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mystery_id?: string
          world_id?: string | null
          current_scene?: string | null
          discovered_evidence?: any | null
          character_interactions?: any | null
          voice_commands_used?: any | null
          accessibility_aids_used?: any | null
          completion_percentage?: number | null
          session_duration?: number | null
          hints_used?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}