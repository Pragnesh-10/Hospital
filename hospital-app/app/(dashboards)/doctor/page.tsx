// TODO: Pending Reports count is a visual stub (hardcoded to 0).
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, ClipboardList } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { DoctorSchedule } from './DoctorSchedule'
import { DoctorSelfToggle } from './DoctorSelfToggle'
import { LeaveManager } from './LeaveManager'

export default async function DoctorDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch all necessary data concurrently, utilizing SQL joins for profiles
  const [
    { data: dbAppointments },
    { data: doctorLeaves },
    { data: doctorData }
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select('*, profiles(id, first_name, last_name)')
      .eq('doctor_id', user.id)
      .order('appointment_date', { ascending: true }),
      
    supabase
      .from('doctor_leaves')
      .select('*')
      .eq('doctor_id', user.id)
      .order('start_date', { ascending: true }),
      
    supabase
      .from('doctors')
      .select('is_active')
      .eq('id', user.id)
      .single()
  ])

  const appointments = dbAppointments || []

  const today = new Date().toISOString().split('T')[0]
  const todayAppointments = appointments.filter(a => a.appointment_date === today)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <DoctorSelfToggle initialStatus={doctorData?.is_active ?? false} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground">For {format(new Date(), "MMMM d, yyyy")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Historical and upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Reports to Review</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Require your attention</p>
          </CardContent>
        </Card>
      </div>

        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <DoctorSchedule appointments={todayAppointments} allAppointments={appointments || []} />
          </CardContent>
        </Card>

        <LeaveManager initialLeaves={doctorLeaves || []} />
    </div>
  )
}
