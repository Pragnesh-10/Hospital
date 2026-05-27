'use client'

import { useState } from 'react'
import { provisionAccount } from '@/app/actions/admin_users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export function ProvisionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [role, setRole] = useState('staff')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    formData.append('role', role)

    const res = await provisionAccount(formData)
    
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('Account successfully provisioned!')
      ;(e.target as HTMLFormElement).reset()
    }
    
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input id="first_name" name="first_name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input id="last_name" name="last_name" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" name="email" type="email" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Temporary Password</Label>
        <Input id="password" name="password" type="password" required minLength={8} placeholder="Minimum 8 characters" />
      </div>

      <div className="space-y-2">
        <Label>Assign Role</Label>
        <Select value={role} onValueChange={(val) => setRole(val || 'staff')}>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="staff">Hospital Staff</SelectItem>
            <SelectItem value="doctor">Medical Doctor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {role === 'doctor' && (
        <div className="space-y-2 border p-4 rounded-lg bg-muted/20">
          <Label htmlFor="specialization">Doctor Specialization</Label>
          <Input id="specialization" name="specialization" required={role === 'doctor'} placeholder="e.g. Cardiologist" />
          <p className="text-xs text-muted-foreground">Required for all doctors. They will appear in the public directory under this specialization.</p>
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Provisioning..." : "Provision Account"}
      </Button>
    </form>
  )
}
