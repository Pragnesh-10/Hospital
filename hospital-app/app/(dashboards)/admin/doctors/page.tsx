import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DoctorToggleAction } from './DoctorToggleAction'
import { AddDoctorModal } from './AddDoctorModal'

export default async function ManageDoctorsPage() {
  const supabase = await createClient()
  
  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { createAdminClient } = await import('@/lib/supabase/admin');
  const adminClient = createAdminClient();
  const { data: userData } = await adminClient.from('users').select('role').eq('id', user.id).single();
  if (userData?.role !== 'admin') redirect('/')

  // Fetch doctors and profiles manually
  const { data: dbDoctors } = await supabase
    .from('doctors')
    .select('*')

  const { data: dbProfiles } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, phone, avatar_url')

  const doctors = (dbDoctors || []).map(doc => {
    const profile = (dbProfiles || []).find(p => p.id === doc.id)
    return {
      ...doc,
      profiles: profile || null
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Manage Doctors</h1>
          <p className="text-muted-foreground">View and manage all doctors in the hospital network.</p>
        </div>
        <AddDoctorModal />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doctor Directory</CardTitle>
          <CardDescription>A list of all doctors and their current status in the booking system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor Name</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors && doctors.length > 0 ? doctors.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    Dr. {doc.profiles?.first_name} {doc.profiles?.last_name}
                  </TableCell>
                  <TableCell>{doc.specialization}</TableCell>
                  <TableCell>{doc.experience_years} years</TableCell>
                  <TableCell>
                    {doc.is_active ? (
                      <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DoctorToggleAction doctorId={doc.id} isActive={doc.is_active} />
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No doctors found in the database.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
