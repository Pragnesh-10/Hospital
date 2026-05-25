import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const adminClient = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
  const email = `testdoc_${Date.now()}@test.com`
  const password = 'Password123!'
  
  console.log('Creating auth user...')
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (authError) {
    console.log('Auth Error:', authError)
    return
  }

  const newUserId = authData.user.id
  console.log('New User ID:', newUserId)

  console.log('Upserting user...')
  const { error: uErr } = await adminClient.from('users').upsert({ id: newUserId, role: 'doctor' })
  console.log('Users Error:', uErr)

  console.log('Upserting profile...')
  const { error: pErr } = await adminClient.from('profiles').upsert({ id: newUserId, first_name: 'Test', last_name: 'Doc' })
  console.log('Profiles Error:', pErr)

  console.log('Upserting doctor...')
  const { error: dErr } = await adminClient.from('doctors').upsert({ id: newUserId, specialization: 'Test', experience_years: 5, is_active: true })
  console.log('Doctors Error:', dErr)

  console.log('Fetching doctors for dropdown...')
  const { data: fetchDocs, error: fetchErr } = await adminClient.from('doctors').select('id, profiles(first_name, last_name)')
  console.log('Fetched:', JSON.stringify(fetchDocs, null, 2))
}

run()
