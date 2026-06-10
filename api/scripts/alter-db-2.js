const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const alterTracks = `
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS currency VARCHAR DEFAULT 'USD';
`;

async function alterDb() {
  try {
    console.log('Adding market columns (price, currency) to tracks table...');
    await pool.query(alterTracks);
    console.log('✅ Database schema updated successfully!');
  } catch (error) {
    console.error('❌ Error updating database:', error);
  } finally {
    await pool.end();
  }
}

alterDb();
