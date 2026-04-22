import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_Mp5xwjTlDYd0@ep-divine-dust-am90dsvi-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function clearDatabase(): Promise<void> {
  try {
    await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await pool.end();
  }
}

clearDatabase();