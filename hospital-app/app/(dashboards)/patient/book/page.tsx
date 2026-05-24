import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BookingForm } from '@/components/shared/BookingForm'
import { createClient } from '@/lib/supabase/server'

export default async function BookAppointmentPage({
  searchParams,
}: {
  searchParams: { doctor?: string }
}) {
  const supabase = await createClient()

  // Wait for the search parameters to be available. In Next.js 15, searchParams is an async promise or requires awaiting props.
  const resolvedParams = await searchParams;
  const doctorId = resolvedParams?.doctor;

  // Fetch doctors from the database
  const { data: dbDoctors, error } = await supabase
    .from('doctors')
    .select('id, specialization, profiles(first_name, last_name)')
    .eq('is_active', true)

  const doctors = (!error && dbDoctors) ? dbDoctors : []

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
          <BookingForm doctors={doctors} defaultDoctorId={doctorId} />
        </CardContent>
      </Card>
    </div>
  )
}
