const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.jvdrivqfmhtwesfdbhvh:Groveley12345.@aws-0-eu-west-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log('--- Querying by Email (injewilliams@gmail.com) ---');
    const users = await pool.query('SELECT * FROM users WHERE email ILIKE $1 OR username ILIKE $1', ['%injewilliams%']);
    console.log('Users found:', JSON.stringify(users.rows, null, 2));

    if (users.rows.length > 0) {
      for (const u of users.rows) {
        console.log(`\n--- Creator Profile for User ID ${u.id} ---`);
        const prof = await pool.query('SELECT * FROM creator_profiles WHERE user_id = $1', [u.id]);
        console.log(JSON.stringify(prof.rows, null, 2));

        console.log(`\n--- Tracks for User ID ${u.id} ---`);
        const tracks = await pool.query('SELECT * FROM tracks WHERE creator_id = $1', [u.id]);
        console.log(JSON.stringify(tracks.rows, null, 2));
      }
    } else {
      console.log('\nNo exact match for %injewilliams%. Listing recent 10 users in DB:');
      const recent = await pool.query('SELECT id, email, username, role, wallet, display_name, created_at FROM users ORDER BY id DESC LIMIT 10');
      console.log(JSON.stringify(recent.rows, null, 2));
    }
  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await pool.end();
  }
}

main();
