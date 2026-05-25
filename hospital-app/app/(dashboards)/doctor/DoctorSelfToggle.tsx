'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { toggleMyStatus } from '@/app/actions/doctor'

export function DoctorSelfToggle({ initialStatus }: { initialStatus: boolean }) {
  const [isActive, setIsActive] = useState(initialStatus)
  const [loading, setLoading] = useState(false)

  async function handleToggle(checked: boolean) {
    setLoading(true)
    // Optimistic update
    setIsActive(checked)
    
    const res = await toggleMyStatus(checked)
    if (res.error) {
      toast.error(res.error)
      // Revert on failure
      setIsActive(!checked)
    } else {
      toast.success(checked ? "You are now active and visible to patients." : "You are now hidden from the directory.")
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center space-x-2 bg-background border p-3 rounded-md shadow-sm">
      <Switch 
        id="status-toggle" 
        checked={isActive} 
        onCheckedChange={handleToggle} 
        disabled={loading}
      />
      <Label htmlFor="status-toggle" className={isActive ? "text-green-600 font-semibold" : "text-muted-foreground font-semibold"}>
        {isActive ? "Active (Accepting Appointments)" : "Inactive (Hidden)"}
      </Label>
    </div>
  )
}
