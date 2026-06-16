import { getContactMessages, markMessageAsRead } from './contact'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(),
}))

describe('Contact Actions Security', () => {
  const mockCreateClient = createClient as jest.Mock
  const mockCreateAdminClient = createAdminClient as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getContactMessages', () => {
    it('should return error if not authenticated', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      })

      const result = await getContactMessages()
      expect(result).toEqual({ error: 'Not authenticated' })
    })

    it('should return error if not admin', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
        },
      })

      mockCreateAdminClient.mockReturnValue({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { role: 'patient' } })
            })
          })
        })
      })

      const result = await getContactMessages()
      expect(result).toEqual({ error: 'Unauthorized' })
    })

    it('should allow access to admin', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } } }),
        },
      })

      const mockFrom = jest.fn()
      mockCreateAdminClient.mockReturnValue({
        from: mockFrom
      })

      mockFrom.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { role: 'admin' } })
              })
            })
          }
        }
        if (table === 'contact_messages') {
          return {
            select: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: [{ id: 1, message: 'Hello' }], error: null })
            })
          }
        }
      })

      const result = await getContactMessages()
      expect(result).toEqual({ success: true, data: [{ id: 1, message: 'Hello' }] })
    })
  })

  describe('markMessageAsRead', () => {
    it('should return error if not authenticated', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        },
      })

      const result = await markMessageAsRead('msg-1')
      expect(result).toEqual({ error: 'Not authenticated' })
    })

    it('should return error if not admin', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
        },
      })

      mockCreateAdminClient.mockReturnValue({
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { role: 'patient' } })
            })
          })
        })
      })

      const result = await markMessageAsRead('msg-1')
      expect(result).toEqual({ error: 'Unauthorized' })
    })

    it('should allow access to admin', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'admin-1' } } }),
        },
      })

      const mockFrom = jest.fn()
      mockCreateAdminClient.mockReturnValue({
        from: mockFrom
      })

      mockFrom.mockImplementation((table) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: { role: 'admin' } })
              })
            })
          }
        }
        if (table === 'contact_messages') {
          return {
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null })
            })
          }
        }
      })

      const result = await markMessageAsRead('msg-1')
      expect(result).toEqual({ success: true })
    })
  })
})
