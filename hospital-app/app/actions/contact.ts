'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address"),
  message: z.string().min(5, "Message must be at least 5 characters long").max(5000),
})

export async function submitContactForm(formData: FormData) {
  const parsed = contactSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    message: formData.get('message'),
  })

  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map(i => i.message).join(', ')
    return { error: errorMsg }
  }

  const { firstName, lastName, email, message } = parsed.data
  const supabaseAdmin = createAdminClient()

  const { error } = await supabaseAdmin
    .from('contact_messages')
    .insert({
      first_name: firstName,
      last_name: lastName,
      email,
      message,
      is_read: false,
    })

  if (error) {
    console.error("Failed to insert contact message:", error)
    return { error: "Failed to send message. Please try again later." }
  }

  return { success: true }
}

export async function getContactMessages() {
  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Failed to fetch contact messages:", error)
    return { error: "Failed to fetch messages" }
  }

  return { success: true, data }
}

export async function markMessageAsRead(id: string) {
  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin
    .from('contact_messages')
    .update({ is_read: true })
    .eq('id', id)

  if (error) {
    console.error("Failed to mark message as read:", error)
    return { error: "Failed to mark message as read" }
  }

  return { success: true }
}
