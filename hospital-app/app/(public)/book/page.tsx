import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BookingForm } from '@/components/shared/BookingForm'
import { createClient } from '@/lib/supabase/server'
import { getSystemSettings } from '@/app/actions/admin'

export default async function BookAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const supabase = await createClient()

  const params = await searchParams
  const defaultDoctorId = params?.doctor

  // 1. Fetch system settings
  const settingsRes = await getSystemSettings()
  const allowGuest = settingsRes.settings?.allow_guest_bookings !== false
  const maintenanceMode = settingsRes.settings?.maintenance_mode === true

  // 2. Fetch doctors and profiles
  const { data: rawDoctors, error } = await supabase
    .from('doctors')
    .select('id, specialization, consultation_fee, slot_interval_min, profiles(id, first_name, last_name)')
    .eq('is_active', true)

  const doctors = (!error && rawDoctors) ? rawDoctors : []

  const { data: { user } } = await supabase.auth.getUser()

  // 3. Fetch current/future leaves
  const { data: dbLeaves } = await supabase
    .from('doctor_leaves')
    .select('*')
    .gte('end_date', new Date().toISOString().split('T')[0])

  // 4. Fetch all active non-cancelled appointments to filter double bookings
  const { data: dbAppointments } = await supabase
    .from('appointments')
    .select('doctor_id, appointment_date, appointment_time')
    .neq('status', 'cancelled')

  const isWalkin = params?.walkin === 'true'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Book an Appointment</h1>
        <p className="text-muted-foreground">
          Fill in the details below to schedule your consultation.
        </p>
      </div>

      {maintenanceMode ? (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30">
          <CardHeader>
            <CardTitle className="text-yellow-800 dark:text-yellow-400">System Maintenance</CardTitle>
            <CardDescription className="text-yellow-700/80 dark:text-yellow-500/80">
              Online appointment booking is temporarily disabled for scheduled system maintenance. Please call support or try again later.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (!user && !isWalkin && !allowGuest) ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-400">Login Required</CardTitle>
            <CardDescription className="text-red-700/80 dark:text-red-500/80">
              Guest bookings are currently disabled. Please <a href="/login" className="font-semibold underline hover:text-red-900">log in to your account</a> to book an appointment.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
            <CardDescription>Select your preferred doctor, date, and time.</CardDescription>
          </CardHeader>
          <CardContent>
            <BookingForm 
              doctors={doctors} 
              defaultDoctorId={defaultDoctorId} 
              isGuest={!user || isWalkin} 
              leaves={dbLeaves || []} 
              appointments={dbAppointments || []}
              isWalkin={isWalkin}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
