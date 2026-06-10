const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sql = `
-- ── Songs (off-chain mirror of on-chain Song struct) ───────────────────────
CREATE TABLE IF NOT EXISTS songs (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER REFERENCES users(id) ON DELETE CASCADE,
  track_id          INTEGER REFERENCES tracks(id) ON DELETE SET NULL,
  title             VARCHAR(255) NOT NULL,
  contract_song_id  INTEGER,          -- on-chain Song ID after createSong()
  metadata_uri      TEXT,             -- IPFS URI
  status            VARCHAR(20) DEFAULT 'draft', -- draft | published | minted
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── Song contributors (mirrors setContributors() call) ─────────────────────
CREATE TABLE IF NOT EXISTS song_contributors (
  id              SERIAL PRIMARY KEY,
  song_id         INTEGER REFERENCES songs(id) ON DELETE CASCADE,
  user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
  wallet_address  VARCHAR(42) NOT NULL,
  basis_points    INTEGER NOT NULL CHECK (basis_points > 0 AND basis_points <= 10000),
  role            VARCHAR(50),         -- artist | producer | writer | label | manager
  display_name    VARCHAR(255),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Editions (mirrors on-chain Edition struct) ──────────────────────────────
CREATE TABLE IF NOT EXISTS editions (
  id                  SERIAL PRIMARY KEY,
  song_id             INTEGER REFERENCES songs(id) ON DELETE CASCADE,
  edition_type        VARCHAR(50) NOT NULL,    -- open | fan | collector | founder
  contract_edition_id INTEGER,                 -- on-chain token ID after createEdition()
  max_supply          INTEGER,                 -- NULL = unlimited
  minted_supply       INTEGER DEFAULT 0,
  mint_price_usdc     NUMERIC(20, 6),          -- price in USDC
  unlimited           BOOLEAN DEFAULT false,
  active              BOOLEAN DEFAULT true,
  deploy_tx_hash      VARCHAR(66),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── Extend purchases table ──────────────────────────────────────────────────
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS edition_id  INTEGER REFERENCES editions(id) ON DELETE SET NULL;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS tx_hash     VARCHAR(66);
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS token_id    INTEGER;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS license_type VARCHAR(50);
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS buyer_wallet VARCHAR(42);

-- ── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_songs_user_id       ON songs(user_id);
CREATE INDEX IF NOT EXISTS idx_songs_status        ON songs(status);
CREATE INDEX IF NOT EXISTS idx_editions_song_id    ON editions(song_id);
CREATE INDEX IF NOT EXISTS idx_contributors_song   ON song_contributors(song_id);
CREATE INDEX IF NOT EXISTS idx_purchases_edition   ON purchases(edition_id);
CREATE INDEX IF NOT EXISTS idx_purchases_tx        ON purchases(tx_hash);
`;

async function run() {
  try {
    console.log('🔧 Running migration: minting tables...');
    await pool.query(sql);
    console.log('✅ Migration complete — songs, editions, song_contributors tables created.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
