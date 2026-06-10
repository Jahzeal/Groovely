import * as jwt from 'jsonwebtoken';

export interface CustomJwtPayload extends jwt.JwtPayload {
  id: number;
  wallet: string | null;
  email: string | null;
  role: string;
}

const getJwtSecret = () => process.env.JWT_SECRET || 'session_secret';

export const generateToken = (
  userId: number,
  role: string,
  wallet: string | null = null,
  email: string | null = null
): string => {
  const payload = {
    id: userId,
    wallet,
    email,
    role,
  };

  const token = jwt.sign(payload, getJwtSecret(), {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
  });

  return token;
};

export const verifyToken = (token: string): CustomJwtPayload => {
  const decoded = jwt.verify(token, getJwtSecret()) as CustomJwtPayload;
  return decoded;
};

export const decodeToken = (token: string): CustomJwtPayload | null => {
  const decoded = jwt.decode(token) as CustomJwtPayload | null;
  return decoded;
};

export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as CustomJwtPayload | null;
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const expirationDate = new Date(decoded.exp * 1000);
    return expirationDate < new Date();
  } catch {
    return true;
  }
};
