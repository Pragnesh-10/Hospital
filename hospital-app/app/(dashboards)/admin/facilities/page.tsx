import { requireAdmin } from '@/lib/auth/verifyAdmin'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminFacilitiesList } from './AdminFacilitiesList'
import { BackButton } from '@/components/shared/BackButton'

export default async function AdminFacilitiesPage() {
  await requireAdmin()
  const adminClient = createAdminClient()
  const { data: facilities } = await adminClient
    .from('facilities')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <BackButton fallbackUrl="/admin" />
        <h1 className="text-3xl font-bold tracking-tight">Facilities Management</h1>
        <p className="text-muted-foreground mt-1">Manage hospital departments, outpatient services, and specialized facilities.</p>
      </div>

      <AdminFacilitiesList initialFacilities={facilities || []} />
    </div>
  )
}
