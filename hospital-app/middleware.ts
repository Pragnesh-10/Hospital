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

export async function middleware(request: NextRequest) {
  // 1. Rate Limiting Protection
  // Get IP (Vercel forwards it in x-forwarded-for)
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
  
  if (ratelimit) {
    const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip)
    
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
