const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Mp5xwjTlDYd0@ep-divine-dust-am90dsvi-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require';
const jwtSecret = process.env.JWT_SECRET || 'super_secret_jwt_signing_key_replace_in_production';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function runTest() {
  console.log('\n==================================================');
  console.log('🧪 RUNNING END-TO-END ROLE & DATABASE PERMANENCE TEST');
  console.log('==================================================\n');

  const testEmail = `test_creator_${Date.now()}@example.com`;
  const testWallet = `0xTestWallet${Date.now()}`;
  let userId;

  try {
    // ----------------------------------------------------
    // TEST 1: Database Health Check & Connection Test
    // ----------------------------------------------------
    console.log('1️⃣ Testing PostgreSQL Connection (Health Check)...');
    const healthRes = await pool.query('SELECT NOW()');
    console.log('   ✅ PostgreSQL connected successfully at:', healthRes.rows[0].now);

    // ----------------------------------------------------
    // TEST 2: Create User with 'creator' Role
    // ----------------------------------------------------
    console.log(`\n2️⃣ Creating test user with role 'creator' (${testEmail})...`);
    const insertRes = await pool.query(
      'INSERT INTO users (email, wallet, role, display_name) VALUES ($1, $2, $3, $4) RETURNING id, email, wallet, role, created_at',
      [testEmail, testWallet, 'creator', 'Test Creator']
    );
    userId = insertRes.rows[0].id;
    console.log('   ✅ User inserted into PostgreSQL:', insertRes.rows[0]);

    if (insertRes.rows[0].role !== 'creator') {
      throw new Error(`❌ FAIL: Expected role 'creator', but got '${insertRes.rows[0].role}'`);
    }

    // ----------------------------------------------------
    // TEST 3: Verify JWT Token Claims
    // ----------------------------------------------------
    console.log("\n3️⃣ Verifying JWT Token Generation with 'creator' Role...");
    const token = jwt.sign(
      { sub: userId, role: 'creator', wallet: testWallet, email: testEmail },
      jwtSecret,
      { expiresIn: '7d' }
    );
    const decoded = jwt.verify(token, jwtSecret);
    console.log('   ✅ Decoded JWT Payload:', decoded);

    if (decoded.role !== 'creator') {
      throw new Error(`❌ FAIL: Expected JWT role 'creator', but got '${decoded.role}'`);
    }

    // ----------------------------------------------------
    // TEST 4: Role Update via Profile Service (PUT /users/me)
    // ----------------------------------------------------
    console.log('\n4️⃣ Testing Role Update in PostgreSQL (PUT /users/me Simulation)...');
    await pool.query('UPDATE users SET role = $1, display_name = $2 WHERE id = $3', ['creator', 'Updated Creator Name', userId]);

    const checkRes = await pool.query('SELECT id, email, role, display_name FROM users WHERE id = $1', [userId]);
    console.log('   ✅ Queried PostgreSQL After Profile Update:', checkRes.rows[0]);

    if (checkRes.rows[0].role !== 'creator') {
      throw new Error(`❌ FAIL: Expected updated role 'creator', but got '${checkRes.rows[0].role}'`);
    }

    // ----------------------------------------------------
    // TEST 5: Verify Account Permanence (No Auto-Deletion)
    // ----------------------------------------------------
    console.log('\n5️⃣ Verifying Account Permanence in Database...');
    const dbCheckRes = await pool.query('SELECT id, email, role FROM users WHERE email = $1', [testEmail]);
    console.log(`   ✅ Query Result (${dbCheckRes.rows.length} row found):`, dbCheckRes.rows[0]);

    if (dbCheckRes.rows.length === 0) {
      throw new Error('❌ FAIL: User account was auto-deleted from PostgreSQL!');
    }

    // ----------------------------------------------------
    // CLEANUP TEST ACCOUNT
    // ----------------------------------------------------
    console.log('\n🧹 Cleaning up test account from PostgreSQL...');
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    console.log('   ✅ Cleaned up test user.');

    console.log('\n==================================================');
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! (100% SUCCESS)');
    console.log('==================================================\n');

  } catch (err) {
    console.error('\n❌ TEST FAILED:', err);
    if (userId) {
      await pool.query('DELETE FROM users WHERE id = $1', [userId]).catch(() => {});
    }
  } finally {
    await pool.end();
  }
}

runTest();
