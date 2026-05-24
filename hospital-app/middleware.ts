import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { LRUCache } from 'lru-cache'

// Note: In a multi-region serverless environment (like Vercel), in-memory caches 
// are isolated per-instance. For global rate limiting, a distributed cache like 
// Upstash Redis is required. However, this LRU cache provides immediate brute-force 
// protection per-instance.
const rateLimit = new LRUCache<string, number>({
  max: 500, // Maximum number of unique IPs tracked
  ttl: 60 * 1000, // 1 minute window
})

export async function middleware(request: NextRequest) {
  // 1. Rate Limiting Protection (100 requests per minute per IP)
  // Get IP (Vercel forwards it in x-forwarded-for)
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
  
  const tokenCount = (rateLimit.get(ip) as number) || 0
  const limit = 100 // 100 reqs / min

  if (tokenCount >= limit) {
    return new NextResponse('Too Many Requests. Please try again later.', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': '0',
        'Retry-After': '60'
      },
    })
  }

  rateLimit.set(ip, tokenCount + 1)

  // 2. Authentication & Authorization (via Supabase)
  const response = await updateSession(request)

  // Attach rate limit headers to successful responses
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', (limit - tokenCount - 1).toString())

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
