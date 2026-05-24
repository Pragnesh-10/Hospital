'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, use a validation library like Zod
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    redirect(`/login?message=Could not authenticate user`)
  }

  // Fetch their actual role from the database
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single()

  const actualRole = userData?.role || 'patient'

  // If they tried to log in using the wrong tab, reject them.
  if (actualRole !== role) {
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

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string

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
