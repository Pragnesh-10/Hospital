import { login, signup, signout } from './auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// Mock dependencies
jest.mock('next/navigation', () => ({
  redirect: jest.fn((path) => {
    // Throw an error to simulate next/navigation redirect behavior
    throw new Error(`NEXT_REDIRECT:${path}`)
  }),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(),
}))

// Import the admin client mock after mocking it
import { createAdminClient } from '@/lib/supabase/admin'

interface MockAuth {
  signInWithPassword: jest.Mock
  signOut: jest.Mock
}

interface MockSupabaseClient {
  auth: MockAuth
}

interface MockAdminAuth {
  createUser: jest.Mock
}

interface MockAdminClient {
  from: jest.Mock
  select: jest.Mock
  eq: jest.Mock
  single: jest.Mock
  upsert: jest.Mock
  auth: {
    admin: MockAdminAuth
  }
}

describe('Auth Actions', () => {
  let mockSupabaseClient: MockSupabaseClient
  let mockAdminClient: MockAdminClient

  beforeEach(() => {
    jest.clearAllMocks()

    mockSupabaseClient = {
      auth: {
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
      },
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabaseClient)

    mockAdminClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      upsert: jest.fn().mockResolvedValue({ error: null }),
      auth: {
        admin: {
          createUser: jest.fn(),
        },
      },
    }
    ;(createAdminClient as jest.Mock).mockReturnValue(mockAdminClient)
  })

  // Helper to safely execute action and catch the redirect error
  const executeAndCatchRedirect = async (action: () => Promise<void>) => {
    try {
      await action()
    } catch (e) {
      if (e instanceof Error) {
        if (!e.message.startsWith('NEXT_REDIRECT:')) {
          throw e
        }
      } else {
        throw e
      }
    }
  }

  describe('login', () => {
    it('redirects with error if email is missing', async () => {
      const formData = new FormData()
      formData.append('password', 'password123')
      formData.append('role', 'patient')

      await executeAndCatchRedirect(() => login(formData))
      expect(redirect).toHaveBeenCalledWith('/login?message=Invalid input data')
    })

    it('redirects with error if password is missing', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('role', 'patient')

      await executeAndCatchRedirect(() => login(formData))
      expect(redirect).toHaveBeenCalledWith('/login?message=Invalid input data')
    })

    it('redirects with error if role is missing or invalid', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      formData.append('role', 'invalid_role')

      await executeAndCatchRedirect(() => login(formData))
      expect(redirect).toHaveBeenCalledWith('/login?message=Invalid input data')
    })

    it('redirects with error if signInWithPassword fails', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      formData.append('role', 'patient')

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' },
      })

      await executeAndCatchRedirect(() => login(formData))
      expect(redirect).toHaveBeenCalledWith('/login?message=Invalid%20credentials')
    })

    it('redirects with error if signInWithPassword returns no user data but no error', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      formData.append('role', 'patient')

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      await executeAndCatchRedirect(() => login(formData))
      expect(redirect).toHaveBeenCalledWith('/login?message=Could not authenticate user')
    })

    it('falls back to patient role if user data fetch returns no role', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      formData.append('role', 'patient') // Requested role must match fallback role to avoid wrong tab rejection

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockAdminClient.single.mockResolvedValue({
        data: null, // No user data found
        error: null,
      })

      await executeAndCatchRedirect(() => login(formData))

      expect(mockAdminClient.from).toHaveBeenCalledWith('users')
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
      expect(redirect).toHaveBeenCalledWith('/patient')
    })

    it('redirects to correct role dashboard upon successful login as doctor', async () => {
      const formData = new FormData()
      formData.append('email', 'doctor@example.com')
      formData.append('password', 'password123')
      formData.append('role', 'doctor')

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockAdminClient.single.mockResolvedValue({
        data: { role: 'doctor' },
        error: null,
      })

      await executeAndCatchRedirect(() => login(formData))

      expect(mockAdminClient.from).toHaveBeenCalledWith('users')
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
      expect(redirect).toHaveBeenCalledWith('/doctor')
    })

    it('redirects to correct role dashboard upon successful login as staff', async () => {
      const formData = new FormData()
      formData.append('email', 'staff@example.com')
      formData.append('password', 'password123')
      formData.append('role', 'staff')

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'staff-123' } },
        error: null,
      })

      mockAdminClient.single.mockResolvedValue({
        data: { role: 'staff' },
        error: null,
      })

      await executeAndCatchRedirect(() => login(formData))

      expect(mockAdminClient.from).toHaveBeenCalledWith('users')
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
      expect(redirect).toHaveBeenCalledWith('/staff')
    })

    it('redirects to correct role dashboard upon successful login as patient', async () => {
      const formData = new FormData()
      formData.append('email', 'patient@example.com')
      formData.append('password', 'password123')
      formData.append('role', 'patient')

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'patient-123' } },
        error: null,
      })

      mockAdminClient.single.mockResolvedValue({
        data: { role: 'patient' },
        error: null,
      })

      await executeAndCatchRedirect(() => login(formData))

      expect(mockAdminClient.from).toHaveBeenCalledWith('users')
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
      expect(redirect).toHaveBeenCalledWith('/patient')
    })

    it('redirects with error and signs out if role does not match', async () => {
      const formData = new FormData()
      formData.append('email', 'patient@example.com')
      formData.append('password', 'password123')
      formData.append('role', 'doctor') // Trying to log in as doctor

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockAdminClient.single.mockResolvedValue({
        data: { role: 'patient' }, // Actual role is patient
        error: null,
      })

      await executeAndCatchRedirect(() => login(formData))

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
      expect(redirect).toHaveBeenCalledWith('/login?message=Unauthorized. You do not have doctor privileges.')
    })

    it('allows admin to log in regardless of requested role', async () => {
      const formData = new FormData()
      formData.append('email', 'admin@example.com')
      formData.append('password', 'password123')
      formData.append('role', 'doctor')

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'admin-123' } },
        error: null,
      })

      mockAdminClient.single.mockResolvedValue({
        data: { role: 'admin' },
        error: null,
      })

      await executeAndCatchRedirect(() => login(formData))

      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
      expect(redirect).toHaveBeenCalledWith('/admin')
    })
  })

  describe('signup', () => {
    it('redirects with error if validation fails', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      // Missing required fields

      await executeAndCatchRedirect(() => signup(formData))
      expect(redirect).toHaveBeenCalledWith('/login?message=Invalid input data')
    })

    it('redirects with error if admin createUser fails', async () => {
      const formData = new FormData()
      formData.append('email', 'test@example.com')
      formData.append('password', 'password123')
      formData.append('firstName', 'John')
      formData.append('lastName', 'Doe')

      mockAdminClient.auth.admin.createUser.mockResolvedValue({
        data: null,
        error: { message: 'User already exists' },
      })

      await executeAndCatchRedirect(() => signup(formData))
      expect(redirect).toHaveBeenCalledWith('/login?message=User%20already%20exists')
    })

    it('creates user, profile, and redirects to patient dashboard', async () => {
      const formData = new FormData()
      formData.append('email', 'new@example.com')
      formData.append('password', 'password123')
      formData.append('firstName', 'Jane')
      formData.append('lastName', 'Doe')

      mockAdminClient.auth.admin.createUser.mockResolvedValue({
        data: { user: { id: 'new-user-123' } },
        error: null,
      })

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'new-user-123' } },
        error: null,
      })

      await executeAndCatchRedirect(() => signup(formData))

      expect(mockAdminClient.auth.admin.createUser).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        email_confirm: true,
        user_metadata: {
          first_name: 'Jane',
          last_name: 'Doe',
        },
      })

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
      })

      expect(mockAdminClient.upsert).toHaveBeenCalledTimes(2) // Once for users, once for profiles
      expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
      expect(redirect).toHaveBeenCalledWith('/patient?message=Account created successfully!')
    })
  })

  describe('signout', () => {
    it('signs out and redirects to login', async () => {
      await executeAndCatchRedirect(() => signout())
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
      expect(redirect).toHaveBeenCalledWith('/login?message=Logged out successfully')
    })
  })
})
