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
      users: {
        Row: {
          id: string
          role: 'patient' | 'doctor' | 'staff' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          role?: 'patient' | 'doctor' | 'staff' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'patient' | 'doctor' | 'staff' | 'admin'
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          phone: string | null
          address: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          phone?: string | null
          address?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          address?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      doctors: {
        Row: {
          id: string
          specialization: string
          bio: string | null
          experience_years: number
          consultation_fee: number
          is_available: boolean
        }
        Insert: {
          id: string
          specialization: string
          bio?: string | null
          experience_years?: number
          consultation_fee?: number
          is_available?: boolean
        }
        Update: {
          id?: string
          specialization?: string
          bio?: string | null
          experience_years?: number
          consultation_fee?: number
          is_available?: boolean
        }
      }
      facilities: {
        Row: {
          id: string
          title: string
          description: string
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          image_url?: string | null
          created_at?: string
        }
      }
      testimonials: {
        Row: {
          id: string
          patient_name: string
          content: string
          rating: number
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_name: string
          content: string
          rating?: number
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_name?: string
          content?: string
          rating?: number
          image_url?: string | null
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
}
