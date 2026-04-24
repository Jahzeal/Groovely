import cloudinary from '../config/cloudinary';
import {
  createTrack,
  getTracksByUserId,
  getTrackById,
  updateTrack,
  deleteTrack
} from '../models/trackModel';
import { UploadedFile } from 'express-fileupload';

// File size limits
const MAX_AUDIO_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Allowed audio formats
const ALLOWED_AUDIO_TYPES = ['audio/mpeg']; // MP3 only

// Allowed image formats
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const validateAudioFile = (file: UploadedFile): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'Audio file is required' };
  }

  if (file.size > MAX_AUDIO_SIZE) {
    return { valid: false, error: `Audio file size must be less than ${MAX_AUDIO_SIZE / 1024 / 1024}MB` };
  }

  if (!ALLOWED_AUDIO_TYPES.includes(file.mimetype)) {
    return { valid: false, error: 'Only MP3 audio files are allowed' };
  }

  return { valid: true };
};

export const validateImageFile = (file: UploadedFile): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'Cover art image is required' };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: `Image size must be less than ${MAX_IMAGE_SIZE / 1024 / 1024}MB` };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return { valid: false, error: 'Image format must be JPG, JPEG, PNG, or WEBP' };
  }

  return { valid: true };
};

export const uploadToCloudinary = async (
  file: UploadedFile,
  folder: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `groovely/${folder}`,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!.secure_url);
        }
      }
    );
    uploadStream.end(file.data);
  });
};

export const createNewTrack = async (
  userId: number,
  title: string,
  description: string | null,
  audioFile: UploadedFile,
  coverFile: UploadedFile,
  visibility: string,
  explicit: boolean,
  category: string,
  tags: string[] | null,
  bpm: number | null,
  key: string | null,
  isrc: string | null,
  usageRights: string[]
) => {
  // Upload audio to Cloudinary
  const audioUrl = await uploadToCloudinary(audioFile, 'audio');

  // Upload cover art to Cloudinary
  const coverUrl = await uploadToCloudinary(coverFile, 'covers');

  // Save track to database
  const track = await createTrack(
    userId, title, description, audioUrl, coverUrl, visibility,
    explicit, category, tags, bpm, key, isrc, usageRights
  );

  return track;
};

export const getCreatorTracks = async (userId: number) => {
  return await getTracksByUserId(userId);
};

export const getTrackDetails = async (trackId: number, userId: number) => {
  const track = await getTrackById(trackId, userId);
  if (!track) {
    throw new Error('Track not found');
  }
  return track;
};

export const updateTrackDetails = async (
  trackId: number,
  userId: number,
  updates: any
) => {
  const track = await updateTrack(trackId, userId, updates);
  if (!track) {
    throw new Error('Track not found');
  }
  return track;
};

export const removeTrack = async (trackId: number, userId: number) => {
  const deleted = await deleteTrack(trackId, userId);
  if (!deleted) {
    throw new Error('Track not found');
  }
  return deleted;
};