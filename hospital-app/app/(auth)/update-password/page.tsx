'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [sessionConfirmed, setSessionConfirmed] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
        setSessionConfirmed(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string

    const { error } = await supabase.auth.updateUser({ password })
    
    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else {
      router.push('/login?message=Password updated successfully. Please log in.')
    }
  }

  if (!sessionConfirmed) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Confirming secure recovery session...</p>
        </div>
      </div>
    )
  }

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
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" name="password" type="password" required minLength={6} />
            </div>

            {errorMsg && (
              <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
                {errorMsg}
              </div>
            )}

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
