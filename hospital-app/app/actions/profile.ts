'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(20),
})

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  // 1. Verify user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const parsed = profileSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    phone: formData.get('phone'),
  })

  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map(i => i.message).join(', ')
    return { error: errorMsg }
  }

  const { firstName, lastName, phone } = parsed.data

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
      phone,
    })
    .eq('id', user.id)

  if (error) {
    console.error("Failed to update profile:", error)
    return { error: "Failed to update profile. Please try again." }
  }

  revalidatePath('/patient/profile')
  revalidatePath('/patient', 'layout')
  return { success: true }
}
