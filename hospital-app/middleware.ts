import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

// Initialize Upstash Redis Ratelimiter only if environment variables are provided
let ratelimit: Ratelimit | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  // Global Rate Limiter: 100 requests per 1 minute window
  ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
  })
}

// Simple In-Memory Rate Limiting Fallback for when Upstash Redis is not configured
const fallbackStore = new Map<string, { count: number; resetTime: number }>()
const FALLBACK_LIMIT = 100 // 100 requests per minute
const FALLBACK_WINDOW_MS = 60 * 1000 // 1 minute

function checkFallbackRateLimit(ip: string): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now()
  
  // Cleanup store occasionally to prevent memory leak
  if (fallbackStore.size > 1000) {
    for (const [key, val] of fallbackStore.entries()) {
      if (now > val.resetTime) {
        fallbackStore.delete(key)
      }
    }
    if (fallbackStore.size > 500) {
      fallbackStore.clear()
    }
  }

  const record = fallbackStore.get(ip)

  if (!record || now > record.resetTime) {
    const resetTime = now + FALLBACK_WINDOW_MS
    fallbackStore.set(ip, { count: 1, resetTime })
    return {
      success: true,
      limit: FALLBACK_LIMIT,
      remaining: FALLBACK_LIMIT - 1,
      reset: Math.ceil(resetTime / 1000),
    }
  }

  if (record.count >= FALLBACK_LIMIT) {
    return {
      success: false,
      limit: FALLBACK_LIMIT,
      remaining: 0,
      reset: Math.ceil(record.resetTime / 1000),
    }
  }

  record.count += 1
  return {
    success: true,
    limit: FALLBACK_LIMIT,
    remaining: FALLBACK_LIMIT - record.count,
    reset: Math.ceil(record.resetTime / 1000),
  }
}

export async function middleware(request: NextRequest) {
  // 1. Rate Limiting Protection
  // Get IP (Vercel forwards it in x-forwarded-for)
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
  
  if (ratelimit) {
    const { success, limit, reset, remaining } = await ratelimit.limit(ip)
    
    if (!success) {
      return new NextResponse('Too Many Requests. Please try again later.', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': '60'
        },
      })
    }
  } else {
    // Fallback in-memory rate limiting when Redis environment variables are missing
    const { success, limit, remaining, reset } = checkFallbackRateLimit(ip)
    if (!success) {
      return new NextResponse('Too Many Requests (Local Fallback). Please try again later.', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': '60'
        },
      })
    }
  }

  // 2. Authentication & Authorization (via Supabase)
  const response = await updateSession(request)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
