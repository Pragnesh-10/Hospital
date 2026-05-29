import { Sidebar } from '@/components/shared/Sidebar'
import { MobileSidebar } from '@/components/shared/MobileSidebar'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar role="patient" />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-background">
          <div className="flex items-center">
            <MobileSidebar role="patient" />
            <h1 className="font-semibold text-lg">Patient Portal</h1>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-6 bg-muted/10 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
