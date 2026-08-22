const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Mp5xwjTlDYd0@ep-divine-dust-am90dsvi-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const email = 'jahzealibeh529@gmail.com';
    
    // Query exact email match
    const userRes = await pool.query('SELECT id, wallet, email, role, display_name, created_at FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    console.log(`\n=== ACCOUNT SEARCH FOR: ${email} ===`);
    if (userRes.rows.length === 0) {
      console.log('Result: Account NOT found in database (0 matching rows).');
    } else {
      console.log(`Found ${userRes.rows.length} matching account record(s):`);
      console.log(JSON.stringify(userRes.rows, null, 2));
    }

    // Query all registered users
    const allUsersRes = await pool.query('SELECT id, wallet, email, role, display_name, created_at FROM users ORDER BY id DESC');
    console.log(`\n=== ALL ACCOUNTS IN DATABASE (${allUsersRes.rows.length} total) ===`);
    console.log(JSON.stringify(allUsersRes.rows, null, 2));

  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await pool.end();
  }
}

run();
