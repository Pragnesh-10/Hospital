'use client'

import { useState } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { saveMedicalNotes } from '@/app/actions/medical_notes'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

type Appointment = {
  id: string
  patient_id?: string | null
  guest_name?: string | null
  guest_phone?: string | null
  status: string
  reason: string | null
  appointment_time: string
  appointment_date: string
  appointment_number?: string | null
  medical_notes?: string | null
  profiles?: { first_name: string; last_name: string } | null
  patient_dob?: string | null
  patient_age?: number | null
}

export function DoctorSchedule({ appointments, allAppointments }: { appointments: Appointment[], allAppointments: Appointment[] }) {
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSaveNotes(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedAppt) return

    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    formData.append('appointment_id', selectedAppt.id)

    const res = await saveMedicalNotes(formData)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Medical notes saved successfully')
      setSelectedAppt(null)
    }
    setIsSaving(false)
  }

  return (
    <div className="space-y-4">
      {appointments.length > 0 ? appointments.map((appt) => {
        const patientName = appt.profiles ? `${appt.profiles.first_name} ${appt.profiles.last_name}` : appt.guest_name || 'Guest'
        
        // Find historical appointments for this patient
        const history = allAppointments.filter(a => 
          (a.patient_id && a.patient_id === appt.patient_id) || 
          (a.guest_phone && a.guest_phone === appt.guest_phone)
        ).filter(a => a.id !== appt.id) // exclude current
        
        return (
          <div key={appt.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0 last:pb-0 gap-4">
            <div>
              <p className="font-medium flex items-center flex-wrap gap-x-2 gap-y-1">
                {appt.appointment_number && <span className="text-primary font-mono text-xs font-bold bg-primary/10 px-1.5 py-0.5 rounded">{appt.appointment_number}</span>}
                <span>{patientName}</span>
                <span className="text-xs text-muted-foreground font-normal">
                  (Age: {appt.patient_age ?? 'N/A'}{appt.patient_dob ? `, DOB: ${appt.patient_dob}` : ''})
                </span>
              </p>
              <p className="text-sm text-muted-foreground capitalize">{appt.status} - {appt.reason || 'No reason provided'}</p>
            </div>
            
            <div className="flex items-center gap-3 justify-between sm:justify-end w-full sm:w-auto">
              <div className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full whitespace-nowrap">
                {appt.appointment_time}
              </div>
              
              <Dialog open={selectedAppt?.id === appt.id} onOpenChange={(val) => {
                if (!val) setSelectedAppt(null)
              }}>
                {/* @ts-ignore - Radix UI React 19 type clash */}
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setSelectedAppt(appt)}>
                    View / Notes
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>
                      Patient Visit: {patientName}
                      <span className="text-sm font-normal text-muted-foreground block mt-1">
                        Age: {appt.patient_age ?? 'N/A'} {appt.patient_dob ? `| Date of Birth: ${appt.patient_dob}` : ''}
                      </span>
                    </DialogTitle>
                  </DialogHeader>
                  
                  <ScrollArea className="flex-1 px-1">
                    <div className="space-y-6 pb-6">
                      <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
                        <h4 className="font-semibold">Reason for Visit</h4>
                        <p className="text-sm">{appt.reason || 'No reason provided by patient.'}</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold">Medical Notes</h4>
                        <form onSubmit={handleSaveNotes} className="space-y-3">
                          <Textarea 
                            name="medical_notes" 
                            placeholder="Add your medical observations, diagnosis, and prescriptions here..."
                            defaultValue={appt.medical_notes || ''}
                            className="min-h-[150px]"
                          />
                          <Button type="submit" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Notes & Complete'}
                          </Button>
                        </form>
                      </div>

                      {history.length > 0 && (
                        <div className="space-y-3 pt-4 border-t">
                          <h4 className="font-semibold">Patient History ({history.length} previous visits)</h4>
                          <div className="space-y-3">
                            {history.map(h => (
                              <div key={h.id} className="border p-3 rounded-lg bg-card">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium text-sm">{h.appointment_date} at {h.appointment_time}</span>
                                  <span className="text-xs bg-muted px-2 py-1 rounded">{h.status}</span>
                                </div>
                                <p className="text-sm mb-1"><span className="font-medium text-muted-foreground">Reason:</span> {h.reason || 'None'}</p>
                                <p className="text-sm"><span className="font-medium text-muted-foreground">Notes:</span> {h.medical_notes || 'No notes recorded.'}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )
      }) : (
        <p className="text-muted-foreground">No appointments scheduled for today.</p>
      )}
    </div>
  )
}
