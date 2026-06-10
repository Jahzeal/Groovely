const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const alterTracks = `
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS explicit BOOLEAN DEFAULT false;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS category VARCHAR;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS bpm INTEGER;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS key VARCHAR;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS isrc VARCHAR;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS usage_rights TEXT[];
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'active';
`;

const createPurchases = `
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    track_id INTEGER REFERENCES tracks(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

async function alterDb() {
  try {
    console.log('Adding missing columns to tracks table and creating purchases table...');
    await pool.query(alterTracks);
    await pool.query(createPurchases);
    console.log('✅ Database schema updated successfully!');
  } catch (error) {
    console.error('❌ Error updating database:', error);
  } finally {
    await pool.end();
  }
}

alterDb();
