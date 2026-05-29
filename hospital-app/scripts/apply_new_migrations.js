const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("ERROR: DATABASE_URL is not defined in .env.local");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  console.log("Connecting to Supabase PostgreSQL database...");
  await client.connect();

  try {
    console.log("Applying db_updates.sql...");
    const dbUpdatesSql = fs.readFileSync(path.join(__dirname, 'db_updates.sql'), 'utf8');
    await client.query(dbUpdatesSql);
    console.log("✓ db_updates.sql applied successfully");

    console.log("Applying add_rls_system_settings.sql...");
    const rlsSql = fs.readFileSync(path.join(__dirname, 'add_rls_system_settings.sql'), 'utf8');
    await client.query(rlsSql);
    console.log("✓ add_rls_system_settings.sql applied successfully");
  } catch (err) {
    console.error("Error applying migrations:", err);
  } finally {
    await client.end();
  }
}

run();
