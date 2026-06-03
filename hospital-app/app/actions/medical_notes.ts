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
    .select('doctor_id, appointment_date, appointment_time, status')
    .eq('id', appointmentId)
    .single()

  if (fetchError || appointment?.doctor_id !== user.id) {
    return { error: "Not authorized to modify this appointment" }
  }

  // Helper to parse dates with IST offset (+05:30) to prevent client/server timezone offsets
  function parseNaive(dateStr: string): Date {
    const match = dateStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?/)
    const clean = match ? match[0] : dateStr
    return new Date(`${clean}+05:30`)
  }

  // Construct wall-clock date-time comparison in IST
  const now = new Date()
  const apptTime = parseNaive(`${appointment.appointment_date}T${appointment.appointment_time}`)
  const isPast = now >= apptTime

  const updatePayload: { medical_notes: string; status?: string } = { medical_notes: notes }
  if (isPast && (appointment.status === 'pending' || appointment.status === 'in_progress')) {
    updatePayload.status = 'completed'
  }

  // 3. Update notes
  const { error: updateError } = await supabase
    .from('appointments')
    .update(updatePayload)
    .eq('id', appointmentId)

  if (updateError) {
    console.error("Failed to save notes:", updateError)
    return { error: "Failed to save medical notes" }
  }

  revalidatePath('/doctor', 'layout')
  revalidatePath('/staff', 'layout')
  revalidatePath('/patient', 'layout')
  return { success: true }
}
