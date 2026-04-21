import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/request';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import { sendUnauthorized } from '../helpers/response';
import { ErrorMessages } from '../constants';

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      sendUnauthorized(res, ErrorMessages.NO_TOKEN);
      return;
    }

    const decoded = verifyToken(token);

    req.userId = decoded.id;
    req.userWallet = decoded.wallet;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    sendUnauthorized(res, ErrorMessages.INVALID_TOKEN);
    return;
  }
};