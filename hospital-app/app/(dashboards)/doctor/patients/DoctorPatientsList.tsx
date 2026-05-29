'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Search, User, Phone, Calendar, Clock, FileText, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface DoctorPatientsListProps {
  appointments: any[]
}

export function DoctorPatientsList({ appointments }: DoctorPatientsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatientKey, setSelectedPatientKey] = useState<string | null>(null)

  // Group appointments by unique patient (using patient_id or guest_phone/guest_name combo)
  const patientsMap: Record<string, {
    name: string
    phone: string
    isRegistered: boolean
    email: string
    appointments: any[]
  }> = {}

  appointments.forEach(appt => {
    let key = ''
    let name = ''
    let phone = ''
    let email = ''
    let isRegistered = false

    if (appt.patient_id && appt.profiles) {
      key = appt.patient_id
      name = `${appt.profiles.first_name} ${appt.profiles.last_name}`
      phone = appt.profiles.phone || 'N/A'
      email = appt.profiles.email || 'N/A'
      isRegistered = true
    } else {
      name = appt.guest_name || 'Guest Patient'
      phone = appt.guest_phone || 'N/A'
      email = appt.guest_email || 'N/A'
      key = `guest-${name}-${phone}`
    }

    if (!patientsMap[key]) {
      patientsMap[key] = {
        name,
        phone,
        isRegistered,
        email,
        appointments: []
      }
    }
    patientsMap[key].appointments.push(appt)
  })

  const patientsList = Object.keys(patientsMap).map(key => ({
    key,
    ...patientsMap[key]
  }))

  // Filter patients by name search
  const filteredPatients = patientsList.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedPatient = selectedPatientKey ? patientsMap[selectedPatientKey] : null

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Patient Directory List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background h-10"
          />
        </div>

        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {filteredPatients.length > 0 ? (
            filteredPatients.map(patient => (
              <button
                key={patient.key}
                onClick={() => setSelectedPatientKey(patient.key)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex justify-between items-center ${
                  selectedPatientKey === patient.key
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-muted-foreground/10 bg-card hover:bg-muted/30'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground text-sm">{patient.name}</p>
                    {patient.isRegistered && (
                      <span className="text-[10px] bg-green-100 text-green-800 font-bold px-1.5 py-0.5 rounded-full dark:bg-green-950/30 dark:text-green-400">
                        Registered
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {patient.phone}
                  </p>
                </div>
                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${
                  selectedPatientKey === patient.key ? 'translate-x-1 text-primary' : ''
                }`} />
              </button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic p-4 text-center">No patients found.</p>
          )}
        </div>
      </div>

      {/* Patient History Detail Panel */}
      <div className="lg:col-span-2">
        {selectedPatient ? (
          <Card className="shadow-md border border-muted-foreground/10 h-full">
            <CardHeader className="bg-muted/20 border-b p-6">
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <User className="h-6 w-6 text-primary" /> {selectedPatient.name}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Contact: {selectedPatient.phone} | Email: {selectedPatient.email}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Visits</span>
                  <p className="text-2xl font-bold text-primary">{selectedPatient.appointments.length}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <h3 className="font-semibold text-base border-b pb-2">Consultation History</h3>
              <div className="space-y-4">
                {selectedPatient.appointments.map(appt => (
                  <div key={appt.id} className="p-4 border rounded-xl bg-muted/5 space-y-3">
                    <div className="flex justify-between items-center flex-wrap gap-2 text-sm border-b pb-2">
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {format(new Date(appt.appointment_date), "MMM d, yyyy")}</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {appt.appointment_time}</span>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        appt.status === 'completed' ? 'bg-green-100 text-green-800' :
                        appt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appt.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Medical Notes</p>
                      {appt.medical_notes ? (
                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed bg-background p-3 rounded-lg border font-normal">
                          {appt.medical_notes}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic pl-1 font-normal">No medical notes recorded for this session.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-muted-foreground/10 rounded-2xl bg-card text-muted-foreground">
            <User className="h-16 w-16 mb-4 opacity-20" />
            <p className="font-semibold text-lg">Select a patient</p>
            <p className="text-sm text-muted-foreground max-w-sm text-center mt-1">
              Click on a patient from the directory on the left to view their complete consultation history.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
