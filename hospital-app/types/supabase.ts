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
        Row: { id: string; role: 'patient' | 'doctor' | 'staff' | 'admin'; created_at: string }
        Insert: { id: string; role?: 'patient' | 'doctor' | 'staff' | 'admin'; created_at?: string }
        Update: { id?: string; role?: 'patient' | 'doctor' | 'staff' | 'admin'; created_at?: string }
        Relationships: []
      }
      profiles: {
        Row: { id: string; first_name: string; last_name: string; phone: string | null; address: string | null; avatar_url: string | null; created_at: string }
        Insert: { id: string; first_name: string; last_name: string; phone?: string | null; address?: string | null; avatar_url?: string | null; created_at?: string }
        Update: { id?: string; first_name?: string; last_name?: string; phone?: string | null; address?: string | null; avatar_url?: string | null; created_at?: string }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      doctors: {
        Row: { id: string; specialization: string; bio: string | null; experience_years: number; consultation_fee: number; is_active: boolean; availability?: string | null; slot_interval_min: number }
        Insert: { id: string; specialization: string; bio?: string | null; experience_years?: number; consultation_fee?: number; is_active?: boolean; availability?: string | null; slot_interval_min?: number }
        Update: { id?: string; specialization?: string; bio?: string | null; experience_years?: number; consultation_fee?: number; is_active?: boolean; availability?: string | null; slot_interval_min?: number }
        Relationships: [
          {
            foreignKeyName: "doctors_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      facilities: {
        Row: { id: string; title: string; description: string; image_url: string | null; created_at: string }
        Insert: { id?: string; title: string; description: string; image_url?: string | null; created_at?: string }
        Update: { id?: string; title?: string; description?: string; image_url?: string | null; created_at?: string }
        Relationships: []
      }
      testimonials: {
        Row: { id: string; patient_name: string; content: string; rating: number; image_url: string | null; created_at: string }
        Insert: { id?: string; patient_name: string; content: string; rating?: number; image_url?: string | null; created_at?: string }
        Update: { id?: string; patient_name?: string; content?: string; rating?: number; image_url?: string | null; created_at?: string }
        Relationships: []
      }
      appointments: {
        Row: { id: string; patient_id: string | null; doctor_id: string; appointment_date: string; appointment_time: string; status: string; reason: string | null; guest_name: string | null; guest_email: string | null; guest_phone: string | null; guest_city: string | null; guest_state: string | null; guest_country: string | null; appointment_number: string | null; medical_notes: string | null; created_at: string; patient_dob: string | null; patient_age: number | null; guest_address: string | null }
        Insert: { id?: string; patient_id?: string | null; doctor_id: string; appointment_date: string; appointment_time: string; status?: string; reason?: string | null; guest_name?: string | null; guest_email?: string | null; guest_phone?: string | null; guest_city?: string | null; guest_state?: string | null; guest_country?: string | null; appointment_number?: string | null; medical_notes?: string | null; created_at?: string; patient_dob?: string | null; patient_age?: number | null; guest_address?: string | null }
        Update: { id?: string; patient_id?: string | null; doctor_id?: string; appointment_date?: string; appointment_time?: string; status?: string; reason?: string | null; guest_name?: string | null; guest_email?: string | null; guest_phone?: string | null; guest_city?: string | null; guest_state?: string | null; guest_country?: string | null; appointment_number?: string | null; medical_notes?: string | null; created_at?: string; patient_dob?: string | null; patient_age?: number | null; guest_address?: string | null }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      doctor_leaves: {
        Row: { id: string; doctor_id: string; start_date: string; end_date: string; reason: string | null; created_at: string }
        Insert: { id?: string; doctor_id: string; start_date: string; end_date: string; reason?: string | null; created_at?: string }
        Update: { id?: string; doctor_id?: string; start_date?: string; end_date?: string; reason?: string | null; created_at?: string }
        Relationships: [
          {
            foreignKeyName: "doctor_leaves_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
  }
}
