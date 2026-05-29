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

  // Verify staff or admin role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'staff' && userData?.role !== 'admin') {
    return { error: 'Unauthorized: Staff or Admin privileges required' }
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
  revalidatePath('/doctor', 'layout')
  revalidatePath('/patient', 'layout')
  return { success: true }
}

export async function rescheduleAppointment(id: string, newDate: string, newTime: string) {
  const supabase = await createClient()

  // Ensure user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Verify staff or admin role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'staff' && userData?.role !== 'admin') {
    return { error: 'Unauthorized: Staff or Admin privileges required' }
  }

  // Fetch appointment to get doctor_id
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('doctor_id')
    .eq('id', id)
    .single()

  if (fetchError || !appointment) {
    return { error: 'Appointment not found' }
  }

  const doctor_id = appointment.doctor_id

  // Helper to parse dates explicitly in IST (+05:30) to prevent client/server timezone offsets
  function parseNaive(dateStr: string): Date {
    const match = dateStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?/)
    const clean = match ? match[0] : dateStr
    if (!clean.includes('+') && !clean.includes('Z') && !clean.endsWith('Z')) {
      return new Date(`${clean}+05:30`)
    }
    return new Date(clean)
  }

  const appointmentDateTime = parseNaive(`${newDate}T${newTime}`)

  // Check doctor leaves
  const { data: leaves } = await supabase
    .from('doctor_leaves')
    .select('*')
    .eq('doctor_id', doctor_id)

  if (leaves && leaves.length > 0) {
    const isOverlapping = leaves.some(leave => {
      const start = parseNaive(leave.start_date)
      const end = parseNaive(leave.end_date)
      return appointmentDateTime >= start && appointmentDateTime < end
    })

    if (isOverlapping) {
      return { error: 'This doctor is on leave during the selected time.' }
    }
  }

  // Prevent Double Booking (excluding this appointment itself)
  const { data: existingAppointments } = await supabase
    .from('appointments')
    .select('id')
    .eq('doctor_id', doctor_id)
    .eq('appointment_date', newDate)
    .eq('appointment_time', newTime)
    .neq('id', id)
    .neq('status', 'cancelled')

  if (existingAppointments && existingAppointments.length > 0) {
    return { error: 'This time slot is already booked. Please choose a different time.' }
  }

  // Update the appointment
  const { error } = await supabase
    .from('appointments')
    .update({ 
      appointment_date: newDate,
      appointment_time: newTime,
      status: 'rescheduled'
    })
    .eq('id', id)

  if (error) {
    console.error("Failed to reschedule:", error)
    return { error: 'Failed to reschedule appointment' }
  }

  revalidatePath('/staff', 'layout')
  revalidatePath('/doctor', 'layout')
  revalidatePath('/patient', 'layout')
  return { success: true }
}
