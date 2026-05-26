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
  const { data: rawDoctors, error } = await supabase
    .from('doctors')
    .select('id, specialization')
    .eq('is_active', true)

  const { data: dbProfiles } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')

  const doctors = (!error && rawDoctors) ? rawDoctors.map(doc => {
    const profile = (dbProfiles || []).find(p => p.id === doc.id)
    return {
      ...doc,
      profiles: profile || null
    }
  }) : []

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
            defaultDoctorId={doctorId} 
            isGuest={!user} 
            leaves={dbLeaves || []} 
          />
        </CardContent>
      </Card>
    </div>
  )
}
