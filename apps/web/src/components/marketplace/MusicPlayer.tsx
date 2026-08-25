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
  const mobileBarRef = useRef<HTMLDivElement>(null);
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
    seek(Math.max(0, Math.min(1, pct)) * duration);
  };

  const handleMobileBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mobileBarRef.current || !duration) return;
    const rect = mobileBarRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seek(Math.max(0, Math.min(1, pct)) * duration);
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
      className={`fixed bottom-0 left-0 right-0 z-50 backdrop-blur-2xl animate-in slide-in-from-bottom duration-300 transition-all ${
        isLocked
          ? 'bg-[#0A0A14]/98 border-t border-accent-purple/40 shadow-[0_-10px_30px_rgba(138,43,226,0.2)]'
          : 'bg-[#0A0A11]/98 border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]'
      }`}
    >
      {/* Mobile Top Scrub Line (Visible only on mobile) */}
      <div 
        ref={mobileBarRef}
        onClick={handleMobileBarClick}
        className="md:hidden relative w-full h-1.5 bg-white/10 cursor-pointer group"
      >
        <div
          className={`h-full relative transition-all duration-100 ${
            isLocked
              ? 'bg-[#8A2BE2]/50'
              : 'bg-gradient-to-r from-[#8A2BE2] to-[#00FFC6]'
          }`}
          style={{ width: `${displayProgress}%` }}
        />
        {!isPurchased && duration > 0 && duration > PREVIEW_LIMIT && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-red-500/80 rounded-full"
            style={{ left: `${previewLimitPct}%` }}
            title="40s preview limit"
          />
        )}
      </div>

      {/* Main Content Container: Safe padding on mobile & desktop */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 h-16 sm:h-20 gap-2 sm:gap-6">
        
        {/* Left: Album art + Track Info (Flex-1 on mobile with truncate) */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1 md:flex-initial md:w-64 lg:w-72">
          <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden border border-white/10 shadow-lg shrink-0 group cursor-pointer">
            <img
              src={currentTrack.image}
              alt={currentTrack.title}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isLocked ? 'blur-[1px]' : ''}`}
            />
            {isLocked && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Lock size={14} className="text-[#8A2BE2]" strokeWidth={2.5} />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-black text-white truncate hover:text-[#8A2BE2] cursor-pointer transition-colors leading-tight">
              {currentTrack.title}
            </p>
            <p className="text-[10px] sm:text-xs text-zinc-400 font-medium truncate hover:text-zinc-200 cursor-pointer transition-colors mt-0.5">
              {currentTrack.artist}
            </p>
            
            {/* Ownership or Preview Badge */}
            {isPurchased ? (
              <span className="inline-flex items-center gap-1 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[#00FFC6] mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FFC6] inline-block" />
                Owned
              </span>
            ) : isLocked ? (
              <span className="inline-flex items-center gap-1 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[#8A2BE2] mt-0.5">
                <Lock size={8} /> Preview Ended
              </span>
            ) : (
              <span className="inline-block text-[8px] text-zinc-500 font-mono sm:hidden mt-0.5">
                {fmt(currentTime)} / {fmt(duration || 0)}
              </span>
            )}
          </div>
        </div>

        {/* Center: Controls + Progress Bar on md+ */}
        <div className="flex items-center md:flex-1 md:flex-col md:items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Playback Buttons */}
          <div className="flex items-center gap-2 sm:gap-6">
            <button
              onClick={playPrevious}
              className="hidden sm:inline-flex text-zinc-400 hover:text-white transition-all hover:scale-110 active:scale-95 disabled:opacity-30 p-1 cursor-pointer"
              disabled={isLocked}
              aria-label="Previous track"
            >
              <SkipBack size={18} fill="currentColor" />
            </button>

            {isLocked ? (
              /* Locked state — buy button in place of play */
              <Link
                href={`/marketplace/${currentTrack.id}`}
                className="w-9 h-9 sm:w-11 sm:h-11 bg-[#8A2BE2] hover:bg-[#7c4dff] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(138,43,226,0.5)] hover:scale-105 active:scale-95 transition-all text-white"
                title="Purchase Track"
              >
                <ShoppingCart size={16} />
              </Link>
            ) : (
              <button
                onClick={togglePlay}
                className="w-9 h-9 sm:w-11 sm:h-11 bg-[#8A2BE2] hover:bg-[#7c4dff] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(138,43,226,0.4)] hover:scale-105 hover:shadow-[0_0_25px_rgba(138,43,226,0.6)] transition-all active:scale-95 cursor-pointer text-white"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying
                  ? <Pause size={18} fill="white" />
                  : <Play size={18} fill="white" className="translate-x-0.5" />
                }
              </button>
            )}

            <button
              onClick={playNext}
              className="text-zinc-400 hover:text-white transition-all hover:scale-110 active:scale-95 disabled:opacity-30 p-1 cursor-pointer"
              disabled={isLocked}
              aria-label="Next track"
            >
              <SkipForward size={18} fill="currentColor" />
            </button>
          </div>

          {/* Desktop Progress Bar (Hidden on mobile, shown on md+) */}
          <div className="hidden md:flex items-center gap-3 w-full max-w-lg lg:max-w-xl">
            <span className="text-[10px] font-mono text-zinc-400 w-10 text-right tabular-nums">
              {fmt(currentTime)}
            </span>

            <div className="relative flex-1">
              <div
                ref={barRef}
                onClick={handleBarClick}
                className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer group relative w-full"
              >
                {/* Actual progress */}
                <div
                  className={`h-full rounded-full relative transition-all duration-100 ${
                    isLocked
                      ? 'bg-[#8A2BE2]/40'
                      : 'bg-gradient-to-r from-[#8A2BE2] to-[#00FFC6]'
                  }`}
                  style={{ width: `${displayProgress}%` }}
                >
                  {!isLocked && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] scale-0 group-hover:scale-100 transition-transform" />
                  )}
                </div>

                {/* Preview limit marker line */}
                {!isPurchased && duration > 0 && duration > PREVIEW_LIMIT && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 -mt-[2px] rounded-full"
                    style={{
                      left: `${previewLimitPct}%`,
                      background: isLocked ? 'rgba(138,92,246,0.9)' : 'rgba(138,92,246,0.5)',
                    }}
                    title="40s free preview limit"
                  />
                )}
              </div>

              {/* Locked message */}
              {isLocked && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest text-[#8A2BE2] whitespace-nowrap flex items-center gap-1">
                  <Lock size={8} /> Preview ended — purchase to unlock
                </div>
              )}
            </div>

            <span className="text-[10px] font-mono text-zinc-400 w-10 tabular-nums">
              {fmt(duration || 0)}
            </span>
          </div>
        </div>

        {/* Right: Volume & Actions (Desktop only) */}
        <div className="hidden md:flex items-center justify-end gap-4 w-48 lg:w-72 shrink-0">
          <div className="flex items-center gap-2.5 w-28 lg:w-32">
            <button 
              onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label={volume === 0 ? "Unmute" : "Mute"}
            >
              <Volume2
                size={16}
                className={volume === 0 ? 'text-red-400' : 'text-zinc-400 hover:text-white'}
              />
            </button>
            <div
              ref={volumeRef}
              onClick={handleVolumeClick}
              className="flex-1 h-1 bg-white/10 rounded-full relative cursor-pointer group"
            >
              <div
                className="absolute inset-y-0 left-0 bg-[#8A2BE2] group-hover:bg-[#00FFC6] transition-colors rounded-full"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
