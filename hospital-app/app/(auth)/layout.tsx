import { Activity } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <Link href="/" className="flex items-center space-x-2 mb-8">
        <Activity className="h-8 w-8 text-primary" />
        <span className="font-bold text-2xl tracking-tight">MediCare Plus</span>
      </Link>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
