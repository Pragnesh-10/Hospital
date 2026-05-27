'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { updateSystemSetting } from '@/app/actions/admin'

export function AdminSettingsForm({
  initialSettings,
}: {
  initialSettings: { 
    allow_guest_bookings: boolean; 
    maintenance_mode: boolean;
    require_email_confirmation: boolean;
    sms_notifications: boolean;
  }
}) {
  const [allowGuest, setAllowGuest] = useState(initialSettings.allow_guest_bookings)
  const [maintenance, setMaintenance] = useState(initialSettings.maintenance_mode)
  const [requireEmail, setRequireEmail] = useState(initialSettings.require_email_confirmation)
  const [smsNotifications, setSmsNotifications] = useState(initialSettings.sms_notifications)
  const [isPending, startTransition] = useTransition()

  const handleToggle = (key: string, currentValue: boolean, setter: (val: boolean) => void) => {
    const newValue = !currentValue
    setter(newValue)

    startTransition(async () => {
      const res = await updateSystemSetting(key, newValue)
      if (res?.error) {
        toast.error(res.error)
        setter(currentValue) // revert
      } else {
        toast.success(`System preference updated successfully!`)
      }
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Booking Preferences</CardTitle>
          <CardDescription>Control how patients book appointments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="allow-guest">Allow Guest Bookings</Label>
              <p className="text-sm text-muted-foreground">Patients can book without registering</p>
            </div>
            <Switch
              id="allow-guest"
              checked={allowGuest}
              onCheckedChange={() => handleToggle('allow_guest_bookings', allowGuest, setAllowGuest)}
              disabled={isPending}
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="require-email">Require Email Confirmation</Label>
              <p className="text-sm text-muted-foreground">Verify emails before account creation</p>
            </div>
            <Switch
              id="require-email"
              checked={requireEmail}
              onCheckedChange={() => handleToggle('require_email_confirmation', requireEmail, setRequireEmail)}
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Maintenance</CardTitle>
          <CardDescription>Control access and notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">Disable all bookings temporarily</p>
            </div>
            <Switch
              id="maintenance-mode"
              checked={maintenance}
              onCheckedChange={() => handleToggle('maintenance_mode', maintenance, setMaintenance)}
              disabled={isPending}
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Send SMS reminders for appointments</p>
            </div>
            <Switch
              id="sms-notifications"
              checked={smsNotifications}
              onCheckedChange={() => handleToggle('sms_notifications', smsNotifications, setSmsNotifications)}
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
