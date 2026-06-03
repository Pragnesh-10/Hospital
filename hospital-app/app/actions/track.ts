'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { headers } from 'next/headers'

// Initialize Upstash Redis Ratelimiter
let ratelimit: Ratelimit | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  // Stricter Rate Limiter for public lookup: 10 requests per 10 minutes per IP
  ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, '10 m'),
    analytics: true,
  })
}

const trackSchema = z.object({
  query: z.string().min(5, "Please enter a valid phone number or token"),
})

export async function lookupAppointment(formData: FormData) {
  // Rate Limiting Protection
  if (ratelimit) {
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') ?? '127.0.0.1'
    const { success } = await ratelimit.limit(`track_${ip}`)
    
    if (!success) {
      return { error: 'Too many lookup attempts. Please try again in 10 minutes.' }
    }
  }

  const parsed = trackSchema.safeParse({
    query: formData.get('query'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const query = parsed.data.query.trim()
  
  // Sanitization for PostgREST security:
  // - appointment_number only allows alphanumeric and dash
  // - phone lookup only allows digits and plus
  const safeTokenQuery = query.replace(/[^a-zA-Z0-9\-]/g, '')
  const safePhoneQuery = query.replace(/[^0-9+]/g, '')
  const cleanQuery = query.replace(/\D/g, '')

  if (!safeTokenQuery && !safePhoneQuery) {
    return { error: 'No active appointments found for this information.' }
  }

  const supabaseAdmin = createAdminClient()

  // Construct secure .or conditions free of syntax delimiters like parentheses, commas, colons, or ampersands
  const orConditions: string[] = []
  if (safeTokenQuery) {
    orConditions.push(`appointment_number.eq.${safeTokenQuery}`)
  }
  if (safePhoneQuery) {
    orConditions.push(`guest_phone.eq.${safePhoneQuery}`)
  }
  if (cleanQuery && cleanQuery !== safePhoneQuery) {
    orConditions.push(`guest_phone.eq.${cleanQuery}`)
  }

  const orCondition = orConditions.join(',')

  const { data: initialAppointments, error } = await supabaseAdmin
    .from('appointments')
    .select(`
      id,
      status,
      appointment_date,
      appointment_time,
      appointment_number,
      guest_name,
      guest_phone,
      doctors (
        profiles (
          first_name,
          last_name
        ),
        specialization
      ),
      profiles!patient_id (
        first_name,
        last_name,
        phone
      )
    `)
    .or(orCondition)
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: false })
    .limit(1)

  let appointments = initialAppointments

  // If no guest/token match, try matching by registered patient phone
  if (!appointments || appointments.length === 0) {
    let patientProfile = null
    const { data: exactProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('phone', query)
      .maybeSingle()

    if (exactProfile) {
      patientProfile = exactProfile
    } else if (cleanQuery && cleanQuery.length >= 5) {
      const { data: cleanProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('phone', cleanQuery)
        .maybeSingle()
      if (cleanProfile) {
        patientProfile = cleanProfile
      }
    }

    if (patientProfile) {
      const { data: patientAppointments } = await supabaseAdmin
        .from('appointments')
        .select(`
          id,
          status,
          appointment_date,
          appointment_time,
          appointment_number,
          guest_name,
          guest_phone,
          doctors (
            profiles (
              first_name,
              last_name
            ),
            specialization
          ),
          profiles!patient_id (
            first_name,
            last_name,
            phone
          )
        `)
        .eq('patient_id', patientProfile.id)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false })
        .limit(1)
        
      if (patientAppointments && patientAppointments.length > 0) {
        appointments = patientAppointments
      }
    }
  }

  if (error || !appointments || appointments.length === 0) {
    return { error: 'No active appointments found for this information.' }
  }

  const appt = appointments[0]
  const patientName = appt.profiles 
    ? `${appt.profiles.first_name} ${appt.profiles.last_name}` 
    : appt.guest_name || 'Guest'

  const doctorName = appt.doctors?.profiles
    ? `Dr. ${appt.doctors.profiles.first_name}`
    : 'Unknown Doctor'

  return {
    success: true,
    data: {
      patientName,
      doctorName,
      date: appt.appointment_date,
      time: appt.appointment_time,
      status: appt.status,
      token: appt.appointment_number,
    }
  }
}
