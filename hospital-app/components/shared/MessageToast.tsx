'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export function MessageToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      toast.success(message)
      
      // Remove the message from the URL so it doesn't show again on refresh
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete('message')
      const newUrl = pathname + (newSearchParams.toString() ? `?${newSearchParams.toString()}` : '')
      router.replace(newUrl, { scroll: false })
    }
  }, [searchParams, pathname, router])

  return null
}
