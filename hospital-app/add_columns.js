const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

const client = new Client({
  connectionString,
});

async function run() {
  await client.connect();
  try {
    const res = await client.query(`
      ALTER TABLE appointments 
      ADD COLUMN IF NOT EXISTS guest_city text,
      ADD COLUMN IF NOT EXISTS guest_state text,
      ADD COLUMN IF NOT EXISTS guest_country text;
    `);
    console.log('Success:', res);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

run();
