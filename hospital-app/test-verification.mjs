import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.replace(/^"|"$/g, '')

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
  console.log("Checking Doctor Visibility (with anon key)...")
  const { data: doctors, error: dErr } = await supabase.from('doctors').select('*, profiles(first_name, last_name, avatar_url)').eq('is_active', true)
  if (dErr) console.error("Error fetching doctors:", dErr)
  else console.log(`Found ${doctors?.length || 0} active doctors visible to public.`)
  if (doctors?.length > 0) {
    console.log("First doctor name:", doctors[0].profiles?.first_name)
  }

  console.log("\nChecking Test Accounts (with service role)...")
  const { data: usersData, error: uErr } = await supabaseAdmin.auth.admin.listUsers()
  if (uErr) console.error("Error fetching users:", uErr)
  else {
    const testUsers = usersData.users.filter(u => u.email?.toLowerCase().includes('test'))
    console.log(`Found ${testUsers.length} test accounts.`)
  }
}
run()
