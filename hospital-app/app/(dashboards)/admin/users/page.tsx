import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ProvisionForm } from './ProvisionForm'
import { requireAdmin } from '@/lib/auth/verifyAdmin'

export default async function AdminUsersPage() {
  await requireAdmin()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Account Provisioning</h1>
        <p className="text-muted-foreground">Securely generate accounts for Doctors and Hospital Staff.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Employee</CardTitle>
            <CardDescription>
              Accounts created here bypass public registration and are instantly active.
              Provide the generated credentials to the employee securely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProvisionForm />
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Security Notice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong>Why use this portal?</strong> Normal users registering via the public homepage are automatically assigned the "Patient" role for security purposes.
            </p>
            <p>
              To ensure attackers cannot grant themselves elevated privileges, Doctors and Staff MUST be provisioned through this secure Admin terminal.
            </p>
            <p>
              <strong>Next Steps:</strong> Once you provision an account, hand the Email and Temporary Password to the employee. They can log in immediately and use the "Forgot Password" flow to securely change it.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
