'use client'

import { Button } from '@/components/ui/button'
import { toggleDoctorStatus } from '@/app/actions/admin'
import { useState } from 'react'
import { toast } from 'sonner'

export function DoctorToggleAction({ doctorId, isActive }: { doctorId: string, isActive: boolean }) {
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const res = await toggleDoctorStatus(doctorId, isActive)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(isActive ? 'Doctor deactivated.' : 'Doctor activated.')
    }
    setLoading(false)
  }

  return (
    <Button 
      variant={isActive ? "destructive" : "default"} 
      size="sm" 
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? 'Wait...' : isActive ? 'Deactivate' : 'Activate'}
    </Button>
  )
}
