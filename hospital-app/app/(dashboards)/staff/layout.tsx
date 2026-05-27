import { Sidebar } from '@/components/shared/Sidebar'
import { MobileSidebar } from '@/components/shared/MobileSidebar'

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar role="staff" />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b flex items-center px-4 md:px-6 bg-background">
          <MobileSidebar role="staff" />
          <h1 className="font-semibold text-lg">Staff Portal</h1>
        </header>
        <main className="flex-1 p-6 bg-muted/10 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
