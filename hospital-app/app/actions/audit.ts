'use server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { Json } from '@/types/supabase'

export async function logAdminAction(
  adminId: string,
  action: string,
  targetTable?: string,
  targetId?: string,
  details?: Json
) {
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('audit_log')
    .insert({
      admin_id: adminId,
      action,
      target_table: targetTable,
      target_id: targetId,
      details
    })

  if (error) {
    console.error("Failed to log admin action:", error)
  }
}

export async function getAuditLogs() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const adminClient = createAdminClient()
  const { data: userData } = await adminClient.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') return { error: 'Unauthorized' }

  const { data, error } = await adminClient
    .from('audit_log')
    .select(`
      *,
      profiles:admin_id (
        first_name,
        last_name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Failed to fetch audit logs:", error)
    return { error: "Failed to fetch audit logs" }
  }

  return { success: true, data }
}
