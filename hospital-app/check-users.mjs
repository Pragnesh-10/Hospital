import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY.replace(/^"|"$/g, '')

const adminClient = createClient(supabaseUrl, supabaseServiceKey)

async function check() {
  const { data: authData, error } = await adminClient.auth.admin.listUsers()
  if (error) {
    console.error(error)
    return
  }
  console.log('Total Auth Users:', authData.users.length)
  for (const u of authData.users) {
    console.log(u.email, 'Confirmed at:', u.email_confirmed_at ? u.email_confirmed_at : 'NOT CONFIRMED')
  }
}

check()
