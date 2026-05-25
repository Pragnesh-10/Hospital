import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY.replace(/^"|"$/g, '')

const adminClient = createClient(supabaseUrl, supabaseServiceKey)

async function check() {
  // Get all auth users and their email confirmation status
  const { data: authData } = await adminClient.auth.admin.listUsers()
  
  console.log('Recent Users:')
  for (const user of authData.users.slice(0, 5)) {
    console.log(`- ${user.email} | Confirmed: ${!!user.email_confirmed_at} | Created: ${user.created_at}`)
  }
}

check()
