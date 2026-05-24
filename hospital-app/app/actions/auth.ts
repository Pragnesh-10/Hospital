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

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    redirect('/login?message=Could not authenticate user')
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
