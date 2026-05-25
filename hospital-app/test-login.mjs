import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const anonClient = createClient(supabaseUrl, supabaseAnonKey)

async function testAuth() {
  const email = `patient_${Date.now()}@test.com`
  const password = 'Password123!'
  
  const { data: signUpData, error: signUpError } = await anonClient.auth.signUp({
    email,
    password,
    options: { data: { first_name: 'Test', last_name: 'Auth' } }
  })
  console.log('SignUp:', signUpError ? signUpError.message : 'Success')
  
  if (!signUpError) {
     const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
       email,
       password
     })
     console.log('SignIn:', signInError ? signInError.message : 'Success')
  }
}

testAuth()
