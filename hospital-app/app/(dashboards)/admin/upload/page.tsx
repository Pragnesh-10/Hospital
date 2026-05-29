import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { requireAdmin } from '@/lib/auth/verifyAdmin'
import { AdminUploadForm } from './AdminUploadForm'
import { BackButton } from '@/components/shared/BackButton'

export default async function AdminUploadPage() {
  const { adminClient } = await requireAdmin()

  // Fetch all required data concurrently and utilize SQL joins to avoid manual mapping
  const [
    { data: dbDoctors },
    { data: facilities }
  ] = await Promise.all([
    adminClient.from('doctors').select('id, profiles(id, first_name, last_name)'),
    adminClient.from('facilities').select('id, title')
  ])

  const doctors = dbDoctors || []

  return (
    <div className="space-y-6">
      <div>
        <BackButton fallbackUrl="/admin" />
        <h1 className="text-3xl font-bold tracking-tight">Upload Images</h1>
        <p className="text-muted-foreground mt-1">
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
