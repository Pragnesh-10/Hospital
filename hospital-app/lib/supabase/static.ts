import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// A stateless, static Supabase client that DOES NOT read cookies.
// Using this client allows Next.js to statically generate (prerender) public pages 
// at build time, resulting in instant page loads from the Vercel CDN.
export const createStaticClient = () => {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
