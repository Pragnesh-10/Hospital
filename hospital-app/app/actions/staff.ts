'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateAppointmentStatus(id: string, status: string) {
  const supabase = await createClient()

  // Ensure user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Update the appointment
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)

  if (error) {
    console.error("Failed to update status:", error)
    return { error: 'Failed to update appointment status' }
  }

  revalidatePath('/staff', 'layout')
  return { success: true }
}

export async function rescheduleAppointment(id: string, newDate: string, newTime: string) {
  const supabase = await createClient()

  // Ensure user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Update the appointment
  const { error } = await supabase
    .from('appointments')
    .update({ 
      appointment_date: newDate,
      appointment_time: newTime,
      status: 'rescheduled' // Usually changes back to pending or marked as rescheduled
    })
    .eq('id', id)

  if (error) {
    console.error("Failed to reschedule:", error)
    return { error: 'Failed to reschedule appointment' }
  }

  revalidatePath('/staff', 'layout')
  return { success: true }
}
