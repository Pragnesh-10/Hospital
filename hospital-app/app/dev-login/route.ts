import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  // Security check: Only allow this in local development!
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 })
  }
  
  const supabase = await createClient()
  
  // Actually sign in to write the cookies to the browser
  await supabase.auth.signInWithPassword({
    email: 'dev-admin@hospital.local',
    password: 'DevPassword123!'
  })
  
  return NextResponse.redirect(new URL('/admin', request.url))
}
