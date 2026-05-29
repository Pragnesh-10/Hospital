import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, FileText, Activity } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { PatientAppointmentsList } from '@/components/patient/PatientAppointmentsList'

export default async function PatientDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, doctors(specialization, profiles(first_name, last_name))')
    .eq('patient_id', user.id)
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: false })

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  
  // Calculate upcoming appointments
  const upcomingAppointments = appointments?.filter(a => {
    return a.status !== 'cancelled' && 
           a.status !== 'completed' && 
           a.status !== 'no_show' && 
           a.appointment_date >= todayStr
  }) || []

  // Sort upcoming in ascending order for display
  const displayUpcoming = [...upcomingAppointments].sort(
    (a, b) => new Date(`${a.appointment_date}T${a.appointment_time}`).getTime() - 
              new Date(`${b.appointment_date}T${b.appointment_time}`).getTime()
  )

  // Calculate completed appointments count
  const completedAppointments = appointments?.filter(a => a.status === 'completed') || []
  const completedCount = completedAppointments.length

  // Calculate last visit date (most recent completed appointment or any past completed/no_show/confirmed/pending that has elapsed)
  const pastAppointments = appointments?.filter(a => {
    return a.status === 'completed' || 
           (a.status !== 'cancelled' && a.appointment_date < todayStr)
  }) || []
  
  const lastVisitDate = pastAppointments.length > 0 
    ? format(new Date(pastAppointments[0].appointment_date), "MMM d, yyyy") 
    : 'No past visits'

  // Calculate consultations with notes
  const consultationsWithNotesCount = appointments?.filter(a => a.medical_notes !== null && a.medical_notes !== '').length || 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayUpcoming.length}</div>
            {displayUpcoming.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Next: {format(new Date(displayUpcoming[0].appointment_date), "MMM d, yyyy")} at {displayUpcoming[0].appointment_time}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Consultations with Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consultationsWithNotesCount}</div>
            <p className="text-xs text-muted-foreground">Recorded medical history</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Completed Visits</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <p className="text-xs text-muted-foreground">Last visit: {lastVisitDate}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>My Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <PatientAppointmentsList appointments={appointments || []} />
            </CardContent>
          </Card>
        </div>

        <div>
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
    </div>
  )
}










