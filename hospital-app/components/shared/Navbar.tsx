import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Activity, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { signout } from '@/app/actions/auth'

export function Navbar({ user, role }: { user: any; role: string | null }) {
  const getDashboardUrl = (role: string | null) => {
    switch (role) {
      case 'admin':
        return '/admin'
      case 'doctor':
        return '/doctor'
      case 'staff':
        return '/staff'
      default:
        return '/patient'
    }
  }

  const dashboardUrl = getDashboardUrl(role)

  const NavLinks = () => (
    <>
      <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
        Home
      </Link>
      <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
        About
      </Link>
      <Link href="/services" className="text-sm font-medium transition-colors hover:text-primary">
        Services
      </Link>
      <Link href="/doctors" className="text-sm font-medium transition-colors hover:text-primary">
        Doctors
      </Link>
      <Link href="/facilities" className="text-sm font-medium transition-colors hover:text-primary">
        Facilities
      </Link>
      <Link href="/track" className="text-sm font-medium transition-colors hover:text-primary">
        Track Appointment
      </Link>
      <Link href="/contact" className="text-sm font-medium transition-colors hover:text-primary">
        Contact
      </Link>
    </>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">MediCare Plus</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-4">
            {user ? (
              <>
                <Link href={dashboardUrl}>
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <form action={signout} className="inline">
                  <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" type="submit">Log out</Button>
                </form>
              </>
            ) : (
              <Link href="/login">
                <Button variant="outline">Log in</Button>
              </Link>
            )}
            <Link href="/book">
              <Button>Book Appointment</Button>
            </Link>
          </div>
          
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle mobile menu</span>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-6 pt-10">
                <Link href="/" className="flex items-center space-x-2 pb-6 border-b">
                  <Activity className="h-6 w-6 text-primary" />
                  <span className="font-bold text-xl tracking-tight">MediCare Plus</span>
                </Link>
                <nav className="flex flex-col gap-4">
                  <NavLinks />
                </nav>
                <div className="flex flex-col gap-2 pt-6 border-t">
                  {user ? (
                    <>
                      <Link href={dashboardUrl} className="w-full">
                        <Button variant="outline" className="w-full">Dashboard</Button>
                      </Link>
                      <form action={signout} className="w-full">
                        <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10" type="submit">Log out</Button>
                      </form>
                    </>
                  ) : (
                    <Link href="/login" className="w-full">
                      <Button variant="outline" className="w-full">Log in</Button>
                    </Link>
                  )}
                  <Link href="/book" className="w-full">
                    <Button className="w-full">Book Appointment</Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
