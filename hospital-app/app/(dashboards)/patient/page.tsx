import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, FileText, Activity } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'

export default async function PatientDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, doctors(specialization, profiles(first_name, last_name))')
    .eq('patient_id', user.id)
    .order('appointment_date', { ascending: true })

  const upcomingAppointments = appointments?.filter(a => new Date(a.appointment_date) >= new Date()) || []

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            {upcomingAppointments.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Next: {format(new Date(upcomingAppointments[0].appointment_date), "MMM d, yyyy")} at {upcomingAppointments[0].appointment_time}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Medical Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No reports uploaded yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Stable</div>
            <p className="text-xs text-muted-foreground">All vitals are normal</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments && appointments.length > 0 ? appointments.slice(0, 5).map(appt => (
                <div key={appt.id} className="flex flex-col gap-1 border-b pb-4 last:border-0 last:pb-0">
                  <span className="font-medium">
                    Consultation with Dr. {appt.doctors?.profiles?.first_name} {appt.doctors?.profiles?.last_name}
                  </span>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{format(new Date(appt.appointment_date), "MMM d, yyyy")} - {appt.appointment_time}</span>
                    <span className="capitalize">{appt.status}</span>
                  </div>
                </div>
              )) : (
                <p className="text-muted-foreground text-sm">No appointments found.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex flex-col">
            <Link href="/book" className={buttonVariants()}>
              Book New Appointment
            </Link>
            <Link href="/patient/records" className={buttonVariants({ variant: "outline" })}>
              View Medical History
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
