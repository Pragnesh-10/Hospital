'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, CheckCircle2, XCircle, Clock, Printer, User, Activity, MoreHorizontal, CalendarIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateAppointmentStatus, rescheduleAppointment } from '@/app/actions/staff'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { PrintSlip } from './PrintSlip'

interface StaffAppointmentsTableProps {
  initialAppointments: any[]
}

export function StaffAppointmentsTable({ initialAppointments }: StaffAppointmentsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  
  // Reschedule State
  const [rescheduleId, setRescheduleId] = useState<string | null>(null)
  const [newDate, setNewDate] = useState<Date | undefined>(undefined)
  const [newTime, setNewTime] = useState<string>('')
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)

  // Print State
  const [printData, setPrintData] = useState<any>(null)

  const filteredAppointments = initialAppointments.filter(appt => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    const patientName = appt.profiles ? `${appt.profiles.first_name} ${appt.profiles.last_name}` : appt.guest_name || 'Guest'
    const phone = appt.profiles?.phone || appt.guest_phone || ''
    const token = appt.appointment_number || ''
    
    return patientName.toLowerCase().includes(searchLower) || 
           phone.toLowerCase().includes(searchLower) || 
           token.toLowerCase().includes(searchLower)
  })

  const handleStatusUpdate = async (id: string, status: string) => {
    setLoadingId(id)
    try {
      const res = await updateAppointmentStatus(id, status)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`Appointment marked as ${status.replace('_', ' ')}`)
      }
    } catch (err) {
      toast.error('An error occurred')
    } finally {
      setLoadingId(null)
    }
  }

  const handleReschedule = async () => {
    if (!rescheduleId || !newDate || !newTime) {
      toast.error('Please select both a date and time')
      return
    }
    
    setLoadingId(rescheduleId)
    setIsRescheduleOpen(false)
    
    try {
      const formattedDate = format(newDate, 'yyyy-MM-dd')
      const res = await rescheduleAppointment(rescheduleId, formattedDate, newTime)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Appointment rescheduled successfully')
      }
    } catch (err) {
      toast.error('An error occurred')
    } finally {
      setLoadingId(null)
      setRescheduleId(null)
      setNewDate(undefined)
      setNewTime('')
    }
  }

  const handlePrint = (appt: any) => {
    const patientName = appt.profiles ? `${appt.profiles.first_name} ${appt.profiles.last_name}` : appt.guest_name || 'Guest'
    const doctorName = appt.doctors?.profiles ? `Dr. ${appt.doctors.profiles.first_name} ${appt.doctors.profiles.last_name}` : 'Unknown Doctor'
    const departmentName = (appt.doctors as any)?.specialization || 'General'

    setPrintData({
      patientName,
      token: appt.appointment_number,
      doctorName,
      date: appt.appointment_date,
      time: appt.appointment_time,
      department: departmentName
    })
    
    setTimeout(() => {
      window.print()
      // Clear print data after printing so it doesn't stay in DOM
      setTimeout(() => setPrintData(null), 1000)
    }, 100)
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>
      case 'in_progress':
      case 'in-progress':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">In Progress</span>
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Cancelled</span>
      case 'no_show':
      case 'no-show':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">No Show</span>
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
    }
  }

  const rescheduleSlots = (() => {
    if (!rescheduleId) return []
    const selectedAppt = initialAppointments.find(a => a.id === rescheduleId)
    const interval = selectedAppt?.doctors?.slot_interval_min ?? 30
    
    const slots: string[] = []
    
    // Morning session: 09:00 to 12:00
    let current = 9 * 60
    const morningEnd = 12 * 60
    while (current + interval <= morningEnd) {
      const hrs = Math.floor(current / 60)
      const mins = current % 60
      slots.push(`${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`)
      current += interval
    }

    // Afternoon session: 14:00 to 17:00
    current = 14 * 60
    const afternoonEnd = 17 * 60
    while (current + interval <= afternoonEnd) {
      const hrs = Math.floor(current / 60)
      const mins = current % 60
      slots.push(`${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`)
      current += interval
    }

    return slots
  })()

  return (
    <div className="space-y-4">
      {printData && (
        <PrintSlip {...printData} />
      )}

      {/* Interactive Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by patient name, phone, or token..." 
          className="pl-9 h-10 w-full bg-background" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAppointments.length > 0 ? filteredAppointments.map((appt) => {
                const patientName = appt.profiles ? `${appt.profiles.first_name} ${appt.profiles.last_name}` : appt.guest_name || 'Guest'
                const doctorName = appt.doctors?.profiles ? `Dr. ${appt.doctors.profiles.last_name}` : 'Unknown'
                const isLoading = loadingId === appt.id

                return (
                  <tr key={appt.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        {appt.appointment_number && <span className="text-primary font-mono text-xs font-bold bg-primary/10 px-1.5 py-0.5 rounded">{appt.appointment_number}</span>}
                        <div className="flex flex-col">
                          <span className="font-medium">{patientName}</span>
                          <span className="text-xs text-muted-foreground">
                            Age: {appt.patient_age ?? 'N/A'}{appt.patient_dob ? ` | DOB: ${appt.patient_dob}` : ''}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle font-medium">
                      {appt.appointment_time}
                    </td>
                    <td className="px-4 py-3 align-middle text-muted-foreground">
                      {doctorName}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {getStatusBadge(appt.status)}
                    </td>
                    <td className="px-4 py-3 align-middle text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Manage Appointment</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStatusUpdate(appt.id, 'in_progress')}>
                            <Activity className="mr-2 h-4 w-4 text-blue-500" /> Check In
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(appt.id, 'no_show')}>
                            <XCircle className="mr-2 h-4 w-4 text-orange-500" /> Mark No-Show
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(appt.id, 'completed')}>
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Mark Completed
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setRescheduleId(appt.id)
                            setIsRescheduleOpen(true)
                          }}>
                            <Clock className="mr-2 h-4 w-4 text-purple-500" /> Reschedule
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePrint(appt)}>
                            <Printer className="mr-2 h-4 w-4" /> Print Slip
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No appointments found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Select a new date and time for this appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">New Date</label>
              <Popover>
                <PopoverTrigger render={
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newDate ? format(newDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                } />
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newDate}
                    onSelect={setNewDate as any}
                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">New Time</label>
              <Select value={newTime} onValueChange={(val) => setNewTime(val || '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {rescheduleSlots.map((time) => (
                    <SelectItem key={time} value={`${time}:00`}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleOpen(false)}>Cancel</Button>
            <Button onClick={handleReschedule} disabled={!newDate || !newTime || loadingId === rescheduleId}>
              {loadingId === rescheduleId ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
