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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  // --- LOCALHOST GOD MODE BYPASS ---
  if (process.env.NODE_ENV === 'development') {
    // 1. Create a service role client to bypass RLS
    const { createAdminClient } = await import('./admin')
    const adminClient = createAdminClient()
    
    // 2. Find the first real admin user in the database to impersonate
    const { data: adminUsers } = await adminClient.from('users').select('*').eq('role', 'admin').limit(1)
    
    if (adminUsers && adminUsers.length > 0) {
      const realAdmin = adminUsers[0]
      // 3. Override getUser to return this real admin
      adminClient.auth.getUser = async () => ({
        data: { user: { id: realAdmin.id, email: 'local-admin@hospital.com' } },
        error: null
      } as any)
      
      return adminClient // Return the God Mode client
    }
  }

  return client
}
