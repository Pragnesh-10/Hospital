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

  const today = new Date().toISOString().split('T')[0]

  // Fetch all necessary data concurrently, utilizing SQL joins for profiles
  const [
    { data: todayAppointmentsRes },
    { count: totalAppointmentsCount },
    { count: allTimePendingCount },
    { data: doctorLeaves },
    { data: doctorData }
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select('*, profiles(id, first_name, last_name)')
      .eq('doctor_id', user.id)
      .eq('appointment_date', today)
      .order('appointment_time', { ascending: true }),
      
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('doctor_id', user.id),

    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('doctor_id', user.id)
      .in('status', ['pending', 'in_progress']),
      
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

  const todayAppointments = todayAppointmentsRes || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
            <div className="text-2xl font-bold">{totalAppointmentsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Historical and upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Appointments</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allTimePendingCount || 0}</div>
            <p className="text-xs text-muted-foreground">All-time check-ins/actions needed</p>
          </CardContent>
        </Card>
      </div>

        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <DoctorSchedule appointments={todayAppointments} />
          </CardContent>
        </Card>

        <LeaveManager initialLeaves={doctorLeaves || []} />
    </div>
  )
}
