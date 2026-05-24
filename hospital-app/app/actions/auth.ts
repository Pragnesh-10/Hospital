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

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(`/login?message=Could not authenticate user`)
  }

  revalidatePath('/', 'layout')
  
  // Redirect based on role
  if (role === 'admin') redirect('/admin')
  if (role === 'doctor') redirect('/doctor')
  if (role === 'staff') redirect('/staff')
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
