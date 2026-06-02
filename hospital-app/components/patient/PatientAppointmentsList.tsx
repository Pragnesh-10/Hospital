'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cancelAppointment } from '@/app/actions/patient'
import { toast } from 'sonner'
import { XCircle, Calendar, Clock } from 'lucide-react'

export interface PatientAppointment {
  id: string;
  status: string;
  appointment_date: string;
  appointment_time: string;
  appointment_number?: string | null;
  doctors?: {
    profiles?: {
      first_name: string;
      last_name: string;
    } | null;
  } | null;
}

interface PatientAppointmentsListProps {
  appointments: PatientAppointment[]
}

export function PatientAppointmentsList({ appointments }: PatientAppointmentsListProps) {
  const router = useRouter()
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    if (!cancellingId) return
    setLoading(true)
    try {
      const res = await cancelAppointment(cancellingId)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("Appointment cancelled successfully")
        router.refresh()
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
      setCancellingId(null)
    }
  }

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  
  const upcoming = appointments.filter(appt => {
    return appt.status !== 'cancelled' && 
           appt.status !== 'completed' && 
           appt.status !== 'no_show' && 
           appt.appointment_date >= todayStr
  })

  const pastAndCancelled = appointments.filter(appt => {
    return appt.status === 'cancelled' || 
           appt.status === 'completed' || 
           appt.status === 'no_show' || 
           appt.appointment_date < todayStr
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" /> Active Appointments ({upcoming.length})
        </h3>
        <div className="space-y-3">
          {upcoming.length > 0 ? (
            upcoming.map(appt => {
              const doctorName = appt.doctors?.profiles 
                ? `Dr. ${appt.doctors.profiles.first_name} ${appt.doctors.profiles.last_name}`
                : 'Unknown Doctor'
              return (
                <div key={appt.id} className="flex justify-between items-center p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                  <div className="space-y-1">
                    <p className="font-semibold text-base">{doctorName}</p>
                    <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 h-3.5" /> {format(new Date(appt.appointment_date), "MMM d, yyyy")}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 h-3.5" /> {appt.appointment_time}</span>
                      {appt.appointment_number && <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs font-bold text-primary">Token: {appt.appointment_number}</span>}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                    onClick={() => setCancellingId(appt.id)}
                  >
                    <XCircle className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                </div>
              )
            })
          ) : (
            <p className="text-muted-foreground text-sm italic">No active appointments found.</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          History & Cancelled ({pastAndCancelled.length})
        </h3>
        <div className="space-y-3">
          {pastAndCancelled.length > 0 ? (
            pastAndCancelled.map(appt => {
              const isCancelled = appt.status === 'cancelled'
              const doctorName = appt.doctors?.profiles 
                ? `Dr. ${appt.doctors.profiles.first_name} ${appt.doctors.profiles.last_name}`
                : 'Unknown Doctor'
              return (
                <div key={appt.id} className="flex justify-between items-center p-4 border rounded-lg bg-muted/20 opacity-80">
                  <div className="space-y-1">
                    <p className={`font-medium ${isCancelled ? 'line-through text-muted-foreground' : ''}`}>
                      {doctorName}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-4">
                      <span>{format(new Date(appt.appointment_date), "MMM d, yyyy")} at {appt.appointment_time}</span>
                    </p>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      appt.status === 'completed' ? 'bg-green-100 text-green-800' :
                      appt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {appt.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-muted-foreground text-sm italic">No past appointments found.</p>
          )}
        </div>
      </div>

      <Dialog open={!!cancellingId} onOpenChange={(open) => !open && setCancellingId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCancellingId(null)} disabled={loading}>
              No, Keep Booking
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={loading}>
              {loading ? 'Cancelling...' : 'Yes, Cancel Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
