'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveMedicalNotes(formData: FormData) {
  const supabase = await createClient()

  // 1. Verify doctor
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const appointmentId = formData.get('appointment_id') as string
  const notes = formData.get('medical_notes') as string

  if (!appointmentId) return { error: "Appointment ID required" }

  // 2. Verify doctor owns this appointment
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('doctor_id')
    .eq('id', appointmentId)
    .single()

  if (fetchError || appointment?.doctor_id !== user.id) {
    return { error: "Not authorized to modify this appointment" }
  }

  // 3. Update notes
  const { error: updateError } = await supabase
    .from('appointments')
    .update({ medical_notes: notes, status: 'completed' })
    .eq('id', appointmentId)

  if (updateError) {
    console.error("Failed to save notes:", updateError)
    return { error: "Failed to save medical notes" }
  }

  revalidatePath('/doctor')
  return { success: true }
}
