import { Sidebar } from '@/components/shared/Sidebar'
import { MobileSidebar } from '@/components/shared/MobileSidebar'
import { createAdminClient } from '@/lib/supabase/admin'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const adminClient = createAdminClient()
  
  // Query unread count
  const { count } = await adminClient
    .from('contact_messages')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false)

  const unreadCount = count || 0

  return (
    <div className="flex min-h-screen">
      <Sidebar role="admin" unreadMessagesCount={unreadCount} />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-background">
          <div className="flex items-center">
            <MobileSidebar role="admin" unreadMessagesCount={unreadCount} />
            <h1 className="font-semibold text-lg">Admin Dashboard</h1>
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
