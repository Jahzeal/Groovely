const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    console.log('Querying Database...');

    // 1. Check users
    const usersRes = await pool.query('SELECT * FROM users');
    console.log(`\n--- USERS (${usersRes.rows.length}) ---`);
    usersRes.rows.forEach(u => {
      console.log(`ID: ${u.id}, Wallet: ${u.wallet}, DisplayName: ${u.display_name}, Email: ${u.email}`);
    });

    // 2. Check editions
    const editionsRes = await pool.query('SELECT * FROM editions');
    console.log(`\n--- EDITIONS (${editionsRes.rows.length}) ---`);
    editionsRes.rows.forEach(e => {
      console.log(`ID: ${e.id}, SongID: ${e.song_id}, EditionType: ${e.edition_type}, MintPriceUSDC: ${e.mint_price_usdc}, ContractEditionID: ${e.contract_edition_id}`);
    });

    // 3. Check contributors
    const contRes = await pool.query('SELECT * FROM song_contributors');
    console.log(`\n--- CONTRIBUTORS (${contRes.rows.length}) ---`);
    contRes.rows.forEach(c => {
      console.log(`ID: ${c.id}, SongID: ${c.song_id}, Wallet: ${c.wallet_address}, BasisPoints: ${c.basis_points}, Role: ${c.role}`);
    });

    // 4. Search for 2.95 or 0x221...c9e5 specifically
    console.log('\n--- SEARCHING FOR TARGET VALUES ---');
    const searchWallet = await pool.query("SELECT * FROM users WHERE wallet ILIKE '%221%' OR wallet ILIKE '%c9e5%'");
    console.log(`Matching users:`, searchWallet.rows);

    const searchContributor = await pool.query("SELECT * FROM song_contributors WHERE wallet_address ILIKE '%221%' OR wallet_address ILIKE '%c9e5%'");
    console.log(`Matching contributors:`, searchContributor.rows);

    const searchEditions = await pool.query("SELECT * FROM editions WHERE mint_price_usdc = 2.95");
    console.log(`Matching editions with price 2.95:`, searchEditions.rows);

  } catch (error) {
    console.error('Error running check:', error);
  } finally {
    await pool.end();
  }
}

main();
