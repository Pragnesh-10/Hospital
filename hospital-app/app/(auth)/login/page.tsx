import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { login } from '@/app/actions/auth'
import Link from 'next/link'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const message = params?.message

  return (
    <Card className="w-full shadow-lg border-0">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>
          Login to your account to manage your details
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <div className="mb-4 p-3 bg-primary/10 text-primary border border-primary/20 rounded-md text-sm text-center">
            {message}
          </div>
        )}
        <Tabs defaultValue="patient" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="patient">Patient</TabsTrigger>
            <TabsTrigger value="doctor">Doctor</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
          </TabsList>
          
          {['patient', 'doctor', 'staff'].map((role) => (
            <TabsContent key={role} value={role} className="space-y-4 mt-0">
              <form action={login} className="space-y-4">
                <input type="hidden" name="role" value={role} />
                <div className="space-y-2">
                  <Label htmlFor={`${role}-email`}>Email</Label>
                  <Input id={`${role}-email`} name="email" type="email" placeholder="m@example.com" required />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${role}-password`}>Password</Label>
                    <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input id={`${role}-password`} name="password" type="password" required />
                </div>
                <Button className="w-full" type="submit">
                  Login as {role.charAt(0).toUpperCase() + role.slice(1)}
                </Button>
                {role !== 'patient' && (
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    New {role}s must have their accounts provisioned by the Hospital Admin. Self-registration is not available.
                  </p>
                )}
              </form>
            </TabsContent>
          ))}
        </Tabs>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <a href="/register" className="font-medium text-primary hover:underline">
            Register as a Patient
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
