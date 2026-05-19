import { query } from '../config/database';

export const findUserByWallet = async (walletAddress: string) => {
  const result = await query('SELECT * FROM users WHERE wallet = $1', [walletAddress]);
  return result.rows[0];
};

export const findUserByEmail = async (email: string) => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

export const findUserById = async (id: number) => {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

export const createUserWithWallet = async (walletAddress: string, role: string) => {
  const result = await query(
    'INSERT INTO users (wallet, role) VALUES ($1, $2) RETURNING id, wallet, email, role, created_at as "createdAt"',
    [walletAddress, role]
  );
  return result.rows[0];
};

export const createUserWithGoogle = async (email: string, role: string) => {
  const result = await query(
    'INSERT INTO users (email, role) VALUES ($1, $2) RETURNING id, wallet, email, role, created_at as "createdAt"',
    [email, role]
  );
  return result.rows[0];
};

export const createOrUpdateCreatorProfile = async (
  userId: number,
  displayName: string,
  username: string,
  bio: string,
  creatorType: string[],
  twitter: string | null,
  instagram: string | null,
  soundcloud: string | null
) => {
  const result = await query(
    `UPDATE users 
     SET display_name = $1, 
         username = $2, 
         bio = $3, 
         creator_type = $4, 
         twitter = $5, 
         instagram = $6, 
         soundcloud = $7 
     WHERE id = $8 
     RETURNING id, display_name, username, bio, creator_type, twitter, instagram, soundcloud`,
    [displayName, username, bio, creatorType, twitter, instagram, soundcloud, userId]
  );
  return result.rows[0];
};

export const getCreatorProfile = async (userId: number) => {
  const result = await query(
    `SELECT id, display_name, username, bio, creator_type, twitter, instagram, soundcloud 
     FROM users 
     WHERE id = $1`,
    [userId]
  );
  return result.rows[0];
};

export const createOrUpdateFanProfile = async (
  userId: number,
  displayName: string,
  username: string
) => {
  const result = await query(
    `UPDATE users 
     SET display_name = $1, username = $2 
     WHERE id = $3 
     RETURNING id, display_name, username`,
    [displayName, username, userId]
  );
  return result.rows[0];
};

export const getFanProfile = async (userId: number) => {
  const result = await query(
    `SELECT id, display_name, username FROM users WHERE id = $1`,
    [userId]
  );
  return result.rows[0];
};

export const getPublicProfileByUsername = async (username: string) => {
  const result = await query(
    `SELECT id, display_name, username, bio, creator_type, twitter, instagram, soundcloud 
     FROM users 
     WHERE username = $1`,
    [username]
  );
  return result.rows[0];
};

export const isUsernameTaken = async (username: string, excludeUserId?: number) => {
  let queryText = 'SELECT id FROM users WHERE username = $1';
  const params: any[] = [username];
  
  if (excludeUserId) {
    queryText += ' AND id != $2';
    params.push(excludeUserId);
  }
  
  const result = await query(queryText, params);
  return result.rows.length > 0;
};