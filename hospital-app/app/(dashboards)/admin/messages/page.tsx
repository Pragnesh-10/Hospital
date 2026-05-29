import { requireAdmin } from '@/lib/auth/verifyAdmin'
import { getContactMessages } from '@/app/actions/contact'
import { AdminMessagesList } from './AdminMessagesList'
import { BackButton } from '@/components/shared/BackButton'

export default async function AdminMessagesPage() {
  await requireAdmin()
  const res = await getContactMessages()
  const messages = res.success ? res.data : []

  return (
    <div className="space-y-6">
      <div>
        <BackButton fallbackUrl="/admin" />
        <h1 className="text-3xl font-bold tracking-tight">Public Inquiries & Messages</h1>
        <p className="text-muted-foreground mt-1">Review and manage contact submissions from patients and guests.</p>
      </div>

      <AdminMessagesList initialMessages={messages || []} />
    </div>
  )
}
