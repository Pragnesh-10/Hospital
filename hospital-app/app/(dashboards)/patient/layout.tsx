import { Sidebar } from '@/components/shared/Sidebar'

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar role="patient" />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b flex items-center px-6 bg-background">
          <h1 className="font-semibold text-lg">Patient Portal</h1>
        </header>
        <main className="flex-1 p-6 bg-muted/10 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
