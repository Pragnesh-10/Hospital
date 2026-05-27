// TODO: Pending Reports count is a visual stub (hardcoded to 0).
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, FileText, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import Link from 'next/link'
import { StaffAppointmentsTable } from '@/components/staff/StaffAppointmentsTable'

export default async function StaffDashboardPage() {
  const supabase = await createClient()
  
  const todayDate = format(new Date(), 'yyyy-MM-dd')
  
  // Fetch all dashboard data concurrently
  const [
    { data: todayAppointments },
    { data: recentPatients },
    { count: activeDoctorsCount }
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select('*, doctors(profiles(last_name, first_name), specialization), profiles!patient_id(first_name, last_name, phone)')
      .eq('appointment_date', todayDate)
      .order('appointment_time', { ascending: true }),
      
    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
      
    supabase
      .from('doctors')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-end items-start sm:items-center">
        <Link href="/book">
          <Button>Register Walk-in Patient</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Walk-ins & Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Available Doctors</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDoctorsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Currently active in system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold">Today's Schedule & Check-in</h2>
          <StaffAppointmentsTable initialAppointments={todayAppointments || []} />
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPatients && recentPatients.length > 0 ? recentPatients.map((patient) => (
                <div key={patient.id} className="flex flex-col gap-1 border-b pb-4 last:border-0 last:pb-0">
                  <span className="font-medium">{patient.first_name} {patient.last_name}</span>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{patient.phone || 'No contact provided'}</span>
                    <span>{format(new Date(patient.created_at), "MMM d, h:mm a")}</span>
                  </div>
                </div>
              )) : (
                <p className="text-muted-foreground text-sm">No recent patients.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
