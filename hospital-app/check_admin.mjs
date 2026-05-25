import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('Missing Supabase credentials')
  process.exit(1)
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
  const { data: userData, error } = await adminClient.from('users').select('*').limit(10)
  console.log('Users in users table:')
  console.log(userData)
  
  const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers()
  console.log('\nUsers in auth table:')
  console.log(authUsers?.users?.map(u => ({ email: u.email, id: u.id })))
}

run()
