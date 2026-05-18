import {
  createOrUpdateCreatorProfile,
  getCreatorProfile,
  createOrUpdateFanProfile,
  getFanProfile,
  getPublicProfileByUsername,
  isUsernameTaken,
  findUserById
} from '../models/userModel';

const USERNAME_REGEX = /^[A-Za-z][A-Za-z0-9_]{2,29}$/;
const DISPLAY_NAME_REGEX = /^.{2,50}$/;
const MAX_BIO_LENGTH = 160;
const VALID_CREATOR_TYPES = ['skit makers', 'podcasters', 'artists', 'producers'];

export const validateUsername = (username: string): { valid: boolean; error?: string } => {
  if (!username || username.trim() === '') {
    return { valid: false, error: 'Username is required' };
  }

  if (!USERNAME_REGEX.test(username)) {
    return {
      valid: false,
      error: 'Username must start with a letter, be 3-30 characters long, and can only contain letters, numbers, and underscores'
    };
  }

  return { valid: true };
};

export const validateDisplayName = (displayName: string): { valid: boolean; error?: string } => {
  if (!displayName || displayName.trim() === '') {
    return { valid: false, error: 'Display name is required' };
  }

  if (!DISPLAY_NAME_REGEX.test(displayName)) {
    return { valid: false, error: 'Display name must be between 2 and 50 characters' };
  }

  return { valid: true };
};

export const validateBio = (bio: string): { valid: boolean; error?: string } => {
  if (bio && bio.length > MAX_BIO_LENGTH) {
    return { valid: false, error: `Bio cannot exceed ${MAX_BIO_LENGTH} characters` };
  }

  return { valid: true };
};

export const validateCreatorTypes = (creatorTypes: string[]): { valid: boolean; error?: string } => {
  if (!creatorTypes || creatorTypes.length === 0) {
    return { valid: false, error: 'At least one creator type is required' };
  }

  for (const type of creatorTypes) {
    if (!VALID_CREATOR_TYPES.includes(type)) {
      return { valid: false, error: `Invalid creator type: ${type}. Valid types: ${VALID_CREATOR_TYPES.join(', ')}` };
    }
  }

  return { valid: true };
};

export const createCreatorProfile = async (
  userId: number,
  displayName: string,
  username: string,
  bio: string,
  creatorTypes: string[],
  twitter: string | null,
  instagram: string | null,
  soundcloud: string | null,
  avatarUrl: string | null
) => {
  const usernameTaken = await isUsernameTaken(username);
  if (usernameTaken) {
    throw new Error('Username already taken');
  }

  const profile = await createOrUpdateCreatorProfile(
    userId, displayName, username, bio, creatorTypes, twitter, instagram, soundcloud, avatarUrl
  );

  return profile;
};

export const updateCreatorProfile = async (
  userId: number,
  displayName: string,
  username: string,
  bio: string,
  creatorTypes: string[],
  twitter: string | null,
  instagram: string | null,
  soundcloud: string | null,
  avatarUrl: string | undefined
) => {
  const usernameTaken = await isUsernameTaken(username, userId);
  if (usernameTaken) {
    throw new Error('Username already taken');
  }

  const profile = await createOrUpdateCreatorProfile(
    userId, displayName, username, bio, creatorTypes, twitter, instagram, soundcloud, avatarUrl
  );

  return profile;
};

export const getCreatorProfileById = async (userId: number) => {
  const profile = await getCreatorProfile(userId);

  if (!profile) {
    throw new Error('Profile not found');
  }

  return profile;
};

export const createFanProfile = async (
  userId: number,
  displayName: string,
  username: string,
  avatarUrl: string | null
) => {
  const usernameTaken = await isUsernameTaken(username);
  if (usernameTaken) {
    throw new Error('Username already taken');
  }

  const profile = await createOrUpdateFanProfile(userId, displayName, username, avatarUrl);

  return profile;
};

export const updateFanProfile = async (
  userId: number,
  displayName: string,
  username: string,
  avatarUrl: string | undefined
) => {
  const usernameTaken = await isUsernameTaken(username, userId);
  if (usernameTaken) {
    throw new Error('Username already taken');
  }

  const profile = await createOrUpdateFanProfile(userId, displayName, username, avatarUrl);

  return profile;
};

export const getFanProfileById = async (userId: number) => {
  const profile = await getFanProfile(userId);

  if (!profile) {
    throw new Error('Profile not found');
  }

  return profile;
};

export const getPublicProfile = async (username: string) => {
  const profile = await getPublicProfileByUsername(username);

  if (!profile) {
    throw new Error('Profile not found');
  }

  const user = await findUserById(profile.id);

  return {
    ...profile,
    role: user?.role
  };
};