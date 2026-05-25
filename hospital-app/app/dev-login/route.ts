import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  // Security check: Only allow this in local development!
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 })
  }
  
  const supabase = await createClient()
  
  // Ensure the dev admin exists and is confirmed
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()
  
  const email = 'dev-admin@hospital.local'
  const password = 'DevPassword123!'

  const { data: users } = await adminClient.auth.admin.listUsers()
  const devAdmin = users.users.find(u => u.email === email)

  if (!devAdmin) {
    const { data: newUser } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: 'Dev', last_name: 'Admin' }
    })
    if (newUser.user) {
      await adminClient.from('users').upsert({ id: newUser.user.id, role: 'admin' })
    }
  } else if (!devAdmin.email_confirmed_at) {
    // If they exist but aren't confirmed, force update them
    await adminClient.auth.admin.updateUserById(devAdmin.id, { email_confirm: true })
  }
  
  // Actually sign in to write the cookies to the browser
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error("DEV LOGIN ERROR:", error.message)
    return new Response(`Dev Login Failed: ${error.message}`, { status: 500 })
  }
  
  return NextResponse.redirect(new URL('/admin', request.url))
}
