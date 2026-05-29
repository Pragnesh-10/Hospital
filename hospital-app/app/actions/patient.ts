'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function cancelAppointment(appointmentId: string) {
  const supabase = await createClient()

  // 1. Verify user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // 2. Fetch appointment to verify ownership and date
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('patient_id, appointment_date, status')
    .eq('id', appointmentId)
    .single()

  if (fetchError || !appointment) {
    return { error: "Appointment not found" }
  }

  if (appointment.patient_id !== user.id) {
    return { error: "Not authorized to cancel this appointment" }
  }

  if (appointment.status === 'cancelled') {
    return { error: "Appointment is already cancelled" }
  }

  // 3. Verify date is in the future
  const apptDate = new Date(appointment.appointment_date)
  const today = new Date()
  today.setHours(0,0,0,0)
  apptDate.setHours(0,0,0,0)

  if (apptDate < today) {
    return { error: "Cannot cancel a past appointment" }
  }

  // 4. Update status to 'cancelled'
  const { error: updateError } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId)

  if (updateError) {
    console.error("Failed to cancel appointment:", updateError)
    return { error: "Failed to cancel appointment" }
  }

  revalidatePath('/patient', 'layout')
  return { success: true }
}
