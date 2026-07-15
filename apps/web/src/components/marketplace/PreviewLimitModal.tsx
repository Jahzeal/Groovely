'use client';

import React, { useEffect } from 'react';
import { Lock, ShoppingCart, ArrowLeft, Music2, Zap } from 'lucide-react';
import { useMusicPlayer } from './MusicPlayerContext';
import Link from 'next/link';

export const PreviewLimitModal: React.FC = () => {
  const { previewLimitReached, dismissPreviewLimit, currentTrack } = useMusicPlayer();

  // Trap ESC key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismissPreviewLimit();
    };
    if (previewLimitReached) {
      document.addEventListener('keydown', onKey);
    }
    return () => document.removeEventListener('keydown', onKey);
  }, [previewLimitReached, dismissPreviewLimit]);

  if (!previewLimitReached || !currentTrack) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-400"
        onClick={dismissPreviewLimit}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-400">
        {/* Ambient glow */}
        <div className="absolute -inset-4 bg-accent-purple/20 blur-3xl rounded-full pointer-events-none" />

        <div className="relative bg-[#0A0A14] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.8)]">
          {/* Top gradient bar */}
          <div className="h-1 w-full bg-gradient-to-r from-accent-purple via-accent-cyan to-accent-purple" />

          <div className="p-8 flex flex-col items-center text-center">
            {/* Track Art */}
            <div className="relative mb-6">
              <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <img
                  src={currentTrack.image}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover blur-[2px] scale-105"
                />
              </div>
              {/* Lock overlay on image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-xl">
                  <Lock size={22} className="text-white" strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/* Headline */}
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-accent-cyan" fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-accent-cyan">
                Free Preview Ended
              </span>
              <Zap size={14} className="text-accent-cyan" fill="currentColor" />
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white mb-1 leading-tight">
              {currentTrack.title}
            </h2>
            <p className="text-sm font-medium text-zinc-500 mb-6">
              by {currentTrack.artist}
            </p>

            <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-xs">
              You've listened to your <span className="text-white font-black">40-second free preview</span>.
              Purchase this track to unlock unlimited listening, downloads, and full licensing rights.
            </p>

            {/* Perks */}
            <div className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 mb-8 space-y-3">
              {[
                { icon: '🎵', label: 'Unlimited streaming' },
                { icon: '📥', label: 'High-quality download' },
                { icon: '⛓️', label: 'On-chain ownership proof' },
                { icon: '💰', label: 'Resale & licensing rights' },
              ].map((perk) => (
                <div key={perk.label} className="flex items-center gap-3 text-left">
                  <span className="text-base">{perk.icon}</span>
                  <span className="text-xs font-bold text-zinc-300">{perk.label}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 w-full">
              <Link
                href={`/marketplace/${currentTrack.id}?action=mint`}
                onClick={dismissPreviewLimit}
                className="w-full flex items-center justify-center gap-3 py-4 bg-accent-purple hover:bg-accent-purple/90 text-white font-black text-sm rounded-2xl transition-all shadow-[0_8px_30px_rgba(139,92,246,0.5)] hover:shadow-[0_12px_40px_rgba(139,92,246,0.6)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShoppingCart size={18} />
                Purchase Track
              </Link>

              <button
                onClick={dismissPreviewLimit}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white font-bold text-sm rounded-2xl transition-all border border-white/5"
              >
                <ArrowLeft size={16} />
                Back to Browsing
              </button>
            </div>

            {/* Footer note */}
            <p className="mt-6 text-[10px] font-bold text-zinc-700 uppercase tracking-widest flex items-center gap-2">
              <Music2 size={10} />
              Powered by Grooveli Rights Protocol
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
