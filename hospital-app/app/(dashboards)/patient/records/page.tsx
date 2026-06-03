import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { BackButton } from '@/components/shared/BackButton'

export default async function PatientRecordsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, doctors(specialization, profiles(first_name, last_name))')
    .eq('patient_id', user.id)
    .order('appointment_date', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <BackButton fallbackUrl="/patient" />
        <h1 className="text-3xl font-bold tracking-tight">Medical History</h1>
        <p className="text-muted-foreground mt-1">
          View your past appointments, reasons for visits, and doctors&apos; medical notes.
        </p>
      </div>

      <div className="grid gap-4">
        {appointments && appointments.length > 0 ? (
          appointments.map((appt) => (
            <Card key={appt.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Consultation with Dr. {appt.doctors?.profiles?.first_name} {appt.doctors?.profiles?.last_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(appt.appointment_date), "MMMM d, yyyy")} at {appt.appointment_time}
                  </p>
                </div>
                <div className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full capitalize">
                  {appt.status}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <span className="font-semibold text-sm">Reason for Visit:</span>
                  <p className="text-sm text-muted-foreground">{appt.reason || 'None provided.'}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-semibold text-sm">Doctor&apos;s Medical Notes:</span>
                  <div className="bg-muted p-4 rounded-md text-sm mt-2 whitespace-pre-wrap">
                    {appt.medical_notes || 'No notes have been added by the doctor yet.'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">You have no medical history records yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
