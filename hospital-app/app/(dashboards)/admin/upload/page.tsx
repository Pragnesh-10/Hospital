import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { requireAdmin } from '@/lib/auth/verifyAdmin'
import { AdminUploadForm } from './AdminUploadForm'

export default async function AdminUploadPage() {
  const { adminClient } = await requireAdmin()

  // Fetch doctors and profiles manually since PostgREST misses the direct FK
  // Use adminClient to bypass RLS policies
  const { data: dbDoctors } = await adminClient.from('doctors').select('id')
  const { data: dbProfiles } = await adminClient.from('profiles').select('id, first_name, last_name')
  
  const doctors = (dbDoctors || []).map(doc => {
    const profile = (dbProfiles || []).find(p => p.id === doc.id)
    return {
      id: doc.id,
      profiles: profile || null
    }
  })

  // Fetch facilities using adminClient
  const { data: facilities } = await adminClient
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
