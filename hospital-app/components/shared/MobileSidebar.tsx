'use client'

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu, Activity, LayoutDashboard, Calendar, Users, FileText, Settings, LogOut, Upload, ShieldPlus } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const getLinks = (role: string) => {
  if (role === 'admin') return [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Manage Doctors', href: '/admin/doctors', icon: Users },
    { name: 'Provision Staff', href: '/admin/users', icon: ShieldPlus },
    { name: 'Uploads & Assets', href: '/admin/upload', icon: Upload },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]
  if (role === 'patient') return [
    { name: 'Dashboard', href: '/patient', icon: LayoutDashboard },
    { name: 'Book Appointment', href: '/book', icon: Calendar },
    { name: 'Medical Records', href: '/patient/records', icon: FileText },
  ]
  if (role === 'doctor') return [
    { name: 'Dashboard', href: '/doctor', icon: LayoutDashboard },
  ]
  if (role === 'staff') return [
    { name: 'Dashboard', href: '/staff', icon: LayoutDashboard },
  ]
  return []
}

export function MobileSidebar({ role }: { role: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const links = getLinks(role)

  // Close sheet on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden mr-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 flex flex-col w-72">
        <SheetTitle className="sr-only">Dashboard Navigation</SheetTitle>
        <div className="p-6 border-b">
          <Link href="/" className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">MediCare Plus</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-4 text-sm font-medium space-y-2">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary hover:bg-muted ${
                    isActive ? 'bg-muted text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="p-4 border-t mt-auto">
          <form action="/auth/signout" method="POST">
            <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" type="submit">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
