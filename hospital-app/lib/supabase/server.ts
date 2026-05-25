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
    
    // 2. Find a real admin user in the database to impersonate
    let { data: adminUsers } = await adminClient.from('users').select('*').eq('role', 'admin').limit(1)
    
    // If no admin exists at all, let's create a dummy one so the dashboard works
    if (!adminUsers || adminUsers.length === 0) {
      let adminId = null;
      
      const { data: authData, error: authErr } = await adminClient.auth.admin.createUser({
        email: 'dev-admin@hospital.local',
        password: 'DevPassword123!',
        email_confirm: true
      })
      
      if (authData?.user) {
        adminId = authData.user.id
      } else {
        // If it failed because user already exists, let's find that user
        const { data: listData } = await adminClient.auth.admin.listUsers()
        const existing = listData?.users?.find(u => u.email === 'dev-admin@hospital.local')
        if (existing) adminId = existing.id
      }
      
      if (adminId) {
        // Upsert into public.users to guarantee the role exists even if triggers fail
        await adminClient.from('users').upsert({ id: adminId, role: 'admin' })
        adminUsers = [{ id: adminId, role: 'admin' }]
      }
    }

    if (adminUsers && adminUsers.length > 0) {
      const realAdmin = adminUsers[0]
      // 3. Override getUser to return this real admin
      adminClient.auth.getUser = async () => ({
        data: { user: { id: realAdmin.id, email: 'dev-admin@hospital.local' } },
        error: null
      } as any)
      
      return adminClient // Return the God Mode client
    }
  }

  return client
}
