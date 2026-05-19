export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const;

export const UserRole = {
  CREATOR: 'creator',
  FAN: 'fan'
} as const;


export const SuccessMessages = {
  USER_CREATED: 'Account created successfully',
  USER_LOGGED_IN: 'Login successful',
  USER_RETRIEVED: 'User information retrieved successfully',
  CREATOR_DATA_FETCHED: 'Creator data retrieved successfully',
  FAN_DATA_FETCHED: 'Fan data retrieved successfully'
} as const;


export const ErrorMessages = {
  
  NO_TOKEN: 'You are not logged in. Please login to continue.',
  INVALID_TOKEN: 'Your session has expired or is invalid. Please login again.',
  UNAUTHORIZED: 'You do not have permission to access this resource.',
  
  USER_NOT_FOUND: 'We could not find an account with that information.',
  USER_ALREADY_EXISTS: 'An account with this email or wallet already exists.',
  INVALID_ROLE: 'Please select either Creator or Fan as your role.',
  
  WALLET_REQUIRED: 'Wallet address is required to sign up.',
  INVALID_WALLET: 'The wallet address you provided is not valid.',
  
  EMAIL_REQUIRED: 'Email address is required to sign up with Google.',
  GOOGLE_AUTH_FAILED: 'Google sign in failed. Please try again.',
  
  ACCESS_DENIED: 'You do not have access to this feature. Your account is not authorized.',
  
  INTERNAL_ERROR: 'Something went wrong on our server. Please try again later.',
  ROUTE_NOT_FOUND: 'The page or resource you are looking for does not exist.'
} as const;


export const Patterns = {
  WALLET_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
} as const;


export const JwtConfig = {
  EXPIRES_IN: '7d',
  ALGORITHM: 'HS256' as const
} as const;


export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export const PaginationDefaults = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100
} as const;