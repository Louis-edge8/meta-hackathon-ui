export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      locations: {
        Row: {
          id: string
          name: string
          country: string
          tags: string[]
          description: string
        }
        Insert: {
          id?: string
          name: string
          country: string
          tags?: string[]
          description: string
        }
        Update: {
          id?: string
          name?: string
          country?: string
          tags?: string[]
          description?: string
        }
      }
      user_interests: {
        Row: {
          id: string
          user_id: string
          locations_id: string[]
          locations_text: string
          budget: number
          duration: number
          activities: string
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          locations_id: string[]
          locations_text: string
          budget: number
          duration: number
          activities: string
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          locations_id?: string[]
          locations_text?: string
          budget?: number
          duration?: number
          activities?: string
          notes?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          role: string
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: string
          created_at?: string
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
  auth: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
        }
      }
    }
  }
}

export type Location = Database["public"]["Tables"]["locations"]["Row"]
export type UserInterest = Database["public"]["Tables"]["user_interests"]["Row"]
export type UserInterestInsert = Database["public"]["Tables"]["user_interests"]["Insert"]
export type UserInterestUpdate = Database["public"]["Tables"]["user_interests"]["Update"]
