import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Activity, Calendar, FileText, IndianRupee } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { requireAdmin } from '@/lib/auth/verifyAdmin'
import { AdminAnalyticsChart } from './AdminAnalyticsChart'
import { format, subDays } from 'date-fns'

export default async function AdminDashboardPage() {
  const { adminClient } = await requireAdmin()

  const todayDate = format(new Date(), 'yyyy-MM-dd')
  const sevenDaysAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd')

  // Fetch all live aggregations concurrently to eliminate data fetching waterfalls
  const [
    { count: patientsCount },
    { count: doctorsCount },
    { count: appointmentsCount },
    { count: todayCount },
    { data: allAppointments },
    { data: todayRevenueData }
  ] = await Promise.all([
    adminClient.from('users').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
    adminClient.from('doctors').select('*', { count: 'exact', head: true }).eq('is_active', true),
    adminClient.from('appointments').select('*', { count: 'exact', head: true }),
    adminClient.from('appointments').select('*', { count: 'exact', head: true }).eq('appointment_date', todayDate),
    adminClient.from('appointments').select('appointment_date').gte('appointment_date', sevenDaysAgo),
    adminClient.from('appointments').select('doctors(consultation_fee)').eq('appointment_date', todayDate).neq('status', 'cancelled')
  ])

  // Calculate Expected Revenue Today
  const expectedRevenueToday = todayRevenueData?.reduce((sum, appt) => {
    const fee = (appt.doctors as any)?.consultation_fee || 0
    return sum + fee
  }, 0) || 0

  const formattedRevenue = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(expectedRevenueToday)
  
  // Calculate chart data for the last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i)
    return format(d, 'yyyy-MM-dd')
  })

  const chartData = last7Days.map(dateStr => {
    const count = allAppointments?.filter(a => a.appointment_date === dateStr).length || 0
    return {
      date: format(new Date(dateStr), 'MMM d'),
      appointments: count
    }
  })

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Live overview of your hospital's performance and analytics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctorsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Live on directory</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCount || 0}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Historical volume</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Expected Revenue Today</CardTitle>
            <IndianRupee className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formattedRevenue}</div>
            <p className="text-xs text-muted-foreground">Active slots value</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <AdminAnalyticsChart data={chartData} />

        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex flex-col">
            <Link href="/admin/upload" className={buttonVariants()}>
              Upload Doctor/Facility Images
            </Link>
            <Link href="/admin/settings" className={buttonVariants({ variant: "outline" })}>
              System Settings
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

