'use client'

import { useEffect } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function DoctorError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-6 text-center px-4">
      <div className="p-4 bg-destructive/10 rounded-full">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
        <p className="text-muted-foreground max-w-[500px]">
          An unexpected error occurred while loading this dashboard section.
        </p>
      </div>
      <div className="flex gap-4">
        <Button onClick={() => reset()}>Try again</Button>
        <Link href="/doctor" className={buttonVariants({ variant: "outline" })}>
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
