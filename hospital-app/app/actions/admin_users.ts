'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAdminAction } from '@/app/actions/audit'

import { z } from 'zod'

const provisionSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters for security'),
  first_name: z.string().min(1, 'First name is required').max(50),
  last_name: z.string().min(1, 'Last name is required').max(50),
  role: z.enum(['doctor', 'staff']),
  specialization: z.string().max(100).optional(),
}).refine(data => {
  if (data.role === 'doctor' && !data.specialization) return false
  return true
}, { message: 'Specialization is required for doctors', path: ['specialization'] })

export async function provisionAccount(formData: FormData) {
  const supabase = await createClient()

  // 1. Verify caller is actually an admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { createAdminClient } = await import('@/lib/supabase/admin');
  const adminClient = createAdminClient();
  const { data: userData } = await adminClient.from('users').select('role').eq('id', user.id).single();
  if (userData?.role !== 'admin') return { error: 'Unauthorized: Admins only' }

  // 2. Strict Zod Validation
  const parsed = provisionSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }
  
  const { email, password, first_name: firstName, last_name: lastName, role, specialization } = parsed.data

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
      .upsert({ id: newUserId, role: role })

    if (roleError) throw new Error(`Role Error: ${roleError.message}`)

    // 5 & 6. Create their profile and doctor record concurrently (both only depend on users table FK)
    const profilePromise = adminAuthClient.from('profiles').upsert({
      id: newUserId,
      first_name: firstName,
      last_name: lastName
    })

    const doctorPromise = role === 'doctor' 
      ? adminAuthClient.from('doctors').upsert({
          id: newUserId,
          specialization: specialization || '',
          is_active: true
        })
      : Promise.resolve({ error: null })

    const [ { error: profileError }, { error: docError } ] = await Promise.all([
      profilePromise,
      doctorPromise
    ])

    if (profileError) throw new Error(`Profile Error: ${profileError.message}`)
    if (docError) throw new Error(`Doctor DB Error: ${docError.message}`)

    await logAdminAction(user.id, 'provision_account', 'users', newUserId, { email, role })

    revalidatePath('/admin/users')
    revalidatePath('/admin/doctors')
    return { success: true }

  } catch (err: any) {
    console.error("Provisioning error:", err)
    return { error: err.message || 'An unknown error occurred during provisioning.' }
  }
}
