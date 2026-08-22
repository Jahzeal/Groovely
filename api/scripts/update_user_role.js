const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Mp5xwjTlDYd0@ep-divine-dust-am90dsvi-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const wallet = '0x4363aAeE1b23bA20f7e14a6F2b5154627DfBc0E6';
    const email = 'jahzealibeh529@gmail.com';

    console.log(`Updating PostgreSQL record for wallet: ${wallet} to role: 'creator'...`);
    const updateRes = await pool.query(
      'UPDATE users SET role = $1, email = $2 WHERE wallet = $3 OR id = 19 RETURNING id, wallet, email, role, display_name',
      ['creator', email, wallet]
    );

    console.log('\n✅ Updated Row(s) in PostgreSQL:');
    console.log(JSON.stringify(updateRes.rows, null, 2));

    const checkAll = await pool.query('SELECT id, wallet, email, role FROM users WHERE id = 19 OR email = $1', [email]);
    console.log('\n=== CURRENT DB STATE ===');
    console.log(JSON.stringify(checkAll.rows, null, 2));

  } catch (err) {
    console.error('Error updating database:', err);
  } finally {
    await pool.end();
  }
}

run();
