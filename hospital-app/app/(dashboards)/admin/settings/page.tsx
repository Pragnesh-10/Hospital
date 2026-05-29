import { requireAdmin } from '@/lib/auth/verifyAdmin'
import { getSystemSettings } from '@/app/actions/admin'
import { AdminSettingsForm } from './AdminSettingsForm'
import { BackButton } from '@/components/shared/BackButton'

export default async function AdminSettingsPage() {
  await requireAdmin()
  const res = await getSystemSettings()
  
  const settings = {
    allow_guest_bookings: res.settings?.allow_guest_bookings !== false, // default true
    maintenance_mode: res.settings?.maintenance_mode === true, // default false
    require_email_confirmation: res.settings?.require_email_confirmation === true, // default false
    sms_notifications: res.settings?.sms_notifications !== false, // default true
    hospital_hero_image: typeof res.settings?.hospital_hero_image === 'string' ? res.settings.hospital_hero_image : '',
    service_emergency: typeof res.settings?.service_emergency === 'string' ? res.settings.service_emergency : '',
    service_opd: typeof res.settings?.service_opd === 'string' ? res.settings.service_opd : '',
    service_diagnostics: typeof res.settings?.service_diagnostics === 'string' ? res.settings.service_diagnostics : '',
    service_pharmacy: typeof res.settings?.service_pharmacy === 'string' ? res.settings.service_pharmacy : '',
  }

  return (
    <div className="space-y-6">
      <div>
        <BackButton fallbackUrl="/admin" />
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1">Manage global hospital application preferences.</p>
      </div>

      <AdminSettingsForm initialSettings={settings} />
    </div>
  )
}
