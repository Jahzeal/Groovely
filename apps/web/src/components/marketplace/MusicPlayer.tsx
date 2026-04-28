'use client';

import React, { useRef } from 'react';
import { SkipBack, Play, Pause, SkipForward, Volume2 } from 'lucide-react';
import { useMusicPlayer } from './MusicPlayerContext';

export const MusicPlayer = () => {
  const { currentTrack, isPlaying, togglePlay, progress, duration, currentTime, seek } = useMusicPlayer();
  const barRef = useRef<HTMLDivElement>(null);

  if (!currentTrack) return null;

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current || !duration) return;
    const rect = barRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seek(pct * duration);
  };

  const fmt = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-24 bg-[#0A0A11]/95 border-t border-white/5 backdrop-blur-2xl flex items-center px-8 gap-8 animate-in slide-in-from-bottom duration-500">
      {/* Album art + info */}
      <div className="flex items-center gap-4 w-72 shrink-0">
        <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 shadow-2xl shrink-0 group relative cursor-pointer">
          <img src={currentTrack.image} alt={currentTrack.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-white truncate hover:text-accent-purple cursor-pointer transition-colors">{currentTrack.title}</p>
          <p className="text-xs text-zinc-500 font-medium truncate hover:text-zinc-300 cursor-pointer transition-colors">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Controls + progress */}
      <div className="flex-1 flex flex-col items-center gap-3">
        {/* Buttons */}
        <div className="flex items-center gap-8">
          <button className="text-zinc-500 hover:text-white transition-all hover:scale-110 active:scale-95">
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button
            onClick={togglePlay}
            className="w-12 h-12 bg-accent-purple rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:scale-110 hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all active:scale-95"
          >
            {isPlaying
              ? <Pause size={20} fill="white" className="text-white" />
              : <Play size={20} fill="white" className="text-white ml-1" />
            }
          </button>
          <button className="text-zinc-500 hover:text-white transition-all hover:scale-110 active:scale-95">
            <SkipForward size={20} fill="currentColor" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-4 w-full max-w-2xl">
          <span className="text-[10px] font-black text-zinc-500 w-12 text-right tabular-nums tracking-widest">{fmt(currentTime)}</span>
          <div
            ref={barRef}
            onClick={handleBarClick}
            className="flex-1 h-1.5 bg-white/5 rounded-full cursor-pointer group relative"
          >
            <div
              className="h-full bg-gradient-to-r from-accent-purple to-accent-cyan rounded-full relative transition-all duration-100"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] scale-0 group-hover:scale-100 transition-transform" />
            </div>
          </div>
          <span className="text-[10px] font-black text-zinc-500 w-12 tabular-nums tracking-widest">{fmt(duration || 0)}</span>
        </div>
      </div>

      {/* Volume / Extra Controls */}
      <div className="flex items-center justify-end gap-4 w-72 shrink-0">
        <div className="flex items-center gap-3 w-32">
            <Volume2 size={18} className="text-zinc-500" />
            <div className="flex-1 h-1 bg-white/10 rounded-full relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-2/3 bg-white/40 rounded-full" />
            </div>
        </div>
      </div>
    </div>
  );
};
