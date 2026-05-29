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

  if (userData?.role?.toLowerCase() !== 'doctor') {
    return { error: `Only doctors can add leaves. (Role: ${userData?.role})` }
  }

  // Helper to parse dates explicitly in IST (+05:30)
  const parseIST = (dateStr: string) => {
    const match = dateStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?/)
    const clean = match ? match[0] : dateStr
    if (!clean.includes('+') && !clean.includes('Z') && !clean.endsWith('Z')) {
      return new Date(`${clean}+05:30`)
    }
    return new Date(clean)
  }

  // Validate dates
  const start = parseIST(startDate)
  const end = parseIST(endDate)
  
  if (start >= end) {
    return { error: 'Start time must be before end time.' }
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
