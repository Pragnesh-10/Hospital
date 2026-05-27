import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  
  const adminClient = createAdminClient()
  const { data } = await adminClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (data?.role !== 'admin') redirect('/')
  
  return { user, adminClient, supabase }
}
