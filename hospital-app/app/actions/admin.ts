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

export async function updateDoctorSettings(doctorId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { createAdminClient } = await import('@/lib/supabase/admin');
  const adminClient = createAdminClient();
  const { data: userData } = await adminClient.from('users').select('role').eq('id', user.id).single();
  if (userData?.role !== 'admin') return { error: 'Unauthorized' }

  const feeStr = formData.get('fee') as string
  const fee = parseFloat(feeStr)

  if (isNaN(fee) || fee < 0) {
    return { error: 'Please enter a valid fee amount.' }
  }

  const intervalStr = formData.get('interval') as string
  const interval = parseInt(intervalStr, 10)

  if (isNaN(interval) || ![15, 30, 45, 60].includes(interval)) {
    return { error: 'Please select a valid slot interval (15, 30, 45, or 60 minutes).' }
  }

  const { error } = await adminClient
    .from('doctors')
    .update({ consultation_fee: fee, slot_interval_min: interval })
    .eq('id', doctorId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/doctors')
  revalidatePath('/doctors')
  revalidatePath('/book')

  return { success: true }
}

