import { requireAdmin } from '@/lib/auth/verifyAdmin'
import { getAuditLogs } from '@/app/actions/audit'
import { format } from 'date-fns'
import { BackButton } from '@/components/shared/BackButton'

interface AuditLog {
  id: string
  action: string
  target_table: string | null
  target_id: string | null
  details: unknown
  created_at: string
  profiles: {
    first_name: string
    last_name: string
  } | null
}

export default async function AdminAuditPage() {
  await requireAdmin()
  const res = await getAuditLogs()
  const logs = (res.success ? res.data : []) as unknown as AuditLog[]

  return (
    <div className="space-y-6">
      <div>
        <BackButton fallbackUrl="/admin" />
        <h1 className="text-3xl font-bold tracking-tight">System Audit Log</h1>
        <p className="text-muted-foreground mt-1">Trace admin actions and system configuration updates.</p>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target Table</th>
                <th className="px-4 py-3">Target ID</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs && logs.length > 0 ? (
                logs.map((log: AuditLog) => {
                  const adminName = log.profiles 
                    ? `${log.profiles.first_name} ${log.profiles.last_name}`
                    : 'Unknown Admin'

                  return (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 align-middle font-medium">
                        {adminName}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs font-bold text-primary">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle text-muted-foreground">
                        {log.target_table || 'N/A'}
                      </td>
                      <td className="px-4 py-3 align-middle font-mono text-xs max-w-[150px] truncate">
                        {log.target_id || 'N/A'}
                      </td>
                      <td className="px-4 py-3 align-middle max-w-xs truncate text-xs text-muted-foreground">
                        {log.details ? JSON.stringify(log.details) : 'N/A'}
                      </td>
                      <td className="px-4 py-3 align-middle text-muted-foreground text-xs">
                        {format(new Date(log.created_at), "MMM d, yyyy h:mm a")}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground italic">
                    No actions logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
