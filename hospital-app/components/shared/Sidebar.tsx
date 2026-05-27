import Link from 'next/link'
import { Activity, LayoutDashboard, Calendar, Users, FileText, Settings, LogOut, Upload, ShieldPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signout } from '@/app/actions/auth'

// A simple mock sidebar based on role. In a real app, this is dynamic.
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

export function Sidebar({ role }: { role: string }) {
  const links = getLinks(role)

  return (
    <div className="hidden md:flex h-screen w-64 flex-col border-r bg-muted/30">
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg tracking-tight">MediCare Plus</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="p-4 border-t mt-auto">
        <form action={signout}>
          <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" type="submit">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </form>
      </div>
    </div>
  )
}
