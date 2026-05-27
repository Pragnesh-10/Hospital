'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addDoctorAction(formData: FormData) {
  const supabase = await createClient()

  // 1. Verify user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  // 2. Verify admin status using the Admin Client to bypass RLS
  const { createAdminClient } = await import('@/lib/supabase/admin');
  const adminClient = createAdminClient();
  
  const { data: userData } = await adminClient.from('users').select('role').eq('id', user.id).single();
  if (userData?.role !== 'admin') return { error: 'Unauthorized' }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const specialization = formData.get('specialization') as string
  const experienceStr = formData.get('experience') as string
  const experience = parseInt(experienceStr, 10) || 0

  if (!email || !password || !firstName || !lastName || !specialization) {
    return { error: 'All fields are required.' }
  }

  // 3. Create Auth User
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName
    }
  })

  if (authError || !authData.user) {
    return { error: authError?.message || 'Failed to create user.' }
  }

  const newUserId = authData.user.id

  // 4. Update the user role to doctor (Upsert in case trigger failed/delayed)
  const { error: usersError } = await adminClient.from('users').upsert({ id: newUserId, role: 'doctor' })
  if (usersError) return { error: `Users table error: ${usersError.message}` }

  // 5. Upsert profile information
  const { error: profilesError } = await adminClient.from('profiles').upsert({
    id: newUserId,
    first_name: firstName,
    last_name: lastName
  })
  if (profilesError) return { error: `Profiles table error: ${profilesError.message}` }

  // 6. Insert doctor record
  const { error: doctorError } = await adminClient.from('doctors').upsert({
    id: newUserId,
    specialization,
    experience_years: experience,
    is_active: true
  })

  if (doctorError) {
    return { error: `Doctors table error: ${doctorError.message}` }
  }

  revalidatePath('/admin/doctors')
  revalidatePath('/doctors')
  revalidatePath('/book')
  
  return { success: true }
}
