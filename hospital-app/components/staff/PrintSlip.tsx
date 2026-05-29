'use client'

import { format } from 'date-fns'

interface PrintSlipProps {
  patientName: string
  token: string | null
  doctorName: string
  date: string
  time: string
  department: string
  fee?: number | null
  hospitalAddress?: string
}

export function PrintSlip({ 
  patientName, 
  token, 
  doctorName, 
  date, 
  time, 
  department,
  fee,
  hospitalAddress = "123 Health Avenue, Medical District, Cityville, State 10001"
}: PrintSlipProps) {
  return (
    <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-8 text-black font-sans">
      <div className="max-w-md mx-auto border-2 border-black p-6 rounded-lg">
        <div className="text-center mb-6 border-b-2 border-black pb-4">
          <h1 className="text-3xl font-bold uppercase tracking-widest">MediCare Plus</h1>
          <p className="text-sm mt-1">{hospitalAddress}</p>
          <p className="text-xs text-gray-500 mt-1">Official Appointment Slip</p>
        </div>
        
        <div className="space-y-4 text-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-600">Patient:</span>
            <span className="font-bold">{patientName}</span>
          </div>
          
          {token && (
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-600">Token Number:</span>
              <span className="font-bold text-2xl px-3 py-1 bg-gray-100 border border-black rounded">{token}</span>
            </div>
          )}

          <div className="flex justify-between items-center border-t border-dashed border-gray-400 pt-4 mt-4">
            <span className="font-semibold text-gray-600">Doctor:</span>
            <span className="font-bold">{doctorName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-600">Department:</span>
            <span className="font-bold">{department}</span>
          </div>

          {fee != null && (
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-600">Consultation Fee:</span>
              <span className="font-bold">₹{fee}</span>
            </div>
          )}

          <div className="flex justify-between items-center border-t border-dashed border-gray-400 pt-4 mt-4">
            <span className="font-semibold text-gray-600">Date:</span>
            <span className="font-bold">{format(new Date(date), 'MMMM do, yyyy')}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-600">Time:</span>
            <span className="font-bold">{time}</span>
          </div>
        </div>

        <div className="text-center mt-10 pt-4 border-t-2 border-black text-sm text-gray-600">
          <p>Please arrive 15 minutes before your scheduled time.</p>
          <p>Generated on {format(new Date(), 'PPpp')}</p>
        </div>
      </div>
    </div>
  )
}
