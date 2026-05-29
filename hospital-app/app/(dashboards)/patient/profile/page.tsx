import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PatientProfileForm } from './PatientProfileForm'

export default async function PatientProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your personal information and contact details.</p>
      </div>

      <PatientProfileForm initialProfile={profile} />
    </div>
  )
}
