'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { apiFetch, resolveIpfsUrl } from '@/lib/api';

interface Track {
  id: string | number;
  title: string;
  artist: string;
  image?: string;
  audioUrl?: string;
  uploaderId?: number;
  price?: string | number;
  licenseTypes?: string[];
}

interface MusicPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  progress: number;
  setProgress: (progress: number) => void;
  duration: number;
  currentTime: number;
  seek: (time: number) => void;
  volume: number;
  setVolume: (volume: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  // 40-second preview enforcement
  previewLimitReached: boolean;
  dismissPreviewLimit: () => void;
  purchasedTrackIds: Set<string | number>;
  addPurchasedTrack: (id: string | number) => void;
}

const PREVIEW_LIMIT_SECONDS = 40;

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [previewLimitReached, setPreviewLimitReached] = useState(false);
  const [purchasedTrackIds, setPurchasedTrackIds] = useState<Set<string | number>>(new Set());

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRecordedRef = useRef<string | number | null>(null);
  const currentTrackRef = useRef<Track | null>(null);
  const purchasedRef = useRef<Set<string | number>>(new Set());

  // Keep refs in sync with state
  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    purchasedRef.current = purchasedTrackIds;
  }, [purchasedTrackIds]);

  const isTrackPurchased = useCallback((trackId: string | number) => {
    return Array.from(purchasedRef.current).some(pId => String(pId) === String(trackId));
  }, []);

  const getIsUploader = useCallback((track: Track | null) => {
    if (!track || !track.uploaderId) return false;
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('grooveli_user_id');
    return stored ? Number(stored) === Number(track.uploaderId) : false;
  }, []);

  const addPurchasedTrack = useCallback((id: string | number) => {
    setPurchasedTrackIds(prev => new Set([...prev, id]));
    // If the preview limit was reached for this track, dismiss it and resume
    if (currentTrackRef.current?.id && String(currentTrackRef.current.id) === String(id)) {
      setPreviewLimitReached(false);
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  }, []);

  const dismissPreviewLimit = useCallback(() => {
    setPreviewLimitReached(false);
    // Pause the audio so user has to actively restart after dismissing
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const recordStream = async (trackId: string | number) => {
    if (streamRecordedRef.current === trackId) return;
    streamRecordedRef.current = trackId;

    try {
      apiFetch(`/api/tracks/${trackId}/stream`, {
        method: 'POST',
        skipAuthRedirect: true,
      }).catch(err => console.error('Failed to record stream:', err));
    } catch (e) {
      console.error('Stream recording error:', e);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;

      const audio = audioRef.current;

      const updateProgress = () => {
        if (audio.duration) {
          const pct = (audio.currentTime / audio.duration) * 100;
          setProgress(pct);
          setCurrentTime(audio.currentTime);
          setDuration(audio.duration);

          const activeTrack = currentTrackRef.current;

          // Stream recording
          if (activeTrack && streamRecordedRef.current !== activeTrack.id) {
            if (audio.currentTime > 15 || pct > 30) {
              recordStream(activeTrack.id);
            }
          }

          // 40-second preview enforcement
          if (
            activeTrack &&
            audio.currentTime >= PREVIEW_LIMIT_SECONDS &&
            !isTrackPurchased(activeTrack.id) &&
            !getIsUploader(activeTrack)
          ) {
            audio.pause();
            setIsPlaying(false);
            setPreviewLimitReached(true);
          }
        }
      };

      const onEnded = () => {
        const activeTrack = currentTrackRef.current;
        if (activeTrack) recordStream(activeTrack.id);
        setIsPlaying(false);
        setPreviewLimitReached(false);
        playNext();
      };

      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('ended', onEnded);

      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('ended', onEnded);
        audio.pause();
      };
    }
  }, [getIsUploader]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playTrack = async (track: Track, newQueue?: Track[]) => {
    if (!audioRef.current) return;

    if (newQueue) {
      setQueue(newQueue);
    }

    // Reset preview limit when switching tracks
    setPreviewLimitReached(false);

    if (currentTrack?.id === track.id) {
      togglePlay();
      return;
    }

    setCurrentTrack(track);
    const url = resolveIpfsUrl(track.audioUrl) || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

    try {
      audioRef.current.src = url;
      setIsPlaying(true);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Playback error:', error);
      }
    }
  };

  const playNext = () => {
    if (queue.length === 0 || !currentTrack) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex === -1 || currentIndex === queue.length - 1) {
      if (queue.length > 0) {
        playTrack(queue[0]);
      }
      return;
    }
    playTrack(queue[currentIndex + 1]);
  };

  const playPrevious = () => {
    if (queue.length === 0 || !currentTrack) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex === -1 || currentIndex === 0) {
      if (queue.length > 0) {
        playTrack(queue[queue.length - 1]);
      }
      return;
    }
    playTrack(queue[currentIndex - 1]);
  };

  const togglePlay = async () => {
    if (!audioRef.current || !currentTrack) return;

    // Don't allow resuming if preview limit is reached and track not purchased
    if (previewLimitReached && !isTrackPurchased(currentTrack.id) && !getIsUploader(currentTrack)) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Toggle play error:', error);
      }
    }
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    // Prevent seeking past preview limit if not purchased
    if (currentTrack && !isTrackPurchased(currentTrack.id) && !getIsUploader(currentTrack)) {
      time = Math.min(time, PREVIEW_LIMIT_SECONDS);
    }
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playTrack,
        togglePlay,
        progress,
        setProgress,
        duration,
        currentTime,
        seek,
        volume,
        setVolume,
        playNext,
        playPrevious,
        previewLimitReached,
        dismissPreviewLimit,
        purchasedTrackIds,
        addPurchasedTrack,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};
