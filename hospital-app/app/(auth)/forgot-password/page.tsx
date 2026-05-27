import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { resetPassword } from '@/app/actions/reset_auth'
import Link from 'next/link'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const message = params?.message
  const success = params?.success

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={resetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>

            {message && (
              <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
                {message}
              </div>
            )}
            {success && (
              <div className="p-3 text-sm bg-green-500/10 text-green-600 rounded-md">
                {success}
              </div>
            )}

            <Button className="w-full" type="submit">
              Send Reset Link
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
