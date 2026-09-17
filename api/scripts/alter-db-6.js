const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const sql = `
-- Publish all free tracks so they appear on Marketplace and Explore
UPDATE tracks 
SET status = 'published' 
WHERE (payment_model = 'none' OR visibility = 'public') 
  AND (status = 'draft' OR status IS NULL);
`;

async function alterDb() {
  try {
    console.log('Publishing existing free/public tracks in database...');
    const result = await pool.query(sql);
    console.log(`✅ Database updated successfully! (${result.rowCount} tracks updated)`);
  } catch (error) {
    console.error('❌ Error updating database:', error);
  } finally {
    await pool.end();
  }
}

alterDb();
