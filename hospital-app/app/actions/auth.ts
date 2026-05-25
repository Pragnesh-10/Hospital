'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['admin', 'doctor', 'staff', 'patient'])
})

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50)
})

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Strict Zod Validation
  const parsed = loginSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    redirect(`/login?message=Invalid input data`)
  }
  const { email, password, role } = parsed.data

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    redirect(`/login?message=Could not authenticate user`)
  }

  // Fetch their actual role from the database using adminClient to bypass RLS issues
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()
  const { data: userData, error: userError } = await adminClient
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single()

  const actualRole = userData?.role || 'patient'
  
  console.log("LOGIN ATTEMPT:", { email, expectedRole: role, fetchedRole: userData?.role, actualRole, userId: data.user.id, userError })

  // If they tried to log in using the wrong tab, reject them (unless they are admin)
  if (actualRole !== role && actualRole !== 'admin') {
    await supabase.auth.signOut()
    redirect(`/login?message=Unauthorized. You do not have ${role} privileges.`)
  }

  revalidatePath('/', 'layout')
  
  // Redirect based on actual role
  if (actualRole === 'admin') redirect('/admin')
  if (actualRole === 'doctor') redirect('/doctor')
  if (actualRole === 'staff') redirect('/staff')
  redirect('/patient')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // Strict Zod Validation
  const parsed = signupSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    redirect(`/login?message=Invalid input data`)
  }
  const { email, password, firstName, lastName } = parsed.data

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      }
    }
  })

  if (error) {
    redirect(`/login?message=${error.message}`)
  }

  // If auto-login is successful (email confirmation disabled in Supabase)
  // we can insert the profile. If email confirmation is enabled, 
  // the user needs to confirm email before RLS allows them to insert into profiles.
  if (data.user && data.session) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      first_name: firstName,
      last_name: lastName,
    })
  }

  revalidatePath('/', 'layout')
  redirect('/patient')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/')
}
