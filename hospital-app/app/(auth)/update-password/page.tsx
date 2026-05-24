import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { updatePassword } from '@/app/actions/reset_auth'

export default async function UpdatePasswordPage({ searchParams }: { searchParams: { message?: string } }) {
  const resolvedParams = await searchParams;
  const message = resolvedParams?.message;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
          <CardDescription>
            Enter your new password below to securely update your account credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" name="password" type="password" required minLength={6} />
            </div>

            {message && (
              <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
                {message}
              </div>
            )}

            <Button className="w-full" type="submit">
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
