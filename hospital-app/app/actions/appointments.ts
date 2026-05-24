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
})

export async function createAppointment(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Validate the data
  const validatedFields = bookAppointmentSchema.safeParse({
    doctor_id: formData.get('doctor_id'),
    appointment_date: formData.get('appointment_date'),
    appointment_time: formData.get('appointment_time'),
    reason: formData.get('reason'),
  })

  // Return early if the form data is invalid
  if (!validatedFields.success) {
    return {
      error: "Invalid form data. Please check your inputs.",
    }
  }

  const { doctor_id, appointment_date, appointment_time, reason } = validatedFields.data

  // Insert into database
  const { error } = await supabase
    .from('appointments')
    .insert({
      patient_id: user.id,
      doctor_id,
      appointment_date,
      appointment_time,
      reason,
      status: 'pending'
    })

  if (error) {
    console.error("Booking Error:", error)
    return {
      error: "Failed to book appointment. Please try again later.",
    }
  }

  revalidatePath('/patient', 'layout')
  redirect('/patient?success=Appointment+booked+successfully')
}
