const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const sql = `
ALTER TABLE song_contributors ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending';

-- Update any existing contributors to 'accepted' so we don't break existing tracks
UPDATE song_contributors SET approval_status = 'accepted';
`;

async function alterDb() {
  try {
    console.log('Adding approval_status column to song_contributors table...');
    await pool.query(sql);
    console.log('✅ Database altered successfully!');
  } catch (error) {
    console.error('❌ Error updating database:', error);
  } finally {
    await pool.end();
  }
}

alterDb();
