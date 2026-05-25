import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Apply stringent security settings (7 days expiry for auth, Strict SameSite)
              const strictOptions = {
                ...options,
                maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
                sameSite: 'strict' as const,
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true, // Prevents XSS accessing auth cookies
              }
              cookieStore.set(name, value, strictOptions)
            })
          } catch {}
        },
      },
    }
  )

  return client
}
