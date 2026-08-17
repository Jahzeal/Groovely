import React from 'react';
import Link from 'next/link';

export const FeatureCards = () => {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 max-w-7xl mx-auto relative z-10 font-sans">
      <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
        {/* For Creators */}
        <div className="relative overflow-hidden rounded-[32px] p-8 sm:p-12 bg-[#0F172A]/80 backdrop-blur-xl border border-[#8B5CF6]/30 group hover:border-[#8B5CF6]/60 transition-all shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#8B5CF6]/15 blur-[50px] rounded-full pointer-events-none" />
          <div className="absolute top-8 right-8 opacity-20 group-hover:opacity-60 transition-opacity text-[#8B5CF6]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22C12 22 17 19 17 13C17 10 15 8 13 8C11 8 9 9 9 12C9 14 11 15 12 14.5C13 14 13.5 13 13 12.5C12.5 12 11 12 11 13.5C11 16 14 18 14 18V2C14 1 13 0 12 0C11 0 10 1 10 2V18C10 18 7 16 7 13C7 11 8.5 9 11 9C12 9 13 10 13 11C13 11.5 12.5 12 12 12C11.5 12 11 11.5 11 11" />
            </svg>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 uppercase tracking-tight flex items-center gap-3">
            For Creators <span className="text-[#8B5CF6] text-lg">⊙</span>
          </h3>
          <p className="text-zinc-400 text-sm sm:text-base mb-8 max-w-xs leading-relaxed font-medium">
            Monetize instantly. Keep 100% of your sales. Own your relationship with fans.
          </p>
          <ul className="space-y-3 mb-10">
            {[
              "Instant royalties (no 90-day wait)",
              "Mint tracks as unlimited NFTs",
              "Token-gated listening rooms"
            ].map((item, i) => (
               <li key={i} className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300 font-medium">
                 <span className="text-[#8B5CF6] font-bold">✓</span> {item}
               </li>
            ))}
          </ul>
          <Link href="/onboarding" className="inline-flex items-center gap-2 text-[#8B5CF6] font-bold hover:translate-x-2 transition-transform uppercase tracking-widest text-xs">
            Start Uploading →
          </Link>
        </div>

        {/* For Listeners */}
        <div className="relative overflow-hidden rounded-[32px] p-8 sm:p-12 bg-[#0F172A]/80 backdrop-blur-xl border border-[#00C68A]/30 group hover:border-[#00FFC6]/60 transition-all shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#00FFC6]/10 blur-[50px] rounded-full pointer-events-none" />
          <div className="absolute top-8 right-8 opacity-20 group-hover:opacity-60 transition-opacity text-[#00FFC6]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
               <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
               <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 uppercase tracking-tight flex items-center gap-3">
            For Listeners <span className="text-[#00FFC6] text-lg">♡</span>
          </h3>
          <p className="text-zinc-400 text-sm sm:text-base mb-8 max-w-xs leading-relaxed font-medium">
            Get paid to discover new music. Curate playlists and earn rewards.
          </p>
          <ul className="space-y-3 mb-10">
            {[
              "Earn tokens for listening",
              "Exclusive access to unreleased tracks",
              "Support artists directly"
            ].map((item, i) => (
               <li key={i} className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300 font-medium">
                 <span className="text-[#00FFC6] font-bold">✓</span> {item}
               </li>
            ))}
          </ul>
          <Link href="/onboarding" className="inline-flex items-center gap-2 text-[#00FFC6] font-bold hover:translate-x-2 transition-transform uppercase tracking-widest text-xs">
            Explore Music →
          </Link>
        </div>
      </div>
    </section>
  );
};

