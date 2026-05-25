'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { addDoctorLeave, deleteDoctorLeave } from '@/app/actions/leaves'
import { format } from 'date-fns'
import { Trash2, CalendarOff } from 'lucide-react'

type Leave = {
  id: string
  start_date: string
  end_date: string
  reason: string | null
}

export function LeaveManager({ initialLeaves }: { initialLeaves: Leave[] }) {
  const [leaves, setLeaves] = useState<Leave[]>(initialLeaves)
  const [loading, setLoading] = useState(false)

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
      // In a real app, the server action revalidates the path which will refresh the server component
      // But for immediate feedback, we can trigger a hard refresh or wait for the Next.js router to catch up.
      window.location.reload()
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
        
        <form onSubmit={handleAddLeave} className="grid sm:grid-cols-4 gap-4 items-end bg-muted/50 p-4 rounded-lg border">
          <div className="space-y-1">
            <Label>Start Time</Label>
            <Input type="datetime-local" name="start_date" required min={new Date().toISOString().slice(0, 16)} />
          </div>
          <div className="space-y-1">
            <Label>End Time</Label>
            <Input type="datetime-local" name="end_date" required min={new Date().toISOString().slice(0, 16)} />
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
                <div key={leave.id} className="flex justify-between items-center p-3 text-sm">
                  <div>
                    <span className="font-medium">{format(new Date(leave.start_date), 'MMM d, h:mm a')}</span>
                    {" to "}
                    <span className="font-medium">{format(new Date(leave.end_date), 'MMM d, h:mm a')}</span>
                    {leave.reason && <span className="text-muted-foreground ml-2">({leave.reason})</span>}
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteLeave(leave.id)} disabled={loading}>
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
