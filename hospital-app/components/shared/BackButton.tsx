'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BackButtonProps {
  className?: string
  fallbackUrl?: string
}

export function BackButton({ className, fallbackUrl }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    // Check if there is history to go back to, otherwise navigate to fallback
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else if (fallbackUrl) {
      router.push(fallbackUrl)
    } else {
      router.push('/')
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={`inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-all duration-200 hover:-translate-x-0.5 -ml-2 mb-2 ${className}`}
      id="back-button"
    >
      <ArrowLeft className="h-4 w-4" />
      <span>Back</span>
    </Button>
  )
}
