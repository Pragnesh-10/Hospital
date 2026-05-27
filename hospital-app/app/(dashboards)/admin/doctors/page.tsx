import { requireAdmin } from '@/lib/auth/verifyAdmin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DoctorToggleAction } from './DoctorToggleAction'
import { AddDoctorModal } from './AddDoctorModal'
import { EditFeeModal } from './EditFeeModal'

export default async function ManageDoctorsPage() {
  const { adminClient } = await requireAdmin()

  // Fetch doctors and profiles using a single joined query now that the FK exists
  const { data } = await adminClient
    .from('doctors')
    .select('*, profiles(id, first_name, last_name, phone, avatar_url)')
    
  const doctors = data || []

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
          <CardDescription>A list of all doctors, their fees, and current status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor Name</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Consultation Fee</TableHead>
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
                    {doc.consultation_fee != null ? (
                      <span className="font-semibold text-green-600">
                        ₹{Number(doc.consultation_fee).toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {doc.is_active ? (
                      <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <EditFeeModal
                        doctorId={doc.id}
                        currentFee={doc.consultation_fee ?? 0}
                        doctorName={`Dr. ${doc.profiles?.first_name} ${doc.profiles?.last_name}`}
                      />
                      <DoctorToggleAction doctorId={doc.id} isActive={doc.is_active} />
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
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
