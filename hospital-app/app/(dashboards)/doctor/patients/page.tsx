import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DoctorPatientsList } from './DoctorPatientsList'

export default async function DoctorPatientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, profiles!patient_id(*)')
    .eq('doctor_id', user.id)
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patient Directory</h1>
        <p className="text-muted-foreground">View patient consultation history, appointment logs, and medical notes.</p>
      </div>

      <DoctorPatientsList appointments={appointments || []} />
    </div>
  )
}
