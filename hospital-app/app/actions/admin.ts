'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleDoctorStatus(doctorId: string, currentStatus: boolean) {
  const supabase = await createClient()

  // Verify admin status
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  const { createAdminClient } = await import('@/lib/supabase/admin');
  const adminClient = createAdminClient();
  const { data: userData } = await adminClient.from('users').select('role').eq('id', user.id).single();
  if (userData?.role !== 'admin') return { error: 'Unauthorized' }

  // Update doctor using adminClient to bypass any potential RLS restrictions
  const { error } = await adminClient
    .from('doctors')
    .update({ is_active: !currentStatus })
    .eq('id', doctorId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/doctors')
  revalidatePath('/book')
  
  return { success: true }
}
