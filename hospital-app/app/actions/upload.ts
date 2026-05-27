'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadFacilityImage(formData: FormData) {
  const supabase = await createClient()

  // 1. Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { createAdminClient } = await import('@/lib/supabase/admin');
  const adminClient = createAdminClient();
  const { data: userRole } = await adminClient.from('users').select('role').eq('id', user.id).single();
  if (userRole?.role !== 'admin') return { error: "Not authorized. Admin only." }

  // 2. Get file and facility ID
  const file = formData.get('image') as File
  const facilityId = formData.get('facility_id') as string

  if (!file || !facilityId) {
    return { error: "File and Facility ID are required" }
  }
  
  try {

    // Ensure bucket exists
    const { data: buckets } = await adminClient.storage.listBuckets()
    if (!buckets?.find(b => b.name === 'hospital-images')) {
      await adminClient.storage.createBucket('hospital-images', { public: true })
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${facilityId}-${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    // 3. Upload to Supabase Storage (bypassing RLS)
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('hospital-images')
      .upload(filePath, file)

    if (uploadError) {
      console.error("Storage Error:", uploadError)
      return { error: uploadError.message }
    }

    // 4. Get Public URL
    const { data: { publicUrl } } = adminClient.storage
      .from('hospital-images')
      .getPublicUrl(filePath)

    // 5. Update Facilities table
    const { error: dbError } = await adminClient
      .from('facilities')
      .update({ image_url: publicUrl })
      .eq('id', facilityId)

    if (dbError) {
      return { error: "Failed to update facility record" }
    }

    revalidatePath('/admin', 'layout')
    revalidatePath('/facilities')
    return { success: true, url: publicUrl }

  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred" }
  }
}

export async function uploadDoctorImage(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { createAdminClient } = await import('@/lib/supabase/admin');
  const adminClient = createAdminClient();
  const { data: userRole } = await adminClient.from('users').select('role').eq('id', user.id).single();
  if (userRole?.role !== 'admin') return { error: "Not authorized. Admin only." }

  const file = formData.get('image') as File
  const doctorId = formData.get('doctor_id') as string

  if (!file || !doctorId) {
    return { error: "File and Doctor ID are required" }
  }
  
  try {

    // 1. Ensure bucket exists
    const { data: buckets } = await adminClient.storage.listBuckets()
    if (!buckets?.find(b => b.name === 'hospital-images')) {
      await adminClient.storage.createBucket('hospital-images', { public: true })
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `doctor-${doctorId}-${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    // 2. Upload using Admin Client (Bypasses Storage RLS)
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('hospital-images')
      .upload(filePath, file)

    if (uploadError) return { error: uploadError.message }

    const { data: { publicUrl } } = adminClient.storage
      .from('hospital-images')
      .getPublicUrl(filePath)

    // 3. Update Database using Admin Client
    const { error: dbError } = await adminClient
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', doctorId)

    if (dbError) return { error: "Failed to update profile record" }

    revalidatePath('/admin', 'layout')
    revalidatePath('/doctors')
    return { success: true, url: publicUrl }

  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred" }
  }
}

export async function uploadHospitalHeroImage(formData: FormData) {
  const supabase = await createClient()

  // 1. Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { createAdminClient } = await import('@/lib/supabase/admin');
  const adminClient = createAdminClient();
  const { data: userRole } = await adminClient.from('users').select('role').eq('id', user.id).single();
  if (userRole?.role !== 'admin') return { error: "Not authorized. Admin only." }

  // 2. Get file
  const file = formData.get('image') as File
  if (!file || file.size === 0) {
    return { error: "File is required" }
  }
  
  try {
    // Ensure bucket exists
    const { data: buckets } = await adminClient.storage.listBuckets()
    if (!buckets?.find(b => b.name === 'hospital-images')) {
      await adminClient.storage.createBucket('hospital-images', { public: true })
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `hero-hospital-${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    // 3. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('hospital-images')
      .upload(filePath, file)

    if (uploadError) {
      console.error("Storage Error:", uploadError)
      return { error: uploadError.message }
    }

    // 4. Get Public URL
    const { data: { publicUrl } } = adminClient.storage
      .from('hospital-images')
      .getPublicUrl(filePath)

    // 5. Update system_settings table (saving JSONB string)
    const { error: dbError } = await adminClient
      .from('system_settings')
      .upsert({ key: 'hospital_hero_image', value: JSON.stringify(publicUrl) })

    if (dbError) {
      console.error("Database Error:", dbError)
      return { error: "Failed to update hospital photo setting" }
    }

    revalidatePath('/admin/settings')
    revalidatePath('/')
    return { success: true, url: publicUrl }

  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred" }
  }
}

export async function uploadServiceImage(formData: FormData) {
  const supabase = await createClient()

  // 1. Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { createAdminClient } = await import('@/lib/supabase/admin');
  const adminClient = createAdminClient();
  const { data: userRole } = await adminClient.from('users').select('role').eq('id', user.id).single();
  if (userRole?.role !== 'admin') return { error: "Not authorized. Admin only." }

  // 2. Get file and service key
  const file = formData.get('image') as File
  const serviceKey = formData.get('service_key') as string

  if (!file || file.size === 0 || !serviceKey) {
    return { error: "File and Service Key are required" }
  }

  const validKeys = ['service_emergency', 'service_opd', 'service_diagnostics', 'service_pharmacy']
  if (!validKeys.includes(serviceKey)) {
    return { error: "Invalid Service Key" }
  }
  
  try {
    // Ensure bucket exists
    const { data: buckets } = await adminClient.storage.listBuckets()
    if (!buckets?.find(b => b.name === 'hospital-images')) {
      await adminClient.storage.createBucket('hospital-images', { public: true })
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `service-${serviceKey}-${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    // 3. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('hospital-images')
      .upload(filePath, file)

    if (uploadError) {
      console.error("Storage Error:", uploadError)
      return { error: uploadError.message }
    }

    // 4. Get Public URL
    const { data: { publicUrl } } = adminClient.storage
      .from('hospital-images')
      .getPublicUrl(filePath)

    // 5. Update system_settings table (saving JSONB string)
    const { error: dbError } = await adminClient
      .from('system_settings')
      .upsert({ key: serviceKey, value: JSON.stringify(publicUrl) })

    if (dbError) {
      console.error("Database Error:", dbError)
      return { error: "Failed to update service photo setting" }
    }

    revalidatePath('/admin/settings')
    revalidatePath('/services')
    return { success: true, url: publicUrl }

  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred" }
  }
}

