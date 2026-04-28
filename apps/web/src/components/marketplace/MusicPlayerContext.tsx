'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

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
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  progress: number;
  setProgress: (progress: number) => void;
  duration: number;
  currentTime: number;
  seek: (time: number) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      
      const audio = audioRef.current;
      
      const updateProgress = () => {
        if (audio.duration) {
          const pct = (audio.currentTime / audio.duration) * 100;
          setProgress(pct);
          setCurrentTime(audio.currentTime);
          setDuration(audio.duration);
        }
      };

      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('ended', () => setIsPlaying(false));
      
      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.pause();
      };
    }
  }, []);

  const playTrack = (track: Track) => {
    if (!audioRef.current) return;

    if (currentTrack?.id === track.id) {
      togglePlay();
      return;
    }

    setCurrentTrack(track);
    // In a real app, we would use track.audioUrl. 
    // For now, we'll use a placeholder if not provided.
    const url = track.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    
    audioRef.current.src = url;
    audioRef.current.play();
    setIsPlaying(true);
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
      seek
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
