import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  // Security check: Only allow this in local development!
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 })
  }
  
  const supabase = await createClient()
  const adminClient = createAdminClient()
  
  const email = 'dev-admin@hospital.local'
  const password = 'DevPassword123!'

  // Ensure dev-admin exists
  const { data: { users } } = await adminClient.auth.admin.listUsers()
  const existingUser = users.find(u => u.email === email)

  if (!existingUser) {
    const { data: authData } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    
    if (authData.user) {
      await adminClient.from('users').upsert({ id: authData.user.id, role: 'admin' })
      await adminClient.from('profiles').upsert({ id: authData.user.id, first_name: 'Dev', last_name: 'Admin' })
    }
  } else {
    // Enforce admin role on this account just in case
    await adminClient.from('users').upsert({ id: existingUser.id, role: 'admin' })
  }
  
  // Actually sign in to write the cookies to the browser
  await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  return NextResponse.redirect(new URL('/admin', request.url))
}
