import { generateToken } from '../utils/jwt';
import { UserResponse } from '../types';
import {
  findUserByWallet,
  findUserByEmail,
  findUserById,
  createUserWithWallet,
  createUserWithGoogle,
} from '../models/userModel';

export { findUserByWallet, findUserByEmail, findUserById, createUserWithWallet, createUserWithGoogle };

export const walletAuth = async (walletAddress: string, role: string) => {
  let user = await findUserByWallet(walletAddress);

  if (!user) {
    user = await createUserWithWallet(walletAddress, role);
  }

  const token = generateToken(user.id, user.role, user.wallet, user.email);

  const userResponse: UserResponse = {
    id: user.id,
    wallet: user.wallet,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };

  return { token, user: userResponse };
};

export const googleAuth = async (email: string, role?: string) => {
  let user = await findUserByEmail(email);

  if (!user) {
        user = await createUserWithGoogle(email, role || 'fan');
  }
  // Existing user - keep their existing role, ignore the role parameter

  const token = generateToken(user.id, user.role, user.wallet, user.email);

  const userResponse: UserResponse = {
    id: user.id,
    wallet: user.wallet,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };

  return { token, user: userResponse };
};