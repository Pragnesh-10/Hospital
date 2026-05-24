import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Activity, FileText, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

export default async function StaffDashboardPage() {
  const supabase = await createClient()
  
  const todayDate = format(new Date(), 'yyyy-MM-dd')
  
  // Fetch today's appointments
  const { data: todayAppointments } = await supabase
    .from('appointments')
    .select('*, doctors(profiles(last_name)), profiles!patient_id(first_name, last_name)')
    .eq('appointment_date', todayDate)
    .order('appointment_time', { ascending: true })

  // Fetch recent patients
  const { data: recentPatients } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patient by ID or Name..." className="pl-8" />
        </div>
        <Button>Register Walk-in Patient</Button>
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
            <div className="text-2xl font-bold">Live</div>
            <p className="text-xs text-muted-foreground">Check directory for availability</p>
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

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAppointments && todayAppointments.length > 0 ? todayAppointments.map((appt) => (
                <div key={appt.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">
                      {appt.appointment_number && <span className="text-primary mr-2">{appt.appointment_number}</span>}
                      {appt.profiles ? `${appt.profiles.first_name} ${appt.profiles.last_name}` : appt.guest_name || 'Guest'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Dr. {appt.doctors?.profiles?.last_name} • <span className="capitalize">{appt.status}</span>
                    </p>
                  </div>
                  <div className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {appt.appointment_time}
                  </div>
                </div>
              )) : (
                <p className="text-muted-foreground text-sm">No appointments today.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPatients && recentPatients.length > 0 ? recentPatients.map((patient) => (
                <div key={patient.id} className="flex flex-col gap-1 border-b pb-4 last:border-0 last:pb-0">
                  <span className="font-medium">{patient.first_name} {patient.last_name}</span>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{patient.phone || patient.email || 'No contact provided'}</span>
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
