export interface User {
  id: number;
  wallet: string | null;
  email: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: number;
  wallet: string | null;
  email: string | null;
  role: string;
  createdAt: Date;
}

export interface WalletAuthRequest {
  walletAddress: string;
  role: 'creator' | 'fan';
}

export interface GoogleAuthRequest {
  email: string;
  role: 'creator' | 'fan';
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface JwtPayload {
  id: number;
  wallet: string | null;
  email: string | null;
  role: string;
}

export interface CreatorProfile {
  userId: number;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface FanProfile {
  userId: number;
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ErrorResponse {
  success: false;
  error: string;
}

export interface SuccessResponse<T = any> {
  success: true;
  message?: string;
  data?: T;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type UserRoleType = 'creator' | 'fan';
export type NodeEnv = 'development' | 'production' | 'test';