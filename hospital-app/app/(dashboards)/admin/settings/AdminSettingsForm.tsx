'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { updateSystemSetting } from '@/app/actions/admin'
import { uploadHospitalHeroImage } from '@/app/actions/upload'

export function AdminSettingsForm({
  initialSettings,
}: {
  initialSettings: { 
    allow_guest_bookings: boolean; 
    maintenance_mode: boolean;
    require_email_confirmation: boolean;
    sms_notifications: boolean;
    hospital_hero_image: string;
  }
}) {
  const [allowGuest, setAllowGuest] = useState(initialSettings.allow_guest_bookings)
  const [maintenance, setMaintenance] = useState(initialSettings.maintenance_mode)
  const [requireEmail, setRequireEmail] = useState(initialSettings.require_email_confirmation)
  const [smsNotifications, setSmsNotifications] = useState(initialSettings.sms_notifications)
  const [hospitalPhoto, setHospitalPhoto] = useState(initialSettings.hospital_hero_image)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

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
        router.refresh()
      }
    })
  }

  const handlePhotoUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const file = formData.get('image') as File
    if (!file || file.size === 0) {
      toast.error('Please select an image file first.')
      return
    }

    setIsUploadingPhoto(true)
    try {
      const res = await uploadHospitalHeroImage(formData)
      if (res.error) {
        toast.error(res.error)
      } else if (res.success && res.url) {
        toast.success('Hospital photo updated successfully!')
        setHospitalPhoto(res.url)
        ;(e.target as HTMLFormElement).reset()
        router.refresh()
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload photo')
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle>Hospital Landing Photo</CardTitle>
          <CardDescription>Upload a custom photo of the hospital to display on the main landing page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handlePhotoUpload} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hospital-photo-file">Select Image File</Label>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Input 
                  id="hospital-photo-file" 
                  name="image" 
                  type="file" 
                  accept="image/*" 
                  required 
                  className="cursor-pointer max-w-sm"
                  disabled={isUploadingPhoto}
                />
                <Button type="submit" disabled={isUploadingPhoto}>
                  {isUploadingPhoto ? 'Uploading...' : 'Upload & Save Photo'}
                </Button>
              </div>
            </div>
          </form>

          {hospitalPhoto ? (
            <div className="space-y-2">
              <Label>Current Hospital Photo Preview</Label>
              <div className="relative aspect-video max-w-md rounded-xl overflow-hidden border shadow-sm bg-muted">
                <img 
                  src={hospitalPhoto} 
                  alt="Hospital Hero" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Default Landing Photo Preview</Label>
              <div className="relative aspect-video max-w-md rounded-xl overflow-hidden border shadow-sm bg-muted">
                <img 
                  src="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80" 
                  alt="Default Hospital Hero" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
