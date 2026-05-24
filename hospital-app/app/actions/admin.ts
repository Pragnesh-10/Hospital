'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleDoctorStatus(doctorId: string, currentStatus: boolean) {
  const supabase = await createClient()

  // Verify admin status
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') return { error: 'Unauthorized' }

  // Update doctor
  const { error } = await supabase
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
