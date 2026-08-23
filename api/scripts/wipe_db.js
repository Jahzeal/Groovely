const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.jvdrivqfmhtwesfdbhvh:Groveley12345.@aws-0-eu-west-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function wipeDatabase() {
  try {
    const res = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
    console.log('Public tables to truncate:', res.rows.map(r => r.tablename));

    for (const row of res.rows) {
      if (row.tablename === '_prisma_migrations' || row.tablename === 'migrations') continue;
      console.log(`Truncating ${row.tablename}...`);
      await pool.query(`TRUNCATE TABLE "${row.tablename}" CASCADE`);
    }

    console.log('✅ Database cleared completely and successfully!');
  } catch (err) {
    console.error('Error clearing database:', err);
  } finally {
    await pool.end();
  }
}

wipeDatabase();
