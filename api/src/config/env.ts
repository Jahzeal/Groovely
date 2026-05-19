import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const requiredEnvVars = ['PORT', 'DATABASE_URL', 'JWT_SECRET', 'CLIENT_URL'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
};

export const dbConfig = {
  url: process.env.DATABASE_URL as string,
};

export const jwtConfig = {
  secret: process.env.JWT_SECRET as string,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

export const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  isConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
};

export const corsConfig = {
  origin: config.clientUrl,
  credentials: true,
};

export const logConfig = {
  level: process.env.LOG_LEVEL || 'info',
  prettyPrint: config.nodeEnv === 'development',
};

export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  max: 100,
};

export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';
export const isTest = config.nodeEnv === 'test';