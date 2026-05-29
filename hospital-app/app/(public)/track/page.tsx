'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Search, Calendar, Clock, User, Activity, CheckCircle, Clock3 } from 'lucide-react'
import { lookupAppointment } from '@/app/actions/track'

export default function TrackAppointmentPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await lookupAppointment(formData)
      if (res.error) {
        setError(res.error)
      } else if (res.success) {
        setResult(res.data)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" /> Completed</span>
      case 'in_progress':
      case 'in-progress':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Activity className="w-3 h-3 animate-pulse" /> In Progress</span>
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Cancelled</span>
      case 'no_show':
      case 'no-show':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">No Show</span>
      case 'rescheduled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Rescheduled</span>
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock3 className="w-3 h-3" /> Scheduled</span>
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-10 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Track Your Appointment</h1>
        <p className="text-muted-foreground text-lg max-w-[600px] mx-auto">
          Enter your phone number or appointment token to instantly check your booking status. No account required.
        </p>
      </div>

      <Card className="shadow-lg border-0 mb-8">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Search className="h-5 w-5 text-primary" />
            Lookup Details
          </CardTitle>
          <CardDescription>
            Enter the phone number used during booking or your unique appointment token.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="query" className="sr-only">Phone Number or Token</Label>
              <Input 
                id="query" 
                name="query" 
                placeholder="e.g. +1234567890 or TKN-1234" 
                required 
                className="h-12 text-lg"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8" disabled={loading}>
              {loading ? 'Searching...' : 'Check Status'}
            </Button>
          </form>
          {error && (
            <p className="text-sm text-destructive mt-4 font-medium p-3 bg-destructive/10 rounded-md">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card className="overflow-hidden border-2 border-primary/20 shadow-xl animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="bg-primary/5 p-6 border-b border-primary/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">{result.patientName}</h2>
              {result.token && <p className="text-sm text-muted-foreground font-mono mt-1">Token: {result.token}</p>}
            </div>
            <div>
              {getStatusBadge(result.status)}
            </div>
          </div>
          <CardContent className="p-0">
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x border-b">
              <div className="p-6 flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Date</p>
                  <p className="text-lg font-semibold">{new Date(result.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="p-6 flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Time</p>
                  <p className="text-lg font-semibold">{result.time}</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-muted/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary p-3 rounded-full text-primary-foreground">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Assigned Doctor</p>
                  <p className="font-semibold text-lg">{result.doctorName}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
