'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const facilitySchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(5, "Description must be at least 5 characters").max(1000),
  iconName: z.string().min(1, "Icon name is required"),
})

async function checkAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()
  const { data: userData } = await adminClient.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') return null
  
  return user.id
}

export async function createFacility(formData: FormData) {
  const supabase = await createClient()
  const adminId = await checkAdmin(supabase)
  if (!adminId) return { error: "Unauthorized" }

  const parsed = facilitySchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    iconName: formData.get('iconName'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { title, description, iconName } = parsed.data
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('facilities')
    .insert({
      title,
      description,
      icon_name: iconName,
    })
    .select()
    .single()

  if (error) {
    console.error("Failed to create facility:", error)
    return { error: error.message }
  }

  revalidatePath('/facilities')
  revalidatePath('/admin/facilities')
  return { success: true, data }
}

export async function updateFacility(facilityId: string, formData: FormData) {
  const supabase = await createClient()
  const adminId = await checkAdmin(supabase)
  if (!adminId) return { error: "Unauthorized" }

  const parsed = facilitySchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    iconName: formData.get('iconName'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { title, description, iconName } = parsed.data
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('facilities')
    .update({
      title,
      description,
      icon_name: iconName,
    })
    .eq('id', facilityId)

  if (error) {
    console.error("Failed to update facility:", error)
    return { error: error.message }
  }

  revalidatePath('/facilities')
  revalidatePath('/admin/facilities')
  return { success: true }
}

export async function deleteFacility(facilityId: string) {
  const supabase = await createClient()
  const adminId = await checkAdmin(supabase)
  if (!adminId) return { error: "Unauthorized" }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('facilities')
    .delete()
    .eq('id', facilityId)

  if (error) {
    console.error("Failed to delete facility:", error)
    return { error: error.message }
  }

  revalidatePath('/facilities')
  revalidatePath('/admin/facilities')
  return { success: true }
}
