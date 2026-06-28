const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runQueries() {
  try {
    const trackId = 11;
    const userId = 1; // Assuming a valid user ID

    console.log('--- 1. Querying track details ---');
    const trackResult = await pool.query(
      `SELECT 
        t.id,
        t.title,
        t.description,
        t.cover_url,
        t.audio_url,
        t.category,
        t.bpm,
        t.key,
        t.price,
        t.currency,
        t.usage_rights as license_types,
        t.created_at,
        u.id as creator_id,
        u.display_name as creator_name,
        u.username as creator_username
       FROM tracks t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = $1 AND t.visibility = 'public'`,
      [trackId]
    );
    const track = trackResult.rows[0];
    console.log('Track Details Success:', track);

    if (track) {
      console.log('\n--- 2. Querying more from creator ---');
      const moreResult = await pool.query(
        `SELECT 
          t.id,
          t.title,
          t.cover_url,
          t.price,
          t.currency,
          t.usage_rights as license_types
         FROM tracks t
         WHERE t.user_id = $1 AND t.id != $2 AND t.visibility = 'public'
         ORDER BY t.created_at DESC
         LIMIT 4`,
        [track.creator_id, trackId]
      );
      console.log('More From Creator Success:', moreResult.rows);
    }

    console.log('\n--- 3. Querying isPurchased ---');
    const purchasedResult = await pool.query(
      `SELECT id FROM purchases
       WHERE user_id = $1 AND track_id = $2
       LIMIT 1`,
      [userId, trackId]
    );
    console.log('Is Purchased Success:', purchasedResult.rows);

  } catch (err) {
    console.error('SQL Execution Error:', err);
  } finally {
    await pool.end();
  }
}

runQueries();
