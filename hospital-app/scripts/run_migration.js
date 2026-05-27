const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("ERROR: DATABASE_URL is not defined in .env.local");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  console.log("Connecting to Supabase PostgreSQL database...");
  await client.connect();
  
  try {
    // 1. Check existing columns of appointments
    const columnsRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'appointments';
    `);
    
    const existingColumns = columnsRes.rows.map(r => r.column_name);
    console.log("Current appointments table columns:", existingColumns.join(', '));

    // 1b. Check existing columns of doctors
    const docColumnsRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'doctors';
    `);
    
    const existingDocColumns = docColumnsRes.rows.map(r => r.column_name);
    console.log("Current doctors table columns:", existingDocColumns.join(', '));

    let altered = false;

    // 2. Add patient_id nullable adjustment if needed
    // (Ensure guest booking patient_id can be null)
    try {
      await client.query(`ALTER TABLE public.appointments ALTER COLUMN patient_id DROP NOT NULL;`);
      console.log("✓ Ensured patient_id is nullable (optional) for guest bookings");
      altered = true;
    } catch (e) {
      console.log("- Note: patient_id nullable alteration skipped or already applied");
    }

    // 3. Add guest_address if missing
    if (!existingColumns.includes('guest_address')) {
      await client.query(`ALTER TABLE public.appointments ADD COLUMN guest_address TEXT;`);
      console.log("✓ Added missing column: guest_address (TEXT)");
      altered = true;
    } else {
      console.log("- Column guest_address already exists");
    }

    // 4. Add patient_dob if missing
    if (!existingColumns.includes('patient_dob')) {
      await client.query(`ALTER TABLE public.appointments ADD COLUMN patient_dob DATE;`);
      console.log("✓ Added missing column: patient_dob (DATE)");
      altered = true;
    } else {
      console.log("- Column patient_dob already exists");
    }

    // 5. Add patient_age if missing
    if (!existingColumns.includes('patient_age')) {
      await client.query(`ALTER TABLE public.appointments ADD COLUMN patient_age INTEGER;`);
      console.log("✓ Added missing column: patient_age (INTEGER)");
      altered = true;
    } else {
      console.log("- Column patient_age already exists");
    }

    // 6. Add slot_interval_min if missing
    if (!existingDocColumns.includes('slot_interval_min')) {
      await client.query(`ALTER TABLE public.doctors ADD COLUMN slot_interval_min INTEGER NOT NULL DEFAULT 30;`);
      console.log("✓ Added missing column: slot_interval_min (INTEGER) to doctors");
      altered = true;
    } else {
      console.log("- Column slot_interval_min already exists on doctors");
    }

    if (altered) {
      console.log("\n>>> Database migration completed successfully!");
    } else {
      console.log("\n>>> Database is already up to date!");
    }
  } catch (err) {
    console.error("Migration Error:", err.message);
  } finally {
    await client.end();
  }
}

runMigration();
