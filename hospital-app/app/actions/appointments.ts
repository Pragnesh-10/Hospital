'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Define the schema for booking an appointment
const bookAppointmentSchema = z.object({
  doctor_id: z.string().uuid("Please select a valid doctor"),
  appointment_date: z.string(),
  appointment_time: z.string().min(1, "Please select a time slot"),
  reason: z.string().optional(),
  guest_name: z.string().optional(),
  guest_email: z.string().email("Invalid email").optional().or(z.literal("")),
  guest_phone: z.string().optional(),
})

export async function createAppointment(formData: FormData) {
  const supabase = await createClient()

  // Get user if logged in
  const { data: { user } } = await supabase.auth.getUser()

  // Validate the data
  const validatedFields = bookAppointmentSchema.safeParse({
    doctor_id: formData.get('doctor_id'),
    appointment_date: formData.get('appointment_date'),
    appointment_time: formData.get('appointment_time'),
    reason: formData.get('reason'),
    guest_name: formData.get('guest_name'),
    guest_email: formData.get('guest_email'),
    guest_phone: formData.get('guest_phone'),
  })

  // Return early if the form data is invalid
  if (!validatedFields.success) {
    return {
      error: "Invalid form data. Please check your inputs.",
    }
  }

  const { doctor_id, appointment_date, appointment_time, reason, guest_name, guest_email, guest_phone } = validatedFields.data

  // Basic check: if not logged in, guest name and phone are required
  if (!user && (!guest_name || !guest_phone)) {
    return {
      error: "Guest name and phone number are required for booking.",
    }
  }

  // Construct the full appointment datetime
  const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}:00`)

  // Check if the doctor is on leave for the requested date/time
  const { data: leaves } = await supabase
    .from('doctor_leaves')
    .select('*')
    .eq('doctor_id', doctor_id)

  if (leaves && leaves.length > 0) {
    const isOverlapping = leaves.some(leave => {
      const start = new Date(leave.start_date)
      const end = new Date(leave.end_date)
      return appointmentDateTime >= start && appointmentDateTime < end
    })

    if (isOverlapping) {
      return {
        error: "This doctor is on leave during the selected time.",
      }
    }
  }

  // Prevent Double Booking: Check if the doctor already has an appointment at this exact date and time
  const { data: existingAppointments } = await supabase
    .from('appointments')
    .select('id')
    .eq('doctor_id', doctor_id)
    .eq('appointment_date', appointment_date)
    .eq('appointment_time', appointment_time)
    .neq('status', 'cancelled') // Ignore cancelled appointments

  if (existingAppointments && existingAppointments.length > 0) {
    return {
      error: "This time slot is already booked. Please choose a different time.",
    }
  }

  // Insert into database
  const { error } = await supabase
    .from('appointments')
    .insert({
      patient_id: user ? user.id : null,
      doctor_id,
      appointment_date,
      appointment_time,
      reason,
      guest_name,
      guest_email,
      guest_phone,
      status: 'pending'
    })

  if (error) {
    console.error("Booking Error:", error)
    return {
      error: "Failed to book appointment. Please try again later.",
    }
  }

  if (user) {
    revalidatePath('/patient', 'layout')
    redirect('/patient?success=Appointment+booked+successfully')
  } else {
    // If guest, redirect back to doctors page with success message
    redirect('/doctors?success=Appointment+booked+successfully')
  }
}
