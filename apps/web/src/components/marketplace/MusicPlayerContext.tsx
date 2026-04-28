'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

interface Track {
  id: string | number;
  title: string;
  artist: string;
  image: string;
  audioUrl?: string;
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
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRecordedRef = useRef<string | number | null>(null);
  const currentTrackRef = useRef<Track | null>(null);

  // Keep the ref in sync with state
  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  const recordStream = async (trackId: string | number) => {
    if (streamRecordedRef.current === trackId) return;
    streamRecordedRef.current = trackId;
    
    try {
      apiFetch(`/api/tracks/${trackId}/stream`, { 
        method: 'POST',
        skipAuthRedirect: true 
      })
        .catch(err => console.error('Failed to record stream:', err));
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
          if (activeTrack && streamRecordedRef.current !== activeTrack.id) {
            if (audio.currentTime > 15 || pct > 30) {
              recordStream(activeTrack.id);
            }
          }
        }
      };

      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('ended', () => {
        const activeTrack = currentTrackRef.current;
        if (activeTrack) recordStream(activeTrack.id);
        setIsPlaying(false);
        playNext();
      });
      
      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.pause();
      };
    }
  }, []); // Initialize once

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playTrack = (track: Track, newQueue?: Track[]) => {
    if (!audioRef.current) return;

    if (newQueue) {
      setQueue(newQueue);
    }

    if (currentTrack?.id === track.id) {
      togglePlay();
      return;
    }

    setCurrentTrack(track);
    const url = track.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    
    audioRef.current.src = url;
    audioRef.current.play();
    setIsPlaying(true);
  };

  const playNext = () => {
    if (queue.length === 0 || !currentTrack) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex === -1 || currentIndex === queue.length - 1) {
      // Loop back or stop
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
      // Loop back or stop
      if (queue.length > 0) {
        playTrack(queue[queue.length - 1]);
      }
      return;
    }
    playTrack(queue[currentIndex - 1]);
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  return (
    <MusicPlayerContext.Provider value={{ 
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
      playPrevious
    }}>
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
