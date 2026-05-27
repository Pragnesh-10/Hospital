import { requireAdmin } from '@/lib/auth/verifyAdmin'
import { getSystemSettings } from '@/app/actions/admin'
import { AdminSettingsForm } from './AdminSettingsForm'

export default async function AdminSettingsPage() {
  await requireAdmin()
  const res = await getSystemSettings()
  
  const settings = {
    allow_guest_bookings: res.settings?.allow_guest_bookings !== false, // default true
    maintenance_mode: res.settings?.maintenance_mode === true, // default false
    require_email_confirmation: res.settings?.require_email_confirmation === true, // default false
    sms_notifications: res.settings?.sms_notifications !== false, // default true
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">Manage global hospital application preferences.</p>
      </div>

      <AdminSettingsForm initialSettings={settings} />
    </div>
  )
}
