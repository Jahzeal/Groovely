'use client';

import React, { useState, useRef } from 'react';
import { SkipBack, Play, Pause, SkipForward } from 'lucide-react';

const NOWPLAYING = {
  title: 'Neon Soul',
  creator: 'Midnight Vibe',
  image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
};

export const MusicPlayer = () => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(34); // percent
  const barRef = useRef<HTMLDivElement>(null);

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setProgress(Math.max(0, Math.min(100, pct)));
  };

  const elapsed = Math.floor((progress / 100) * 195); // 3:15 total
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="fixed bottom-0 left-64 right-0 z-50 h-20 bg-[#0A0A11]/95 border-t border-white/5 backdrop-blur-xl flex items-center px-8 gap-8">
      {/* Album art + info */}
      <div className="flex items-center gap-4 w-56 shrink-0">
        <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shadow-lg shrink-0">
          <img src={NOWPLAYING.image} alt={NOWPLAYING.title} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-white truncate">{NOWPLAYING.title}</p>
          <p className="text-xs text-zinc-500 font-medium truncate">{NOWPLAYING.creator}</p>
        </div>
      </div>

      {/* Controls + progress */}
      <div className="flex-1 flex flex-col items-center gap-2">
        {/* Buttons */}
        <div className="flex items-center gap-6">
          <button className="text-zinc-500 hover:text-white transition-colors">
            <SkipBack size={18} fill="currentColor" />
          </button>
          <button
            onClick={() => setPlaying(p => !p)}
            className="w-10 h-10 bg-accent-purple rounded-full flex items-center justify-center shadow-[0_0_16px_rgba(139,92,246,0.5)] hover:scale-110 transition-all active:scale-95"
          >
            {playing
              ? <Pause size={16} fill="white" className="text-white" />
              : <Play size={16} fill="white" className="text-white ml-0.5" />
            }
          </button>
          <button className="text-zinc-500 hover:text-white transition-colors">
            <SkipForward size={18} fill="currentColor" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 w-full max-w-md">
          <span className="text-[11px] font-bold text-zinc-600 w-10 text-right tabular-nums">{fmt(elapsed)}</span>
          <div
            ref={barRef}
            onClick={handleBarClick}
            className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer group relative"
          >
            <div
              className="h-full bg-accent-purple rounded-full relative transition-all"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <span className="text-[11px] font-bold text-zinc-600 w-10 tabular-nums">03:15</span>
        </div>
      </div>

      {/* Spacer for symmetry */}
      <div className="w-56 shrink-0" />
    </div>
  );
};
