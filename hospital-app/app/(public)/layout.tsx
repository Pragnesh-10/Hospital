import { Navbar } from '@/components/shared/Navbar'
import { Footer } from '@/components/shared/Footer'
import { createClient } from '@/lib/supabase/server'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let role = null

  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    role = userData?.role || 'patient'
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} role={role} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
