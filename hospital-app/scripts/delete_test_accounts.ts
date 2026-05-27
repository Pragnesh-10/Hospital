import { createClient } from '@supabase/supabase-js'

import * as fs from 'fs'
import * as path from 'path'

const envPath = path.resolve(process.cwd(), '.env.local')
const envData = fs.readFileSync(envPath, 'utf8')

let supabaseUrl = ''
let supabaseServiceKey = ''

envData.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].trim().replace(/^"|"$/g, '')
  }
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    supabaseServiceKey = line.split('=')[1].trim().replace(/^"|"$/g, '')
  }
})

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local")
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function removeTestAccounts() {
  console.log("Fetching all users...")
  const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
    perPage: 1000
  })

  if (listError) {
    console.error("Error listing users:", listError)
    return
  }

  const users = usersData.users
  const testUsers = users.filter(u => u.email && u.email.toLowerCase().includes('test'))
  
  if (testUsers.length === 0) {
    console.log("No test accounts found (with 'test' in their email).")
    return
  }

  console.log(`Found ${testUsers.length} test accounts. Deleting them...`)

  for (const user of testUsers) {
    console.log(`Deleting ${user.email} (ID: ${user.id})...`)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (deleteError) {
      console.error(`Failed to delete ${user.email}:`, deleteError.message)
    } else {
      console.log(`Successfully deleted ${user.email}`)
    }
  }

  console.log("Done removing test accounts!")
}

removeTestAccounts()
