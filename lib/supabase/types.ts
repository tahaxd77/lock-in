export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          total_focus_hours: number
          current_status: 'idle' | 'focusing' | 'break'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          total_focus_hours?: number
          current_status?: 'idle' | 'focusing' | 'break'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          total_focus_hours?: number
          current_status?: 'idle' | 'focusing' | 'break'
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          subject: string
          start_time: string
          end_time: string | null
          duration_minutes: number | null
          is_public_now: boolean
          scheduled_visibility: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          start_time?: string
          end_time?: string | null
          is_public_now?: boolean
          scheduled_visibility?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          start_time?: string
          end_time?: string | null
          is_public_now?: boolean
          scheduled_visibility?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      nudges: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          type: 'high-five' | 'focus-up' | 'coffee-break'
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          type: 'high-five' | 'focus-up' | 'coffee-break'
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          type?: 'high-five' | 'focus-up' | 'coffee-break'
          created_at?: string
        }
      }
    }
    Views: {
      active_sessions: {
        Row: {
          id: string
          user_id: string
          subject: string
          start_time: string
          end_time: string | null
          duration_minutes: number | null
          is_public_now: boolean
          scheduled_visibility: string | null
          created_at: string
          updated_at: string
          username: string
          avatar_url: string | null
        }
      }
      recent_nudges: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          type: 'high-five' | 'focus-up' | 'coffee-break'
          created_at: string
          sender_username: string
          sender_avatar_url: string | null
          receiver_username: string
          receiver_avatar_url: string | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
