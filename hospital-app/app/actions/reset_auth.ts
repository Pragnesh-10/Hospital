import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function resetPassword(formData: FormData) {
  'use server'
  const email = formData.get('email') as string
  if (!email) redirect('/forgot-password?message=Email is required')

  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/update-password`,
  })

  if (error) {
    redirect(`/forgot-password?message=${error.message}`)
  }

  redirect('/forgot-password?success=Check your email for the password reset link.')
}

export async function updatePassword(formData: FormData) {
  'use server'
  const password = formData.get('password') as string
  if (!password) redirect('/update-password?message=Password is required')

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    redirect(`/update-password?message=${error.message}`)
  }

  redirect('/login?message=Password updated successfully. Please log in.')
}


