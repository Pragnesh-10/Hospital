'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { updateProfile } from '@/app/actions/profile'
import { toast } from 'sonner'

interface PatientProfileFormProps {
  initialProfile: {
    first_name: string
    last_name: string
    phone: string | null
  }
}

export function PatientProfileForm({ initialProfile }: PatientProfileFormProps) {
  const router = useRouter()
  const [firstName, setFirstName] = useState(initialProfile.first_name)
  const [lastName, setLastName] = useState(initialProfile.last_name)
  const [phone, setPhone] = useState(initialProfile.phone || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!firstName || !lastName || !phone) {
      toast.error('All fields are required.')
      return
    }

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      const res = await updateProfile(formData)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Profile updated successfully.')
        router.refresh()
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-md border border-muted-foreground/10">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your personal details below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="pt-2">
            <Button type="submit" className="w-full sm:w-auto px-6" disabled={loading}>
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
