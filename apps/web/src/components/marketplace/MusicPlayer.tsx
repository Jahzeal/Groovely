'use client';

import React, { useRef } from 'react';
import { SkipBack, Play, Pause, SkipForward, Volume2, Lock, ShoppingCart } from 'lucide-react';
import { useMusicPlayer } from './MusicPlayerContext';
import Link from 'next/link';

const PREVIEW_LIMIT = 40;

export const MusicPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    progress,
    duration,
    currentTime,
    seek,
    volume,
    setVolume,
    playNext,
    playPrevious,
    previewLimitReached,
    purchasedTrackIds,
  } = useMusicPlayer();

  const barRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  if (!currentTrack) return null;

  const currentUserId = typeof window !== 'undefined' ? Number(localStorage.getItem('grooveli_user_id')) : null;
  const isUploader = currentUserId !== null && currentTrack.uploaderId === currentUserId;
  const isPurchased = purchasedTrackIds.has(currentTrack.id) || isUploader;
  const isLocked = previewLimitReached && !isPurchased;

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current || !duration) return;
    const rect = barRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seek(pct * duration);
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    setVolume(Math.max(0, Math.min(1, pct)));
  };

  const fmt = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Progress percentage capped at preview limit visually for non-purchased
  const previewLimitPct = duration ? (PREVIEW_LIMIT / duration) * 100 : 0;
  const displayProgress = isPurchased ? progress : Math.min(progress, previewLimitPct + 0.5);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 h-24 backdrop-blur-2xl flex items-center px-8 gap-8 animate-in slide-in-from-bottom duration-500 transition-all ${
        isLocked
          ? 'bg-[#0A0A14]/98 border-t border-accent-purple/30'
          : 'bg-[#0A0A11]/95 border-t border-white/5'
      }`}
    >
      {/* Album art + info */}
      <div className="flex items-center gap-4 w-72 shrink-0">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/10 shadow-2xl shrink-0 group cursor-pointer">
          <img
            src={currentTrack.image}
            alt={currentTrack.title}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isLocked ? 'blur-[1px]' : ''}`}
          />
          {isLocked && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Lock size={16} className="text-accent-purple" strokeWidth={2.5} />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-white truncate hover:text-accent-purple cursor-pointer transition-colors">
            {currentTrack.title}
          </p>
          <p className="text-xs text-zinc-500 font-medium truncate hover:text-zinc-300 cursor-pointer transition-colors">
            {currentTrack.artist}
          </p>
          {/* Ownership badge */}
          {isPurchased && (
            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-accent-cyan">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan inline-block" />
              Owned
            </span>
          )}
        </div>
      </div>

      {/* Controls + progress */}
      <div className="flex-1 flex flex-col items-center gap-3">
        {/* Buttons */}
        <div className="flex items-center gap-8">
          <button
            onClick={playPrevious}
            className="text-zinc-500 hover:text-white transition-all hover:scale-110 active:scale-95 disabled:opacity-30"
            disabled={isLocked}
          >
            <SkipBack size={20} fill="currentColor" />
          </button>

          {isLocked ? (
            /* Locked state — buy button in place of play */
            <Link
              href={`/marketplace/${currentTrack.id}`}
              className="w-12 h-12 bg-accent-purple rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:scale-110 transition-all animate-pulse"
            >
              <ShoppingCart size={18} className="text-white" />
            </Link>
          ) : (
            <button
              onClick={togglePlay}
              className="w-12 h-12 bg-accent-purple rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:scale-110 hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all active:scale-95"
            >
              {isPlaying
                ? <Pause size={20} fill="white" className="text-white" />
                : <Play size={20} fill="white" className="text-white ml-1" />
              }
            </button>
          )}

          <button
            onClick={playNext}
            className="text-zinc-500 hover:text-white transition-all hover:scale-110 active:scale-95 disabled:opacity-30"
            disabled={isLocked}
          >
            <SkipForward size={20} fill="currentColor" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-4 w-full max-w-2xl">
          <span className="text-[10px] font-black text-zinc-500 w-12 text-right tabular-nums tracking-widest">
            {fmt(currentTime)}
          </span>

          <div className="relative flex-1">
            <div
              ref={barRef}
              onClick={handleBarClick}
              className="flex-1 h-1.5 bg-white/5 rounded-full cursor-pointer group relative w-full"
            >
              {/* Actual progress */}
              <div
                className={`h-full rounded-full relative transition-all duration-100 ${
                  isLocked
                    ? 'bg-accent-purple/40'
                    : 'bg-gradient-to-r from-accent-purple to-accent-cyan'
                }`}
                style={{ width: `${displayProgress}%` }}
              >
                {!isLocked && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] scale-0 group-hover:scale-100 transition-transform" />
                )}
              </div>

              {/* Preview limit marker line — only show if not purchased */}
              {!isPurchased && duration > 0 && duration > PREVIEW_LIMIT && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3.5 -mt-[3px] rounded-full"
                  style={{
                    left: `${previewLimitPct}%`,
                    background: isLocked ? 'rgba(139,92,246,0.9)' : 'rgba(139,92,246,0.5)',
                  }}
                  title="40s free preview limit"
                />
              )}
            </div>

            {/* "Free preview" label */}
            {!isPurchased && !isLocked && duration > PREVIEW_LIMIT && (
              <div
                className="absolute -bottom-4 text-[8px] font-black uppercase tracking-widest text-zinc-700 whitespace-nowrap"
                style={{ left: `${Math.max(0, previewLimitPct - 4)}%` }}
              >
                40s preview limit
              </div>
            )}

            {/* Locked message */}
            {isLocked && (
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-accent-purple whitespace-nowrap flex items-center gap-1">
                <Lock size={8} />
                Preview ended — purchase to continue
              </div>
            )}
          </div>

          <span className="text-[10px] font-black text-zinc-500 w-12 tabular-nums tracking-widest">
            {fmt(duration || 0)}
          </span>
        </div>
      </div>

      {/* Volume / Extra Controls */}
      <div className="flex items-center justify-end gap-4 w-72 shrink-0">
        <div className="flex items-center gap-3 w-32">
          <button onClick={() => setVolume(volume === 0 ? 0.7 : 0)}>
            <Volume2
              size={18}
              className={volume === 0 ? 'text-red-500' : 'text-zinc-500 hover:text-white'}
            />
          </button>
          <div
            ref={volumeRef}
            onClick={handleVolumeClick}
            className="flex-1 h-1 bg-white/10 rounded-full relative cursor-pointer group"
          >
            <div
              className="absolute inset-y-0 left-0 bg-accent-purple group-hover:bg-accent-cyan transition-colors rounded-full"
              style={{ width: `${volume * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
