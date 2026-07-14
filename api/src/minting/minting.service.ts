import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { IpfsService } from '../ipfs/ipfs.service';

export interface ContributorDto {
  wallet_address: string;
  basis_points: number;    // out of 10000
  role?: string;
  display_name?: string;
  user_id?: number;
}

export interface CreateSongDto {
  title: string;
  track_id?: number;
  metadata_uri?: string;
}

export interface CreateEditionDto {
  edition_type: 'open' | 'fan' | 'collector' | 'founder';
  max_supply?: number;     // undefined or 0 = unlimited
  mint_price_usdc: number;
}

export interface ConfirmMintDto {
  edition_id: number;
  buyer_user_id?: number;
  buyer_wallet: string;
  tx_hash: string;
  token_id: number;
  amount?: number;
  license_type?: string;
}

@Injectable()
export class MintingService {
  constructor(
    private db: DatabaseService,
    private ipfs: IpfsService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // Songs
  // ─────────────────────────────────────────────────────────────────────────

  async createSong(userId: number, dto: CreateSongDto) {
    let metadataUri = dto.metadata_uri || null;

    if (dto.track_id) {
      // Fetch track details to generate metadata JSON
      const trackResult = await this.db.query(
        `SELECT * FROM tracks WHERE id = $1 AND user_id = $2`,
        [dto.track_id, userId],
      );
      const track = trackResult.rows[0];

      if (track) {
        // Construct standard NFT metadata
        const metadata = {
          name: track.title || dto.title,
          description: track.description || '',
          image: track.cover_url || '',
          animation_url: track.audio_url || '',
          attributes: [
            { trait_type: 'Category', value: track.category || 'music' },
            { trait_type: 'Explicit', value: track.explicit ? 'Yes' : 'No' },
            ...(track.bpm ? [{ trait_type: 'BPM', value: track.bpm }] : []),
            ...(track.key ? [{ trait_type: 'Key', value: track.key }] : []),
            ...(track.isrc ? [{ trait_type: 'ISRC', value: track.isrc }] : []),
          ],
        };

        try {
          // Upload metadata JSON to IPFS
          metadataUri = await this.ipfs.uploadJson(metadata, `${track.title || dto.title} Metadata`);
        } catch (err) {
          console.error('Failed to upload song metadata to IPFS:', err);
          // Fallback to manual / placeholder if IPFS upload fails
        }
      }
    }

    const result = await this.db.query(
      `INSERT INTO songs (user_id, track_id, title, metadata_uri, status)
       VALUES ($1, $2, $3, $4, 'draft')
       RETURNING *`,
      [userId, dto.track_id || null, dto.title, metadataUri],
    );
    return result.rows[0];
  }

  async getSong(songId: number) {
    const songResult = await this.db.query(
      `SELECT s.*, u.display_name as creator_name, u.username as creator_username
       FROM songs s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = $1`,
      [songId],
    );
    if (!songResult.rows[0]) throw new NotFoundException('Song not found');

    const [editionsResult, contributorsResult] = await Promise.all([
      this.db.query('SELECT * FROM editions WHERE song_id = $1 ORDER BY created_at ASC', [songId]),
      this.db.query('SELECT * FROM song_contributors WHERE song_id = $1', [songId]),
    ]);

    return {
      song: songResult.rows[0],
      editions: editionsResult.rows,
      contributors: contributorsResult.rows,
    };
  }

  async getMySongs(userId: number) {
    const result = await this.db.query(
      `SELECT s.*,
              COUNT(DISTINCT e.id)::int as edition_count,
              COALESCE(SUM(e.minted_supply), 0)::int as total_minted
       FROM songs s
       LEFT JOIN editions e ON e.song_id = s.id
       WHERE s.user_id = $1
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async updateSongContractId(songId: number, contractSongId: number) {
    await this.db.query(
      `UPDATE songs SET contract_song_id = $1, status = 'published', updated_at = NOW()
       WHERE id = $2`,
      [contractSongId, songId],
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Contributors
  // ─────────────────────────────────────────────────────────────────────────

  async setContributors(songId: number, userId: number, contributors: ContributorDto[]) {
    // Verify song belongs to user
    const songCheck = await this.db.query(
      'SELECT id FROM songs WHERE id = $1 AND user_id = $2',
      [songId, userId],
    );
    if (!songCheck.rows[0]) throw new NotFoundException('Song not found');

    // Validate splits sum to exactly 10000
    const total = contributors.reduce((acc, c) => acc + c.basis_points, 0);
    if (total !== 10000) {
      throw new BadRequestException(
        `Contributor splits must sum to 10000 basis points (100%). Got ${total}.`,
      );
    }
    if (contributors.length > 20) {
      throw new BadRequestException('Maximum 20 contributors allowed.');
    }

    // Replace all contributors in a transaction
    await this.db.query('BEGIN');
    try {
      await this.db.query('DELETE FROM song_contributors WHERE song_id = $1', [songId]);
      for (const c of contributors) {
        await this.db.query(
          `INSERT INTO song_contributors (song_id, user_id, wallet_address, basis_points, role, display_name)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [songId, c.user_id || null, c.wallet_address, c.basis_points, c.role || null, c.display_name || null],
        );
      }
      await this.db.query('COMMIT');
    } catch (err) {
      await this.db.query('ROLLBACK');
      throw err;
    }

    return this.db.query('SELECT * FROM song_contributors WHERE song_id = $1', [songId])
      .then(r => r.rows);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Editions
  // ─────────────────────────────────────────────────────────────────────────

  async createEdition(songId: number, userId: number, dto: CreateEditionDto) {
    // Verify ownership
    const songCheck = await this.db.query(
      'SELECT id FROM songs WHERE id = $1 AND user_id = $2',
      [songId, userId],
    );
    if (!songCheck.rows[0]) throw new NotFoundException('Song not found');

    const unlimited = !dto.max_supply || dto.max_supply === 0;
    const result = await this.db.query(
      `INSERT INTO editions (song_id, edition_type, max_supply, mint_price_usdc, unlimited)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [songId, dto.edition_type, unlimited ? null : dto.max_supply, dto.mint_price_usdc, unlimited],
    );
    return result.rows[0];
  }

  async updateEditionContractId(editionId: number, contractEditionId: number, txHash: string) {
    await this.db.query('BEGIN');
    try {
      await this.db.query(
        `UPDATE editions
         SET contract_edition_id = $1, deploy_tx_hash = $2
         WHERE id = $3`,
        [contractEditionId, txHash, editionId],
      );

      // Automatically update the associated track's status to 'active' (Live)
      await this.db.query(
        `UPDATE tracks
         SET status = 'active'
         WHERE id = (
           SELECT s.track_id 
           FROM songs s
           JOIN editions e ON s.id = e.song_id
           WHERE e.id = $1
         )`,
        [editionId],
      );
      await this.db.query('COMMIT');
    } catch (err) {
      await this.db.query('ROLLBACK');
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Purchase confirmation (called after on-chain mint succeeds)
  // ─────────────────────────────────────────────────────────────────────────

  async confirmMint(dto: ConfirmMintDto) {
    const editionResult = await this.db.query(
      `SELECT e.*, s.user_id as creator_user_id
       FROM editions e
       JOIN songs s ON e.song_id = s.id
       WHERE e.id = $1`,
      [dto.edition_id],
    );
    if (!editionResult.rows[0]) throw new NotFoundException('Edition not found');

    const edition = editionResult.rows[0];
    const amount = dto.amount || 1;

    await this.db.query('BEGIN');
    try {
      // Record purchase
      await this.db.query(
        `INSERT INTO purchases
           (user_id, track_id, edition_id, amount, currency, tx_hash, token_id, license_type, buyer_wallet, purchased_at)
         VALUES ($1, $2, $3, $4, 'USDC', $5, $6, $7, $8, NOW())`,
        [
          dto.buyer_user_id || null,
          edition.song_id,
          dto.edition_id,
          edition.mint_price_usdc * amount,
          dto.tx_hash,
          dto.token_id,
          dto.license_type || edition.edition_type,
          dto.buyer_wallet,
        ],
      );

      // Increment minted supply
      await this.db.query(
        'UPDATE editions SET minted_supply = minted_supply + $1 WHERE id = $2',
        [amount, dto.edition_id],
      );

      await this.db.query('COMMIT');
    } catch (err) {
      await this.db.query('ROLLBACK');
      throw err;
    }

    return { success: true, tx_hash: dto.tx_hash, token_id: dto.token_id };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Purchase check (for 40s limit enforcement)
  // ─────────────────────────────────────────────────────────────────────────

  async isPurchased(userId: number, trackId: number): Promise<boolean> {
    const result = await this.db.query(
      `SELECT id FROM purchases
       WHERE user_id = $1 AND track_id = $2
       LIMIT 1`,
      [userId, trackId],
    );
    return result.rows.length > 0;
  }

  async getUserPurchases(userId: number) {
    const result = await this.db.query(
      `SELECT
         p.*,
         e.edition_type,
         e.mint_price_usdc,
         t.title,
         t.cover_url,
         t.audio_url,
         u.display_name as creator_name
       FROM purchases p
       LEFT JOIN editions e ON p.edition_id = e.id
       LEFT JOIN tracks t ON p.track_id = t.id
       LEFT JOIN users u ON t.user_id = u.id
       WHERE p.user_id = $1
       ORDER BY p.purchased_at DESC`,
      [userId],
    );
    return result.rows;
  }
}
