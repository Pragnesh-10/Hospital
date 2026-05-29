'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function logAdminAction(
  adminId: string,
  action: string,
  targetTable?: string,
  targetId?: string,
  details?: any
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
  const adminClient = createAdminClient()
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
