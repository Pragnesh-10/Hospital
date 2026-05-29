'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, CheckCircle, Printer, ArrowLeft, ArrowRight } from 'lucide-react'
import { PrintSlip } from '@/components/staff/PrintSlip'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { createAppointment } from '@/app/actions/appointments'

// Validation schema is defined dynamically inside the component to support conditional guest fields

type Doctor = {
  id: string
  specialization: string
  consultation_fee: number
  slot_interval_min?: number
  profiles: any
}

export function BookingForm({ 
  doctors, 
  defaultDoctorId, 
  isGuest = false,
  leaves = [],
  appointments = [],
  isWalkin = false,
}: { 
  doctors: Doctor[], 
  defaultDoctorId?: string, 
  isGuest?: boolean,
  leaves?: any[],
  appointments?: any[],
  isWalkin?: boolean,
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookedAppointment, setBookedAppointment] = useState<any>(null)
  const [step, setStep] = useState(defaultDoctorId ? 2 : 1)

  const handleNextStep = async () => {
    if (step === 1) {
      const isValid = await form.trigger("doctor_id")
      if (isValid) setStep(2)
    } else if (step === 2) {
      const isValid = await form.trigger(["appointment_date", "appointment_time"])
      if (isValid) setStep(3)
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const dynamicFormSchema = useMemo(() => {
    return z.object({
      doctor_id: z.string().min(1, "Please select a doctor."),
      appointment_date: z.date({ message: "Please select a date." }),
      appointment_time: z.string().min(1, "Please select a time."),
      reason: z.string().optional(),
      patient_dob: z.string().optional().or(z.literal("")),
      patient_age: z.string().min(1, "Age is required."),
      guest_name: isGuest ? z.string().min(1, "Full name is required.") : z.string().optional(),
      guest_phone: isGuest ? z.string().min(1, "Phone number is required.") : z.string().optional(),
      guest_email: z.string().email("Invalid email").optional().or(z.literal("")),
      guest_address: isGuest ? z.string().min(1, "Street address is required.") : z.string().optional(),
      guest_city: isGuest ? z.string().min(1, "City/Town/Village is required.") : z.string().optional(),
      guest_state: isGuest ? z.string().min(1, "State is required.") : z.string().optional(),
      guest_country: isGuest ? z.string().min(1, "Country is required.") : z.string().optional(),
    })
  }, [isGuest])

  const form = useForm<z.infer<typeof dynamicFormSchema>>({
    resolver: zodResolver(dynamicFormSchema),
    defaultValues: {
      doctor_id: defaultDoctorId || "",
      patient_dob: "",
      patient_age: "",
      guest_name: "",
      guest_phone: "",
      guest_email: "",
      guest_address: "",
      guest_city: "",
      guest_state: "",
      guest_country: "",
    },
  })

  // Get currently selected doctor and date
  const selectedDoctorId = form.watch("doctor_id")
   
  const selectedDate = form.watch("appointment_date")
  const watchedDob = form.watch("patient_dob")

  useEffect(() => {
    if (watchedDob) {
      const birthDate = new Date(watchedDob)
      if (!isNaN(birthDate.getTime())) {
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        if (age >= 0) {
          form.setValue("patient_age", age.toString())
        }
      }
    }
  }, [watchedDob, form])

  // Generate slots dynamically based on the selected doctor's custom interval
  const selectedDoctor = useMemo(() => {
    return doctors.find(d => d.id === selectedDoctorId)
  }, [doctors, selectedDoctorId])

  const interval = selectedDoctor?.slot_interval_min ?? 30

  const allTimeSlots = useMemo(() => {
    const slots: string[] = []
    
    // Morning session: 09:00 to 12:00
    let current = 9 * 60 // 09:00 in minutes
    const morningEnd = 12 * 60 // 12:00 in minutes
    while (current + interval <= morningEnd) {
      const hrs = Math.floor(current / 60)
      const mins = current % 60
      slots.push(`${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`)
      current += interval
    }

    // Afternoon session: 14:00 to 17:00
    current = 14 * 60 // 14:00 in minutes
    const afternoonEnd = 17 * 60 // 17:00 in minutes
    while (current + interval <= afternoonEnd) {
      const hrs = Math.floor(current / 60)
      const mins = current % 60
      slots.push(`${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`)
      current += interval
    }

    return slots
  }, [interval])
  
  const timeSlotsWithStatus = useMemo(() => {
    return allTimeSlots.map(time => {
      if (!selectedDoctorId || !selectedDate) {
        return { time, isDisabled: false, reason: null as 'booked' | 'leave' | null }
      }
      
      const [hours, minutes] = time.split(':')
      const slotDate = new Date(selectedDate)
      slotDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      // Double Booking Check: check if already booked
      const isBooked = appointments.some(appt => {
        if (appt.doctor_id !== selectedDoctorId) return false
        
        const apptDateClean = appt.appointment_date ? appt.appointment_date.split('T')[0] : ""
        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
        if (apptDateClean !== selectedDateStr) return false
        
        const apptTimeClean = appt.appointment_time ? appt.appointment_time.slice(0, 5) : ""
        return apptTimeClean === time
      })
      if (isBooked) {
        return { time, isDisabled: true, reason: 'booked' as const }
      }

      const doctorLeaves = leaves.filter(l => l.doctor_id === selectedDoctorId)
      
      const parseNaive = (dateStr: string) => {
        const match = dateStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?/)
        const clean = match ? match[0] : dateStr
        if (!clean.includes('+') && !clean.includes('Z') && !clean.endsWith('Z')) {
          return new Date(`${clean}+05:30`)
        }
        return new Date(clean)
      }

      for (const leave of doctorLeaves) {
        const start = parseNaive(leave.start_date)
        const end = parseNaive(leave.end_date)
        
        // If the slot falls inside the leave range
        if (slotDate >= start && slotDate < end) {
          return { time, isDisabled: true, reason: 'leave' as const }
        }
      }
      return { time, isDisabled: false, reason: null as 'booked' | 'leave' | null }
    })
  }, [allTimeSlots, selectedDoctorId, selectedDate, leaves, appointments])

  async function onSubmit(values: z.infer<typeof dynamicFormSchema>) {
    if (isGuest && (!values.guest_name || !values.guest_phone || !values.guest_address || !values.guest_city || !values.guest_state || !values.guest_country)) {
      toast.error("Please provide all required guest information.")
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('doctor_id', values.doctor_id)
      formData.append('appointment_date', format(values.appointment_date, 'yyyy-MM-dd'))
      formData.append('appointment_time', values.appointment_time)
      if (values.reason) formData.append('reason', values.reason)
      if (values.patient_dob) formData.append('patient_dob', values.patient_dob)
      if (values.patient_age) formData.append('patient_age', values.patient_age)
      if (isGuest && values.guest_name) formData.append('guest_name', values.guest_name)
      if (isGuest && values.guest_email) formData.append('guest_email', values.guest_email)
      if (isGuest && values.guest_phone) formData.append('guest_phone', values.guest_phone)
      if (isGuest && values.guest_address) formData.append('guest_address', values.guest_address)
      if (isGuest && values.guest_city) formData.append('guest_city', values.guest_city)
      if (isGuest && values.guest_state) formData.append('guest_state', values.guest_state)
      if (isGuest && values.guest_country) formData.append('guest_country', values.guest_country)
      if (isWalkin) formData.append('is_walkin', 'true')

      const result = await createAppointment(formData)
      
      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        setBookedAppointment(result.appointment)
        toast.success("Appointment booked successfully!")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (bookedAppointment) {
    const patientName = bookedAppointment.profiles 
      ? `${bookedAppointment.profiles.first_name} ${bookedAppointment.profiles.last_name}` 
      : bookedAppointment.guest_name || 'Guest'

    const doctorName = bookedAppointment.doctors?.profiles 
      ? `Dr. ${bookedAppointment.doctors.profiles.first_name} ${bookedAppointment.doctors.profiles.last_name}` 
      : 'Unknown Doctor'
    const department = bookedAppointment.doctors?.specialization || 'General'

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center py-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-foreground">Appointment Confirmed!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your appointment has been successfully scheduled. Please find your booking receipt details below.
          </p>
        </div>

        {/* On-Screen Receipt Card */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-md overflow-hidden max-w-md mx-auto">
          <div className="bg-primary/5 px-6 py-4 border-b flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Token Number</p>
              <p className="text-xl font-mono font-bold text-primary">{bookedAppointment.appointment_number || 'Pending'}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400">
                Pending Confirmation
              </span>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
              <div>
                <p className="text-muted-foreground font-medium">Patient Name</p>
                <p className="font-semibold text-foreground">{patientName}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Age / DOB</p>
                <p className="font-semibold text-foreground">
                  {bookedAppointment.patient_age} yrs
                  {bookedAppointment.patient_dob ? ` (${format(new Date(bookedAppointment.patient_dob), 'dd/MM/yyyy')})` : ''}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
              <div>
                <p className="text-muted-foreground font-medium">Doctor</p>
                <p className="font-semibold text-foreground">{doctorName}</p>
                <p className="text-xs text-muted-foreground">{department}</p>
              </div>
              {bookedAppointment.doctors?.consultation_fee != null && (
                <div>
                  <p className="text-muted-foreground font-medium">Consultation Fee</p>
                  <p className="font-semibold text-foreground">₹{bookedAppointment.doctors.consultation_fee}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
              <div>
                <p className="text-muted-foreground font-medium">Date</p>
                <p className="font-semibold text-foreground">{format(new Date(bookedAppointment.appointment_date), 'MMMM do, yyyy')}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Time Slot</p>
                <p className="font-semibold text-foreground">{bookedAppointment.appointment_time}</p>
              </div>
            </div>

            {/* Address Details */}
            {(bookedAppointment.guest_address || bookedAppointment.guest_city) && (
              <div className="text-sm">
                <p className="text-muted-foreground font-medium mb-1">Patient Address</p>
                <p className="font-semibold text-foreground">
                  {bookedAppointment.guest_address ? `${bookedAppointment.guest_address}, ` : ''}
                  {bookedAppointment.guest_city ? `${bookedAppointment.guest_city}, ` : ''}
                  {bookedAppointment.guest_state ? `${bookedAppointment.guest_state}, ` : ''}
                  {bookedAppointment.guest_country || ''}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          <Button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2">
            <Printer className="h-4 w-4" /> Download PDF Receipt
          </Button>
          <Button variant="outline" onClick={() => {
            setBookedAppointment(null)
            form.reset()
            setStep(defaultDoctorId ? 2 : 1)
          }} className="flex-1">
            Book Another
          </Button>
        </div>

        {/* Additional Navigation Links */}
        <div className="text-center pt-2">
          {isWalkin ? (
            <Link href="/staff" className="text-sm text-primary hover:underline font-medium">
              Go to Staff Dashboard
            </Link>
          ) : !isGuest ? (
            <Link href="/patient" className="text-sm text-primary hover:underline font-medium">
              Go to Patient Dashboard
            </Link>
          ) : (
            <Link href={`/track?query=${bookedAppointment.appointment_number}`} className="text-sm text-primary hover:underline font-medium">
              Track this Appointment
            </Link>
          )}
        </div>

        {/* Hidden Printable Receipt component */}
        <PrintSlip
          patientName={patientName}
          token={bookedAppointment.appointment_number}
          doctorName={doctorName}
          date={bookedAppointment.appointment_date}
          time={bookedAppointment.appointment_time}
          department={department}
          fee={bookedAppointment.doctors?.consultation_fee}
        />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Step Progress Stepper */}
        <div className="mb-8 border-b pb-6">
          <div className="flex items-center justify-center space-x-4 md:space-x-8">
            {/* Step 1 */}
            <div 
              className={cn("flex flex-col items-center cursor-pointer", step > 1 && "hover:opacity-80")}
              onClick={() => step > 1 && setStep(1)}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mb-1 text-xs font-bold transition-all duration-200",
                step > 1 ? "bg-green-600 text-white animate-in zoom-in-50" : step === 1 ? "bg-primary text-white ring-4 ring-primary/10" : "bg-muted text-muted-foreground"
              )}>
                {step > 1 ? <CheckCircle className="h-4 w-4" /> : "1"}
              </div>
              <span className={cn("text-[10px] font-bold uppercase tracking-wider", step === 1 ? "text-primary font-extrabold" : "text-muted-foreground")}>Doctor</span>
            </div>

            <div className={cn("w-12 md:w-20 h-[2px] -mt-5 transition-all duration-300", step > 1 ? "bg-green-600" : "bg-muted")} />

            {/* Step 2 */}
            <div 
              className={cn("flex flex-col items-center cursor-pointer", (step > 2 || (step > 1 && selectedDoctorId)) && "hover:opacity-80")}
              onClick={() => {
                if (step > 2) setStep(2)
                else if (step === 1 && selectedDoctorId) handleNextStep()
              }}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mb-1 text-xs font-bold transition-all duration-200",
                step > 2 ? "bg-green-600 text-white animate-in zoom-in-50" : step === 2 ? "bg-primary text-white ring-4 ring-primary/10" : "bg-muted text-muted-foreground"
              )}>
                {step > 2 ? <CheckCircle className="h-4 w-4" /> : "2"}
              </div>
              <span className={cn("text-[10px] font-bold uppercase tracking-wider", step === 2 ? "text-primary font-extrabold" : "text-muted-foreground")}>Schedule</span>
            </div>

            <div className={cn("w-12 md:w-20 h-[2px] -mt-5 transition-all duration-300", step > 2 ? "bg-green-600" : "bg-muted")} />

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mb-1 text-xs font-bold transition-all duration-200",
                step === 3 ? "bg-primary text-white ring-4 ring-primary/10" : "bg-muted text-muted-foreground"
              )}>
                3
              </div>
              <span className={cn("text-[10px] font-bold uppercase tracking-wider", step === 3 ? "text-primary font-extrabold" : "text-muted-foreground")}>Details</span>
            </div>
          </div>
        </div>

        {/* Step 1: Select Doctor */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <FormField
              control={form.control}
              name="doctor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doctor</FormLabel>
                  <Select onValueChange={(val) => {
                    field.onChange(val)
                    form.setValue("appointment_date", undefined as unknown as Date)
                    form.setValue("appointment_time", "")
                  }} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a doctor">
                          {selectedDoctor ? `Dr. ${selectedDoctor.profiles?.first_name} ${selectedDoctor.profiles?.last_name} (${selectedDoctor.specialization})` : undefined}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctors.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          Dr. {doc.profiles?.first_name} {doc.profiles?.last_name} ({doc.specialization})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedDoctorId && (() => {
              const selectedDoctor = doctors.find(d => d.id === selectedDoctorId)
              if (selectedDoctor?.consultation_fee != null) {
                return (
                  <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30 px-4 py-3">
                    <span className="text-sm text-muted-foreground">Consultation Fee:</span>
                    <span className="text-lg font-bold text-green-600">₹{Number(selectedDoctor.consultation_fee).toLocaleString('en-IN')}</span>
                  </div>
                )
              }
              return null
            })()}
          </div>
        )}

        {/* Step 2: Date & Time Selection (Schedule) */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {selectedDoctor && (
              <div className="text-sm font-medium bg-muted p-3 rounded-lg flex items-center justify-between">
                <span>Selected Specialist: <strong>Dr. {selectedDoctor.profiles?.first_name} {selectedDoctor.profiles?.last_name}</strong></span>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-xs text-primary underline p-0 h-auto hover:bg-transparent">
                  Change
                </Button>
              </div>
            )}
            
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="appointment_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal w-full",
                              !field.value && "text-muted-foreground",
                              !selectedDoctorId && "opacity-50 cursor-not-allowed"
                            )}
                            disabled={!selectedDoctorId}
                          />
                        }
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>{selectedDoctorId ? "Pick a date" : "Select a doctor first"}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date)
                            form.setValue("appointment_time", "") // Clear time when date changes
                          }}
                          disabled={(date) => {
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            return date < today
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appointment_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Slot</FormLabel>
                    <Select 
                      key={`${selectedDoctorId}_${selectedDate ? selectedDate.getTime() : 'nodate'}`}
                      onValueChange={field.onChange} 
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlotsWithStatus.map(({ time, isDisabled, reason }) => (
                          <SelectItem key={time} value={`${time}:00`} disabled={isDisabled}>
                            {time} {isDisabled && (reason === 'booked' ? '(Booked)' : '(Doctor on Leave)')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Step 3: Patient Information Details */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {selectedDoctor && selectedDate && form.getValues("appointment_time") && (
              <div className="text-xs space-y-1 bg-muted p-3 rounded-lg border text-muted-foreground">
                <p>Doctor: <strong className="text-foreground">Dr. {selectedDoctor.profiles?.first_name} {selectedDoctor.profiles?.last_name} ({selectedDoctor.specialization})</strong></p>
                <p>Date: <strong className="text-foreground">{format(selectedDate, "PPP")}</strong></p>
                <p>Time Slot: <strong className="text-foreground">{form.getValues("appointment_time").slice(0, 5)}</strong></p>
                {selectedDoctor?.consultation_fee != null && (
                  <p>Fee: <strong className="text-foreground">₹{selectedDoctor.consultation_fee}</strong></p>
                )}
              </div>
            )}
            
            {isGuest && (
              <div className="grid sm:grid-cols-2 gap-4 border p-4 rounded-lg bg-muted/20">
                <div className="col-span-full">
                  <h3 className="font-medium text-sm">Guest Information</h3>
                  <p className="text-xs text-muted-foreground">Please provide your details since you are not logged in.</p>
                </div>
                
                <FormField
                  control={form.control}
                  name="guest_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="guest_phone"
                  render={({ field }) => (
                    <FormItem className="col-span-full sm:col-span-1">
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+1 (555) 000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guest_email"
                  render={({ field }) => (
                    <FormItem className="col-span-full sm:col-span-1">
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guest_address"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel>Street Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, Apt 4B" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 col-span-full">
                  <FormField
                    control={form.control}
                    name="guest_city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City/Town/Village *</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="guest_state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State *</FormLabel>
                        <FormControl>
                          <Input placeholder="State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="guest_country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="United States">United States</SelectItem>
                            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="Australia">Australia</SelectItem>
                            <SelectItem value="India">India</SelectItem>
                            <SelectItem value="Germany">Germany</SelectItem>
                            <SelectItem value="France">France</SelectItem>
                            <SelectItem value="Japan">Japan</SelectItem>
                            <SelectItem value="Brazil">Brazil</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4 border p-4 rounded-lg bg-muted/20">
              <FormField
                control={form.control}
                name="patient_dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patient_age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="120" placeholder="Enter age" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Visit (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit about your symptoms or reason for visit."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Dynamic Stepper Navigation Buttons */}
        <div className="flex gap-4 pt-4 border-t">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={handlePrevStep} className="flex-1 flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Previous Step
            </Button>
          )}
          
          {step < 3 ? (
            <Button type="button" onClick={handleNextStep} className="flex-1 flex items-center justify-center gap-2">
              Next Step <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Booking..." : "Confirm Booking"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
