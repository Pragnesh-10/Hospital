'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

// Define the schema for booking an appointment
const bookAppointmentSchema = z.object({
  doctor_id: z.string().uuid("Please select a valid doctor"),
  appointment_date: z.string(),
  appointment_time: z.string().min(1, "Please select a time slot"),
  reason: z.string().optional(),
  patient_dob: z.string().optional().or(z.literal("")),
  patient_age: z.string().min(1, "Age is required"),
  guest_name: z.string().optional(),
  guest_email: z.string().email("Invalid email").optional().or(z.literal("")),
  guest_phone: z.string().optional(),
  guest_address: z.string().optional(),
  guest_city: z.string().optional(),
  guest_state: z.string().optional(),
  guest_country: z.string().optional(),
})

export async function createAppointment(formData: FormData) {
  const supabase = await createClient()

  // Get user if logged in
  const { data: { user } } = await supabase.auth.getUser()

  // Validate the data, mapping null to undefined to satisfy Zod's optional()
  const validatedFields = bookAppointmentSchema.safeParse({
    doctor_id: formData.get('doctor_id') ?? undefined,
    appointment_date: formData.get('appointment_date') ?? undefined,
    appointment_time: formData.get('appointment_time') ?? undefined,
    reason: formData.get('reason') ?? undefined,
    patient_dob: formData.get('patient_dob') ?? undefined,
    patient_age: formData.get('patient_age') ?? undefined,
    guest_name: formData.get('guest_name') ?? undefined,
    guest_email: formData.get('guest_email') ?? undefined,
    guest_phone: formData.get('guest_phone') ?? undefined,
    guest_address: formData.get('guest_address') ?? undefined,
    guest_city: formData.get('guest_city') ?? undefined,
    guest_state: formData.get('guest_state') ?? undefined,
    guest_country: formData.get('guest_country') ?? undefined,
  })

  // Return early if the form data is invalid
  if (!validatedFields.success) {
    console.error("Validation Error:", validatedFields.error.flatten().fieldErrors)
    return {
      error: "Invalid form data. Please check your inputs.",
      details: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { doctor_id, appointment_date, appointment_time, reason, patient_dob, patient_age, guest_name, guest_email, guest_phone, guest_address, guest_city, guest_state, guest_country } = validatedFields.data

  const is_walkin = formData.get('is_walkin') === 'true'

  // Basic check: if not logged in (and not a staff member booking a walk-in), guest info is required
  if (!user && (!guest_name || !guest_phone || !guest_address || !guest_city || !guest_state || !guest_country)) {
    return {
      error: "Guest name, phone number, address, and location details are required for booking.",
    }
  }
  
  if (is_walkin && (!guest_name || !guest_phone || !guest_address || !guest_city || !guest_state || !guest_country)) {
    return {
      error: "Guest name, phone number, address, and location details are required for walk-in booking.",
    }
  }

  // Helper to parse dates timezone-naively (wall-clock time) to prevent client/server timezone offsets
  function parseNaive(dateStr: string): Date {
    const match = dateStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?/)
    const clean = match ? match[0] : dateStr
    return new Date(clean)
  }

  // Construct the full appointment datetime
  const appointmentDateTime = parseNaive(`${appointment_date}T${appointment_time}`)

  const supabaseAdmin = createAdminClient()

  // Check if the doctor is on leave for the requested date/time
  const { data: leaves } = await supabaseAdmin
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
      return {
        error: "This doctor is on leave during the selected time.",
      }
    }
  }

  // Prevent Double Booking: Check if the doctor already has an appointment at this exact date and time
  const { data: existingAppointments } = await supabaseAdmin
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

  // Insert into database using admin client to bypass RLS select policies for unauthenticated guest sessions
  const { data: newAppt, error } = await supabaseAdmin
    .from('appointments')
    .insert({
      patient_id: (!is_walkin && user) ? user.id : null,
      doctor_id,
      appointment_date,
      appointment_time,
      reason,
      patient_dob: patient_dob || null,
      patient_age: parseInt(patient_age, 10),
      guest_name,
      guest_email,
      guest_phone,
      guest_address: guest_address || null,
      guest_city,
      guest_state,
      guest_country,
      status: 'pending'
    })
    .select(`
      id,
      appointment_number,
      appointment_date,
      appointment_time,
      guest_name,
      guest_phone,
      guest_address,
      guest_city,
      guest_state,
      guest_country,
      patient_id,
      patient_age,
      patient_dob,
      profiles (
        first_name,
        last_name
      ),
      doctors (
        specialization,
        profiles (
          first_name,
          last_name
        )
      )
    `)
    .single()

  if (error) {
    console.error("Booking Error:", error)
    return {
      error: "Failed to book appointment. Please try again later.",
    }
  }

  // Revalidate all dashboards so the new appointment appears immediately
  revalidatePath('/doctor', 'layout')
  revalidatePath('/staff', 'layout')
  revalidatePath('/patient', 'layout')

  return {
    success: true,
    appointment: newAppt,
  }
}
