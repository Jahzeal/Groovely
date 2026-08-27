'use client';

import React, { useEffect } from 'react';
import { 
  LockKeyhole, 
  ShoppingCart, 
  ArrowLeft, 
  Music2, 
  Sparkles,
  Headphones,
  Download,
  ShieldCheck,
  Coins,
  Clock
} from 'lucide-react';
import { useMusicPlayer } from './MusicPlayerContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const PreviewLimitModal: React.FC = () => {
  const router = useRouter();
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

  const rawPrice = currentTrack.price;
  const numericPrice = parseFloat(rawPrice ? rawPrice.toString().replace(/[^0-9.]/g, '') : '');
  const formattedPrice = isNaN(numericPrice) || numericPrice <= 0 ? '1.00' : numericPrice.toFixed(2);

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
                  <LockKeyhole size={22} className="text-accent-cyan" strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/* Headline & Price Pill */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/20">
                <Clock size={12} className="text-accent-cyan" />
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-accent-cyan">
                  Free Preview Ended
                </span>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-accent-purple/20 border border-accent-purple/40 shadow-[0_0_12px_rgba(139,92,246,0.3)]">
                <Coins size={12} className="text-accent-purple" />
                <span className="text-[10px] font-black text-white font-mono">
                  ${formattedPrice} USDC
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white mb-1 leading-tight">
              {currentTrack.title}
            </h2>
            <p className="text-xs font-medium text-zinc-400 mb-5">
              by <span className="text-white font-bold">{currentTrack.artist}</span>
            </p>

            {/* High-visibility Price Banner */}
            <div className="w-full bg-gradient-to-r from-accent-purple/20 via-accent-purple/10 to-accent-cyan/10 border border-accent-purple/30 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-[0_0_25px_rgba(139,92,246,0.15)]">
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Unlock Full Access</p>
                <p className="text-2xl font-black text-white font-mono tracking-tight">${formattedPrice} <span className="text-xs text-accent-cyan font-sans font-black">USDC</span></p>
              </div>
              <div className="bg-accent-purple/20 border border-accent-purple/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Coins size={14} className="text-accent-cyan" />
                <span className="text-xs font-black text-accent-cyan uppercase tracking-wider">Instant Mint</span>
              </div>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed mb-6 max-w-xs">
              You've reached the <span className="text-white font-black">40-second free preview limit</span>.
              Purchase this track to unlock full access & rights.
            </p>

            {/* Perks */}
            <div className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 mb-8 space-y-3">
              {[
                { icon: <Headphones size={16} className="text-accent-cyan" />, label: 'Unlimited Full Streaming' },
                { icon: <Download size={16} className="text-accent-purple" />, label: 'High-Quality Lossless Audio' },
                { icon: <ShieldCheck size={16} className="text-emerald-400" />, label: 'Verified On-Chain Ownership' },
                { icon: <Sparkles size={16} className="text-yellow-400" />, label: 'Full Licensing & Resale Rights' },
              ].map((perk, i) => (
                <div key={i} className="flex items-center gap-3 text-left">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                    {perk.icon}
                  </div>
                  <span className="text-xs font-bold text-zinc-300">{perk.label}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  dismissPreviewLimit();
                  if (typeof window !== 'undefined') {
                    if (window.location.pathname.startsWith(`/marketplace/${currentTrack.id}`)) {
                      window.dispatchEvent(new CustomEvent('open_mint_modal'));
                    } else {
                      router.push(`/marketplace/${currentTrack.id}?action=mint`);
                    }
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-4 bg-accent-purple hover:bg-accent-purple/90 text-white font-black text-sm rounded-2xl transition-all shadow-[0_8px_30px_rgba(139,92,246,0.5)] hover:shadow-[0_12px_40px_rgba(139,92,246,0.6)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <ShoppingCart size={18} />
                Purchase Track • ${formattedPrice} USDC
              </button>

              <button
                onClick={dismissPreviewLimit}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white font-bold text-sm rounded-2xl transition-all border border-white/5"
              >
                <ArrowLeft size={16} />
                Back to Browsing
              </button>
            </div>

            {/* Footer note */}
            <p className="mt-6 text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">
              <Music2 size={10} />
              Powered by Grooveli Rights Protocol
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
