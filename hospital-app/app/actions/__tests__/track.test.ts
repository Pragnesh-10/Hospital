import { lookupAppointment } from '../track'
import { createAdminClient } from '@/lib/supabase/admin'

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(),
}))

jest.mock('@upstash/redis', () => ({
  Redis: jest.fn()
}))

jest.mock('@upstash/ratelimit', () => ({
  Ratelimit: jest.fn().mockImplementation(() => ({
    limit: jest.fn().mockResolvedValue({ success: true })
  }))
}))

jest.mock('next/headers', () => ({
  headers: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue('127.0.0.1')
  })
}))

describe('lookupAppointment', () => {
  let mockSupabaseClient: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn()
    }

    ;(createAdminClient as jest.Mock).mockReturnValue(mockSupabaseClient)
  })

  it('masks PII such as names and tokens when returning search results', async () => {
    // Setup mock to return a valid appointment
    mockSupabaseClient.limit.mockResolvedValueOnce({
      data: [{
        id: '123',
        status: 'scheduled',
        appointment_date: '2025-01-01',
        appointment_time: '10:00:00',
        appointment_number: 'TKN-8910',
        guest_name: null,
        guest_phone: '1234567890',
        doctors: {
          profiles: { first_name: 'Gregory', last_name: 'House' },
          specialization: 'Diagnostic Medicine'
        },
        profiles: {
          first_name: 'Allison',
          last_name: 'Cameron',
          phone: '1234567890'
        }
      }],
      error: null
    })

    const formData = new FormData()
    formData.append('query', 'TKN-8910')

    const result = await lookupAppointment(formData)

    expect(result.success).toBe(true)
    if (!result.data) throw new Error('Result data is missing')

    expect(result.data.patientName).toBe('A*****n C*****n')
    expect(result.data.doctorName).toBe('Dr. G*****y')
    expect(result.data.token).toBe('TKN-****')
  })

  it('handles short tokens properly', async () => {
    mockSupabaseClient.limit.mockResolvedValueOnce({
      data: [{
        id: '123',
        status: 'scheduled',
        appointment_date: '2025-01-01',
        appointment_time: '10:00:00',
        appointment_number: 'TKN',
        guest_name: 'John Doe',
        guest_phone: '1234567890',
        doctors: null,
        profiles: null
      }],
      error: null
    })

    const formData = new FormData()
    formData.append('query', '12345')

    const result = await lookupAppointment(formData)

    expect(result.success).toBe(true)
    if (!result.data) throw new Error('Result data is missing')

    expect(result.data.patientName).toBe('J**n D*e')
    expect(result.data.doctorName).toBe('Unknown Doctor')
    expect(result.data.token).toBe('***')
  })
})
