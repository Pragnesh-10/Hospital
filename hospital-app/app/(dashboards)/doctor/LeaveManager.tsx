'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { addDoctorLeave, deleteDoctorLeave } from '@/app/actions/leaves'
import { format } from 'date-fns'
import { Trash2, CalendarOff } from 'lucide-react'

import { useRouter } from 'next/navigation'

type Leave = {
  id: string
  start_date: string
  end_date: string
  reason: string | null
}

export function LeaveManager({ initialLeaves }: { initialLeaves: Leave[] }) {
  const router = useRouter()
  const [prevInitialLeaves, setPrevInitialLeaves] = useState(initialLeaves)
  const [leaves, setLeaves] = useState<Leave[]>(initialLeaves)
  const [loading, setLoading] = useState(false)
  const [minDate, setMinDate] = useState('')

  if (initialLeaves !== prevInitialLeaves) {
    setPrevInitialLeaves(initialLeaves)
    setLeaves(initialLeaves)
  }

  useEffect(() => {
    const tzOffset = new Date().getTimezoneOffset() * 60000
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMinDate(new Date(Date.now() - tzOffset).toISOString().slice(0, 16))
  }, [])

  async function handleAddLeave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const startDate = formData.get('start_date') as string
    const endDate = formData.get('end_date') as string
    const reason = formData.get('reason') as string

    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates.")
      setLoading(false)
      return
    }

    const res = await addDoctorLeave(startDate, endDate, reason)
    
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Leave scheduled successfully!")
      router.refresh()
    }
    setLoading(false)
  }

  async function handleDeleteLeave(id: string) {
    if (!confirm("Are you sure you want to cancel this leave?")) return
    
    setLoading(true)
    const res = await deleteDoctorLeave(id)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Leave cancelled.")
      setLeaves(leaves.filter(l => l.id !== id))
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarOff className="h-5 w-5" /> Manage Time Off
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <form onSubmit={handleAddLeave} className="grid sm:grid-cols-4 gap-4 sm:items-end bg-muted/50 p-4 rounded-lg border">
          <div className="space-y-1">
            <Label>Start Time</Label>
            <Input type="datetime-local" name="start_date" required min={minDate} />
          </div>
          <div className="space-y-1">
            <Label>End Time</Label>
            <Input type="datetime-local" name="end_date" required min={minDate} />
          </div>
          <div className="space-y-1">
            <Label>Reason (Optional)</Label>
            <Input type="text" name="reason" placeholder="Meeting, Vacation..." />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            Schedule
          </Button>
        </form>

        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">Upcoming Leaves</h3>
          {leaves.length === 0 ? (
            <p className="text-sm">No scheduled time off.</p>
          ) : (
            <div className="border rounded-md divide-y">
              {leaves.map(leave => (
                <div key={leave.id} className="flex justify-between items-center p-3 text-sm gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      <span className="font-medium">{format(new Date(leave.start_date), 'MMM d, h:mm a')}</span>
                      <span className="text-muted-foreground text-xs">to</span>
                      <span className="font-medium">{format(new Date(leave.end_date), 'MMM d, h:mm a')}</span>
                    </div>
                    {leave.reason && <p className="text-muted-foreground text-xs mt-1 truncate">{leave.reason}</p>}
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 shrink-0" onClick={() => handleDeleteLeave(leave.id)} disabled={loading}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  )
}
