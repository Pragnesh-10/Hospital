'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleMyStatus(isActive: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // Verify they are actually a doctor in the users table
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'doctor') return { error: 'Only doctors can toggle this status.' }

  const { error } = await supabase
    .from('doctors')
    .update({ is_active: isActive })
    .eq('id', user.id)

  if (error) {
    return { error: 'Failed to update status' }
  }

  revalidatePath('/doctor')
  revalidatePath('/doctors')
  revalidatePath('/book')
  
  return { success: true }
}
