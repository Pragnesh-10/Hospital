const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function checkFacilities() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not defined in .env.local");
    return;
  }
  const client = new Client({ connectionString });
  await client.connect();
  try {
    const res = await client.query('SELECT * FROM facilities;');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error("Error querying facilities:", err);
  } finally {
    await client.end();
  }
}

checkFacilities();
