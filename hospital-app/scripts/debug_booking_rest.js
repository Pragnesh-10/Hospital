const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function debugBookingRest() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase URL or Service Role Key");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  console.log("Supabase Client initialized. Fetching doctors...");

  try {
    // 1. Fetch doctor
    const { data: doctors, error: docError } = await supabase
      .from('doctors')
      .select('id, specialization, profiles(first_name, last_name)');

    if (docError) {
      console.error("Error fetching doctors:", docError);
      return;
    }

    if (!doctors || doctors.length === 0) {
      console.log("No doctors found");
      return;
    }

    const doctorId = doctors[0].id;

    // 2. Try inserting a mock appointment
    console.log(`\nAttempting mock insert with doctorId: ${doctorId}...`);
    const { data: inserted, error: insertError } = await supabase
      .from('appointments')
      .insert({
        doctor_id: doctorId,
        appointment_date: '2026-06-20',
        appointment_time: '11:00:00',
        patient_age: 25,
        guest_name: 'Test REST Patient',
        guest_phone: '9876543210',
        guest_address: '123 Test St',
        guest_city: 'Test City',
        guest_state: 'Test State',
        guest_country: 'India',
        status: 'pending'
      })
      .select(`
        id,
        appointment_number,
        appointment_date,
        appointment_time,
        guest_name,
        guest_phone,
        guest_address,
        guest_city,
        guest_state,
        guest_country,
        patient_id,
        patient_age,
        patient_dob,
        users (
          profiles (
            first_name,
            last_name
          )
        ),
        doctors (
          specialization,
          profiles (
            first_name,
            last_name
          )
        )
      `);

    if (insertError) {
      console.error("Insert Error details:");
      console.error(insertError);
    } else {
      console.log("Successfully inserted appointment!");
      const testId = inserted[0].id;
      console.log(`Cleaning up test appointment id: ${testId}...`);
      await supabase.from('appointments').delete().eq('id', testId);
      console.log("Cleanup done.");
    }

    // 3. Test tracking query
    console.log("\nTesting tracking query...");
    const { data: trackData, error: trackError } = await supabase
      .from('appointments')
      .select(`
        id,
        status,
        appointment_date,
        appointment_time,
        appointment_number,
        guest_name,
        guest_phone,
        doctors (
          profiles (
            first_name,
            last_name
          ),
          specialization
        ),
        profiles!patient_id (
          first_name,
          last_name,
          phone
        )
      `)
      .limit(1);

    if (trackError) {
      console.error("Track Error details:");
      console.error(trackError);
    } else {
      console.log("Track query success! Row:", trackData);
    }

  } catch (err) {
    console.error("Unhandled exception:", err);
  }
}

debugBookingRest();
