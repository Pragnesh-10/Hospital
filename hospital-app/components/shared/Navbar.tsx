import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Activity } from 'lucide-react'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">MediCare Plus</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            Home
          </Link>
          <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
            About
          </Link>
          <Link href="/doctors" className="text-sm font-medium transition-colors hover:text-primary">
            Doctors
          </Link>
          <Link href="/facilities" className="text-sm font-medium transition-colors hover:text-primary">
            Facilities
          </Link>
          <Link href="/contact" className="text-sm font-medium transition-colors hover:text-primary">
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="outline">Log in</Button>
          </Link>
          <Link href="/book">
            <Button>Book Appointment</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
