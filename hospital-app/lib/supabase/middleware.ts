import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Apply stringent security settings (7 days expiry for auth, Strict SameSite)
            const strictOptions = {
              ...options,
              maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
              sameSite: 'strict' as const,
              secure: process.env.NODE_ENV === 'production',
              httpOnly: true, // Prevents XSS accessing auth cookies
            }
            request.cookies.set(name, value)
          })
          
          supabaseResponse = NextResponse.next({
            request,
          })
          
          cookiesToSet.forEach(({ name, value, options }) => {
            const strictOptions = {
              ...options,
              maxAge: 7 * 24 * 60 * 60,
              sameSite: 'strict' as const,
              secure: process.env.NODE_ENV === 'production',
              httpOnly: true,
            }
            supabaseResponse.cookies.set(name, value, strictOptions)
          })
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // DEV MODE ADMIN BYPASS
  if (process.env.NODE_ENV === 'development' && request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/dev-login'
      return NextResponse.redirect(url)
    }
  }

  // Protected routes require authentication
  const protectedPrefixes = ['/admin', '/doctor', '/patient', '/staff']
  const isProtectedRoute = protectedPrefixes.some(prefix => 
    request.nextUrl.pathname === prefix || request.nextUrl.pathname.startsWith(`${prefix}/`)
  )

  if (!user && isProtectedRoute) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
