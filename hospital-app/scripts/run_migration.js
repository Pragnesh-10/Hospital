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

    // 2b. Update foreign key of patient_id to point to profiles(id) instead of users(id) to allow PostgREST joins
    try {
      const fkCheck = await client.query(`
        SELECT 
          ccu.table_name AS foreign_table_name
        FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name='appointments' 
          AND kcu.column_name='patient_id';
      `);
      
      const referencedTable = fkCheck.rows[0]?.foreign_table_name;
      if (referencedTable === 'users') {
        console.log("Updating appointments(patient_id) foreign key to reference profiles(id) instead of users(id)...");
        await client.query(`
          ALTER TABLE public.appointments 
          DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;
        `);
        await client.query(`
          ALTER TABLE public.appointments 
          ADD CONSTRAINT appointments_patient_id_fkey 
          FOREIGN KEY (patient_id) 
          REFERENCES public.profiles(id) 
          ON DELETE CASCADE;
        `);
        console.log("✓ Successfully updated foreign key constraint to point to profiles(id)");
        altered = true;
      } else {
        console.log("- foreign key on appointments(patient_id) already points to profiles or is already configured");
      }
    } catch (e) {
      console.log("- Note: failed to update foreign key constraint on appointments(patient_id):", e.message);
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

    // 7. Create system_settings table and seed it
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS public.system_settings (
          key TEXT PRIMARY KEY,
          value JSONB NOT NULL
        );
      `);
      console.log("✓ Ensured system_settings table exists");
      
      // Seed default configs if not already set
      await client.query(`
        INSERT INTO public.system_settings (key, value) VALUES 
        ('allow_guest_bookings', 'true'::jsonb),
        ('maintenance_mode', 'false'::jsonb),
        ('certifications', '[
          {"name": "ISO 9001:2015", "description": "Quality Management System"},
          {"name": "NABH Accredited", "description": "National Accreditation Board for Hospitals"},
          {"name": "JCI Accreditation", "description": "Joint Commission International"}
        ]'::jsonb)
        ON CONFLICT (key) DO NOTHING;
      `);
      console.log("✓ Seeded default system settings");
      altered = true;
    } catch (e) {
      console.log("- Note: system_settings table or seed operation skipped or encountered notice:", e.message);
    }

    // 8. Create appointments RLS policies
    try {
      console.log("Updating appointments table RLS policies...");
      await client.query(`
        -- Create a secure function to check the user's role without triggering infinite loops
        CREATE OR REPLACE FUNCTION public.get_user_role()
        RETURNS public.user_role
        LANGUAGE sql
        SECURITY DEFINER
        SET search_path = public
        AS $$
          SELECT role FROM public.users WHERE id = auth.uid();
        $$;

        -- Enable RLS on appointments table
        ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

        -- Drop existing policies on appointments to prevent duplicates
        DROP POLICY IF EXISTS "Patients can view their own appointments" ON public.appointments;
        DROP POLICY IF EXISTS "Doctors can view their own appointments" ON public.appointments;
        DROP POLICY IF EXISTS "Patients can create appointments" ON public.appointments;
        DROP POLICY IF EXISTS "Staff and Admins can view all appointments" ON public.appointments;
        DROP POLICY IF EXISTS "Staff and Admins can insert appointments" ON public.appointments;
        DROP POLICY IF EXISTS "Staff and Admins can update appointments" ON public.appointments;
        DROP POLICY IF EXISTS "Doctors can update their own appointments" ON public.appointments;
        DROP POLICY IF EXISTS "Patients can update their own appointments" ON public.appointments;

        -- Recreate standard policies
        CREATE POLICY "Patients can view their own appointments" ON public.appointments 
          FOR SELECT USING (auth.uid() = patient_id);

        CREATE POLICY "Doctors can view their own appointments" ON public.appointments 
          FOR SELECT USING (auth.uid() = doctor_id);

        CREATE POLICY "Patients can create appointments" ON public.appointments 
          FOR INSERT WITH CHECK (auth.uid() = patient_id);

        -- Add Staff and Admin policies
        CREATE POLICY "Staff and Admins can view all appointments" ON public.appointments 
          FOR SELECT USING (
            public.get_user_role() IN ('staff', 'admin')
          );

        CREATE POLICY "Staff and Admins can insert appointments" ON public.appointments 
          FOR INSERT WITH CHECK (
            public.get_user_role() IN ('staff', 'admin')
          );

        CREATE POLICY "Staff and Admins can update appointments" ON public.appointments 
          FOR UPDATE USING (
            public.get_user_role() IN ('staff', 'admin')
          );

        -- Add Doctors update policy (for medical notes / complete status)
        CREATE POLICY "Doctors can update their own appointments" ON public.appointments 
          FOR UPDATE USING (
            auth.uid() = doctor_id
          );

        -- Add Patients update policy (for cancellations)
        CREATE POLICY "Patients can update their own appointments" ON public.appointments 
          FOR UPDATE USING (
            auth.uid() = patient_id
          );
      `);
      console.log("✓ Successfully updated appointments RLS policies");
      altered = true;
    } catch (e) {
      console.log("- Note: failed to update appointments RLS policies:", e.message);
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
