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

  async createUserWithGoogle(email: string, role: string) {
    const result = await this.db.query(
      'INSERT INTO users (email, role) VALUES ($1, $2) RETURNING id, wallet, email, role, created_at as "createdAt"',
      [email, role],
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

  async googleAuth(email: string, role?: string) {
    let user = await this.findUserByEmail(email);
    let isNewUser = false;

    if (!user) {
      user = await this.createUserWithGoogle(email, role || 'fan');
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
}

