'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function provisionAccount(formData: FormData) {
  const supabase = await createClient()

  // 1. Verify caller is actually an admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') return { error: 'Unauthorized: Admins only' }

  // 2. Extract form data
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const role = formData.get('role') as string
  const specialization = formData.get('specialization') as string

  if (!email || !password || !firstName || !lastName || !role) {
    return { error: 'All base fields are required.' }
  }

  if (role === 'doctor' && !specialization) {
    return { error: 'Specialization is required for doctors.' }
  }

  try {
    // 3. Use Admin Client to create user (bypasses RLS and prevents logout)
    const adminAuthClient = createAdminClient()
    
    const { data: newUser, error: createError } = await adminAuthClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto confirm so they can log in immediately
      user_metadata: {
        first_name: firstName,
        last_name: lastName
      }
    })

    if (createError) throw new Error(`Auth Error: ${createError.message}`)
    if (!newUser.user) throw new Error('Failed to create user object.')

    const newUserId = newUser.user.id

    // 4. Set their role in the users table
    const { error: roleError } = await adminAuthClient
      .from('users')
      .update({ role: role })
      .eq('id', newUserId)

    if (roleError) throw new Error(`Role Error: ${roleError.message}`)

    // 5. Create their profile
    const { error: profileError } = await adminAuthClient
      .from('profiles')
      .insert({
        id: newUserId,
        first_name: firstName,
        last_name: lastName
      })

    if (profileError) throw new Error(`Profile Error: ${profileError.message}`)

    // 6. If doctor, create their doctor record
    if (role === 'doctor') {
      const { error: docError } = await adminAuthClient
        .from('doctors')
        .insert({
          id: newUserId,
          specialization,
          is_active: true
        })
      if (docError) throw new Error(`Doctor DB Error: ${docError.message}`)
    }

    revalidatePath('/admin/users')
    revalidatePath('/admin/doctors')
    return { success: true }

  } catch (err: any) {
    console.error("Provisioning error:", err)
    return { error: err.message || 'An unknown error occurred during provisioning.' }
  }
}
