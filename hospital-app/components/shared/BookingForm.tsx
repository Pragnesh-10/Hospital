'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

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

const formSchema = z.object({
  doctor_id: z.string().min(1, "Please select a doctor."),
  appointment_date: z.date(),
  appointment_time: z.string().min(1, "Please select a time."),
  reason: z.string().optional(),
  guest_name: z.string().optional(),
  guest_phone: z.string().optional(),
  guest_email: z.string().email("Invalid email").optional().or(z.literal("")),
  guest_city: z.string().optional(),
  guest_state: z.string().optional(),
  guest_country: z.string().optional(),
})

type Doctor = {
  id: string
  specialization: string
  consultation_fee: number
  profiles: any
}

export function BookingForm({ 
  doctors, 
  defaultDoctorId, 
  isGuest = false,
  leaves = [],
  isWalkin = false,
}: { 
  doctors: Doctor[], 
  defaultDoctorId?: string, 
  isGuest?: boolean,
  leaves?: any[],
  isWalkin?: boolean,
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doctor_id: defaultDoctorId || "",
    },
  })

  // Get currently selected doctor and date
  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedDoctorId = form.watch("doctor_id")
   
  const selectedDate = form.watch("appointment_date")

  // Generate some dummy time slots and filter them based on leaves
  const allTimeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00"]
  
  const timeSlots = allTimeSlots.filter(time => {
    if (!selectedDoctorId || !selectedDate) return true
    
    const [hours, minutes] = time.split(':')
    const slotDate = new Date(selectedDate)
    slotDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    const doctorLeaves = leaves.filter(l => l.doctor_id === selectedDoctorId)
    
    for (const leave of doctorLeaves) {
      const start = new Date(leave.start_date)
      const end = new Date(leave.end_date)
      
      // If the slot falls inside the leave range
      if (slotDate >= start && slotDate < end) {
        return false
      }
    }
    return true
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isGuest && (!values.guest_name || !values.guest_phone || !values.guest_city || !values.guest_state || !values.guest_country)) {
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
      if (isGuest && values.guest_name) formData.append('guest_name', values.guest_name)
      if (isGuest && values.guest_email) formData.append('guest_email', values.guest_email)
      if (isGuest && values.guest_phone) formData.append('guest_phone', values.guest_phone)
      if (isGuest && values.guest_city) formData.append('guest_city', values.guest_city)
      if (isGuest && values.guest_state) formData.append('guest_state', values.guest_state)
      if (isGuest && values.guest_country) formData.append('guest_country', values.guest_country)
      if (isWalkin) formData.append('is_walkin', 'true')

      const result = await createAppointment(formData)
      
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Appointment booked successfully!")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
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
              }} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a doctor" />
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
                <FormLabel>Time</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={`${time}:00`}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Booking..." : "Confirm Booking"}
        </Button>
      </form>
    </Form>
  )
}
