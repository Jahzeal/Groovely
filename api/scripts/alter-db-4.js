const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const alterTracks = `
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS payment_model VARCHAR(20) DEFAULT 'fixed';
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS license_price NUMERIC(20, 6) DEFAULT 0.000000;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS royalty_percentage INTEGER DEFAULT 10;
`;

async function alterDb() {
  try {
    console.log('Adding payment model columns to tracks table...');
    await pool.query(alterTracks);
    console.log('✅ Tracks table columns added successfully!');
  } catch (error) {
    console.error('❌ Error updating database:', error);
  } finally {
    await pool.end();
  }
}

alterDb();
