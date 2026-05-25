'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addDoctorLeave(startDate: string, endDate: string, reason?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // Verify they are a doctor
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'doctor') return { error: 'Only doctors can add leaves.' }

  // Validate dates
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (start > end) {
    return { error: 'Start date cannot be after end date.' }
  }

  const { error } = await supabase
    .from('doctor_leaves')
    .insert({
      doctor_id: user.id,
      start_date: startDate,
      end_date: endDate,
      reason: reason || null
    })

  if (error) {
    console.error("Error adding leave:", error)
    return { error: 'Failed to schedule leave.' }
  }

  revalidatePath('/doctor')
  revalidatePath('/book')
  
  return { success: true }
}

export async function deleteDoctorLeave(leaveId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('doctor_leaves')
    .delete()
    .eq('id', leaveId)
    .eq('doctor_id', user.id) // Ensure they can only delete their own leaves

  if (error) {
    console.error("Error deleting leave:", error)
    return { error: 'Failed to cancel leave.' }
  }

  revalidatePath('/doctor')
  revalidatePath('/book')
  
  return { success: true }
}
