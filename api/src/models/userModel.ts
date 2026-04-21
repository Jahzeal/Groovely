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