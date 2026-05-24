import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminUploadForm } from './AdminUploadForm'

export default async function AdminUploadPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userRole } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userRole?.role !== 'admin') redirect('/login')

  // Fetch doctors and facilities to populate dropdowns
  const { data: doctors } = await supabase
    .from('doctors')
    .select('id, profiles(first_name, last_name)')

  const { data: facilities } = await supabase
    .from('facilities')
    .select('id, title')

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Upload Images</h1>
        <p className="text-muted-foreground">
          Upload profile pictures for doctors and images for facilities.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Doctor Profile Image</CardTitle>
            <CardDescription>Upload an avatar for a doctor</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminUploadForm type="doctor" entities={doctors || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Facility Image</CardTitle>
            <CardDescription>Upload an image for a facility</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminUploadForm type="facility" entities={facilities || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
