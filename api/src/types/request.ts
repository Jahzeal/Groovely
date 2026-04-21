import { Request } from 'express';

export interface AuthRequest extends Request {
  userId: number;
  userWallet: string | null;
  userEmail: string | null;
  userRole: string;
}