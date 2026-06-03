'use client'

import { useTransition } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { login } from '@/app/actions/auth'
import Link from 'next/link'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

export function LoginForm({ message }: { message?: string }) {
  const [isPending, startTransition] = useTransition()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        await login(formData)
      } catch (err) {
        // next/navigation redirect throws a redirect exception, which is normal
        console.error(err)
      }
    })
  }

  return (
    <>
      <Dialog open={isPending}>
        <DialogContent className="sm:max-w-[320px] flex flex-col items-center justify-center py-10 gap-4" showCloseButton={false}>
          <div className="p-3 bg-primary/10 rounded-full text-primary animate-spin">
            <Loader2 className="h-8 w-8" />
          </div>
          <DialogTitle className="text-center font-bold text-lg">Signing in progress</DialogTitle>
          <p className="text-xs text-muted-foreground text-center px-4">
            Please wait while we verify your credentials and secure your session.
          </p>
        </DialogContent>
      </Dialog>

      {message && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-md text-sm text-center font-medium animate-in fade-in duration-300">
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
            <form onSubmit={handleLogin} className="space-y-4">
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
              <Button className="w-full" type="submit" disabled={isPending}>
                {isPending ? 'Logging in...' : `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
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
    </>
  )
}
