import { Response } from 'express';
import { AuthRequest } from '../types/request';
import { walletAuth, googleAuth, findUserById } from '../services/authService';
import { findUserByWallet, findUserByEmail } from '../models/userModel';
import { 
  sendSuccess, 
  sendBadRequest, 
  sendUnauthorized,
  sendInternalError,
  sendConflict
} from '../helpers/response';
import { ErrorMessages, SuccessMessages, Patterns } from '../constants';
import { WalletAuthRequest, GoogleAuthRequest } from '../types';


export const walletSignup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { walletAddress, role }: WalletAuthRequest = req.body;

    if (!walletAddress) {
      sendBadRequest(res, ErrorMessages.WALLET_REQUIRED);
      return;
    }

    if (!Patterns.WALLET_ADDRESS.test(walletAddress)) {
      sendBadRequest(res, ErrorMessages.INVALID_WALLET);
      return;
    }

    if (!role) {
      sendBadRequest(res, ErrorMessages.INVALID_ROLE);
      return;
    }

    if (role !== 'creator' && role !== 'fan') {
      sendBadRequest(res, ErrorMessages.INVALID_ROLE);
      return;
    }

    
    const existingUser = await findUserByWallet(walletAddress);
    if (existingUser) {
      sendConflict(res, 'An account with this wallet already exists. Please login instead.');
      return;
    }

    const { token, user } = await walletAuth(walletAddress, role);

    sendSuccess(res, { token, user }, 'Account created successfully');
  } catch (error) {
    console.error('Wallet signup error:', error);
    sendInternalError(res);
  }
};

export const googleSignup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, role }: GoogleAuthRequest = req.body;

    if (!email) {
      sendBadRequest(res, ErrorMessages.EMAIL_REQUIRED);
      return;
    }

    if (!Patterns.EMAIL.test(email)) {
      sendBadRequest(res, 'Please provide a valid email address.');
      return;
    }

    if (!role) {
      sendBadRequest(res, ErrorMessages.INVALID_ROLE);
      return;
    }

    if (role !== 'creator' && role !== 'fan') {
      sendBadRequest(res, ErrorMessages.INVALID_ROLE);
      return;
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      sendConflict(res, 'An account with this email already exists. Please login instead.');
      return;
    }

    const { token, user } = await googleAuth(email, role);

    sendSuccess(res, { token, user }, 'Account created successfully');
  } catch (error) {
    console.error('Google signup error:', error);
    sendInternalError(res);
  }
};



export const walletLogin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { walletAddress, role }: WalletAuthRequest = req.body;

    if (!walletAddress) {
      sendBadRequest(res, ErrorMessages.WALLET_REQUIRED);
      return;
    }

    if (!Patterns.WALLET_ADDRESS.test(walletAddress)) {
      sendBadRequest(res, ErrorMessages.INVALID_WALLET);
      return;
    }

    if (!role) {
      sendBadRequest(res, ErrorMessages.INVALID_ROLE);
      return;
    }

    if (role !== 'creator' && role !== 'fan') {
      sendBadRequest(res, ErrorMessages.INVALID_ROLE);
      return;
    }

    const existingUser = await findUserByWallet(walletAddress);
    if (!existingUser) {
      sendUnauthorized(res, 'No account found with this wallet. Please sign up first.');
      return;
    }

    if (existingUser.role !== role) {
      sendUnauthorized(res, `This account is registered as a ${existingUser.role}, not a ${role}.`);
      return;
    }

    const { token, user } = await walletAuth(walletAddress, role);

    sendSuccess(res, { token, user }, SuccessMessages.USER_LOGGED_IN);
  } catch (error) {
    console.error('Wallet login error:', error);
    sendInternalError(res);
  }
};

export const googleLogin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, role }: GoogleAuthRequest = req.body;

    if (!email) {
      sendBadRequest(res, ErrorMessages.EMAIL_REQUIRED);
      return;
    }

    if (!Patterns.EMAIL.test(email)) {
      sendBadRequest(res, 'Please provide a valid email address.');
      return;
    }

    if (!role) {
      sendBadRequest(res, ErrorMessages.INVALID_ROLE);
      return;
    }

    if (role !== 'creator' && role !== 'fan') {
      sendBadRequest(res, ErrorMessages.INVALID_ROLE);
      return;
    }

    const existingUser = await findUserByEmail(email);
    if (!existingUser) {
      sendUnauthorized(res, 'No account found with this email. Please sign up first.');
      return;
    }

    if (existingUser.role !== role) {
      sendUnauthorized(res, `This account is registered as a ${existingUser.role}, not a ${role}.`);
      return;
    }

    const { token, user } = await googleAuth(email, role);

    sendSuccess(res, { token, user }, SuccessMessages.USER_LOGGED_IN);
  } catch (error) {
    console.error('Google login error:', error);
    sendInternalError(res);
  }
};


export const getMeController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const user = await findUserById(userId);

    if (!user) {
      sendUnauthorized(res, ErrorMessages.USER_NOT_FOUND);
      return;
    }

    const userResponse = {
      id: user.id,
      wallet: user.wallet,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    sendSuccess(res, userResponse, SuccessMessages.USER_RETRIEVED);
  } catch (error) {
    console.error('Get me error:', error);
    sendInternalError(res);
  }
};