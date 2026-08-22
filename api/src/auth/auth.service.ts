import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { generateToken } from '../utils/jwt';

@Injectable()
export class AuthService {
  constructor(private db: DatabaseService) {}

  async findUserByWallet(walletAddress: string) {
    const result = await this.db.query('SELECT * FROM users WHERE wallet = $1', [
      walletAddress,
    ]);
    return result.rows[0];
  }

  async findUserByEmail(email: string) {
    const result = await this.db.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [
      email,
    ]);
    return result.rows[0];
  }

  async findUserById(id: number) {
    const result = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createUserWithWallet(walletAddress: string, role: string) {
    const result = await this.db.query(
      'INSERT INTO users (wallet, role) VALUES ($1, $2) RETURNING id, wallet, email, role, created_at as "createdAt"',
      [walletAddress, role],
    );
    return result.rows[0];
  }

  async createUserWithGoogle(email: string, role: string, wallet?: string) {
    const result = await this.db.query(
      'INSERT INTO users (email, role, wallet) VALUES ($1, $2, $3) RETURNING id, wallet, email, role, created_at as "createdAt"',
      [email, role, wallet || null],
    );
    return result.rows[0];
  }

  async updateUserRole(id: number, role: string) {
    const result = await this.db.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, wallet, email, role, created_at as "createdAt"',
      [role, id],
    );
    return result.rows[0];
  }

  async updateUserWallet(id: number, wallet: string) {
    const result = await this.db.query(
      'UPDATE users SET wallet = $1 WHERE id = $2 RETURNING id, wallet, email, role, created_at as "createdAt"',
      [wallet, id],
    );
    return result.rows[0];
  }

  async walletAuth(walletAddress: string, role: string) {
    let user = await this.findUserByWallet(walletAddress);
    let isNewUser = false;

    if (!user) {
      user = await this.createUserWithWallet(walletAddress, role);
      isNewUser = true;
    }

    const token = generateToken(user.id, user.role, user.wallet, user.email);

    const userResponse = {
      id: user.id,
      wallet: user.wallet,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt || user.created_at,
    };

    return { token, user: userResponse, isNewUser };
  }

  async googleAuth(email: string, role?: string, wallet?: string) {
    let user = await this.findUserByEmail(email);
    let isNewUser = false;

    if (!user) {
      user = await this.createUserWithGoogle(email, role || 'creator', wallet);
      isNewUser = true;
    } else if (wallet && !user.wallet) {
      user = await this.updateUserWallet(user.id, wallet);
    }

    const token = generateToken(user.id, user.role, user.wallet, user.email);

    const userResponse = {
      id: user.id,
      wallet: user.wallet,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt || user.created_at,
    };

    return { token, user: userResponse, isNewUser };
  }
}

