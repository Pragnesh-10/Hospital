import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BookingForm } from '@/components/shared/BookingForm'
import { createClient } from '@/lib/supabase/server'

export default async function BookAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const supabase = await createClient()

  const params = await searchParams
  const defaultDoctorId = params?.doctor

  // Fetch doctors and profiles using a single joined query now that the FK exists
  const { data: rawDoctors, error } = await supabase
    .from('doctors')
    .select('id, specialization, profiles(id, first_name, last_name)')
    .eq('is_active', true)

  const doctors = (!error && rawDoctors) ? rawDoctors : []

  const { data: { user } } = await supabase.auth.getUser()

  const { data: dbLeaves } = await supabase
    .from('doctor_leaves')
    .select('*')
    .gte('end_date', new Date().toISOString().split('T')[0]) // Only fetch current/future leaves

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Book an Appointment</h1>
        <p className="text-muted-foreground">
          Fill in the details below to schedule your consultation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
          <CardDescription>Select your preferred doctor, date, and time.</CardDescription>
        </CardHeader>
        <CardContent>
          <BookingForm 
            doctors={doctors} 
            defaultDoctorId={defaultDoctorId} 
            isGuest={!user} 
            leaves={dbLeaves || []} 
          />
        </CardContent>
      </Card>
    </div>
  )
}
