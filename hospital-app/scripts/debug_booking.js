const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function debugBooking() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("ERROR: DATABASE_URL is not defined in .env.local");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  console.log("Connecting to Supabase PostgreSQL database...");
  await client.connect();

  try {
    // 1. Check default value / info for appointment_number
    console.log("\n--- Checking column definition for appointment_number ---");
    const apptNumInfo = await client.query(`
      SELECT column_name, column_default, is_nullable, data_type
      FROM information_schema.columns
      WHERE table_name = 'appointments' AND column_name = 'appointment_number';
    `);
    console.log(apptNumInfo.rows);

    // 2. Check if appointment_number_seq sequence exists
    console.log("\n--- Checking for appointment_number_seq sequence ---");
    const seqInfo = await client.query(`
      SELECT c.relname FROM pg_class c WHERE c.relkind = 'S' AND c.relname = 'appointment_number_seq';
    `);
    console.log(seqInfo.rows);

    // 3. Check for any triggers on appointments table
    console.log("\n--- Checking triggers on appointments table ---");
    const triggers = await client.query(`
      SELECT trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers
      WHERE event_object_table = 'appointments';
    `);
    console.log(triggers.rows);

    // 4. Check list of foreign keys on appointments
    console.log("\n--- Checking foreign keys on appointments ---");
    const fks = await client.query(`
      SELECT
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='appointments';
    `);
    console.log(fks.rows);

    // 5. Get doctor details to select a valid doctor_id
    console.log("\n--- Checking doctors in database ---");
    const docs = await client.query(`
      SELECT d.id as doctor_id, p.first_name, p.last_name 
      FROM public.doctors d
      JOIN public.profiles p ON d.id = p.id;
    `);
    console.log("Doctors found:", docs.rows);

    if (docs.rows.length === 0) {
      console.log("No doctors found in public.doctors table!");
    } else {
      const docId = docs.rows[0].doctor_id;
      // 6. Try a mock insert to see if there is an error
      console.log(`\n--- Attempting mock insert using doctor_id: ${docId} ---`);
      try {
        await client.query('BEGIN');
        const insertRes = await client.query(`
          INSERT INTO public.appointments (
            doctor_id,
            appointment_date,
            appointment_time,
            patient_age,
            guest_name,
            guest_phone,
            guest_address,
            guest_city,
            guest_state,
            guest_country,
            status
          ) VALUES (
            $1, '2026-06-15', '10:00', 30, 'Test Patient', '1234567890', '123 Main St', 'City', 'State', 'Country', 'pending'
          ) RETURNING *;
        `, [docId]);
        console.log("✓ Success! Inserted mock row:", insertRes.rows[0]);
      } catch (err) {
        console.error("✗ Insert failed with error:", err.message);
        console.error(err);
      } finally {
        await client.query('ROLLBACK');
        console.log("Rollback completed.");
      }
    }

  } catch (err) {
    console.error("General Debug Error:", err.message);
  } finally {
    await client.end();
  }
}

debugBooking();
