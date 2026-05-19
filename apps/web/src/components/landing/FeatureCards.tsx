import React from 'react';
import Link from 'next/link';

export const FeatureCards = () => {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto relative z-10">
      <div className="grid md:grid-cols-2 gap-8">
        {/* For Creators */}
        <div className="relative overflow-hidden rounded-[32px] p-12 bg-accent-purple-dark/20 border border-accent-purple/20 group hover:border-accent-purple/40 transition-all">
          <div className="absolute top-8 right-8 opacity-20 group-hover:opacity-40 transition-opacity">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-accent-purple">
              <path d="M12 22C12 22 17 19 17 13C17 10 15 8 13 8C11 8 9 9 9 12C9 14 11 15 12 14.5C13 14 13.5 13 13 12.5C12.5 12 11 12 11 13.5C11 16 14 18 14 18V2C14 1 13 0 12 0C11 0 10 1 10 2V18C10 18 7 16 7 13C7 11 8.5 9 11 9C12 9 13 10 13 11C13 11.5 12.5 12 12 12C11.5 12 11 11.5 11 11" fill="currentColor"/>
            </svg>
          </div>
          <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter flex items-center gap-3">
            For Creators <span className="text-accent-purple text-xl">⊙</span>
          </h3>
          <p className="text-zinc-500 text-lg mb-10 max-w-xs leading-relaxed font-medium">
            Monetize instantly. Keep 100% of your sales. Own your relationship with fans.
          </p>
          <ul className="space-y-4 mb-12">
            {[
              "Instant royalties (no 90-day wait)",
              "Mint tracks as unlimited NFTs",
              "Token-gated listening rooms"
            ].map((item, i) => (
               <li key={i} className="flex items-center gap-3 text-sm text-zinc-400 font-medium">
                 <span className="text-accent-purple">✓</span> {item}
               </li>
            ))}
          </ul>
          <Link href="/onboarding" className="text-accent-purple font-bold flex items-center gap-2 hover:translate-x-2 transition-transform uppercase tracking-widest text-xs">
            Start Uploading →
          </Link>
        </div>

        {/* For Listeners */}
        <div className="relative overflow-hidden rounded-[32px] p-12 bg-accent-cyan/5 border border-accent-cyan/10 group hover:border-accent-cyan/30 transition-all">
          <div className="absolute top-8 right-8 opacity-20 group-hover:opacity-40 transition-opacity">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent-cyan">
               <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
               <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
          </div>
          <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter flex items-center gap-3">
            For Listeners <span className="text-accent-cyan text-xl">♡</span>
          </h3>
          <p className="text-zinc-500 text-lg mb-10 max-w-xs leading-relaxed font-medium">
            Get paid to discover new music. Curate playlists and earn rewards.
          </p>
          <ul className="space-y-4 mb-12">
            {[
              "Earn tokens for listening",
              "Exclusive access to unreleased tracks",
              "Support artists directly"
            ].map((item, i) => (
               <li key={i} className="flex items-center gap-3 text-sm text-zinc-400 font-medium">
                 <span className="text-accent-cyan">✓</span> {item}
               </li>
            ))}
          </ul>
          <Link href="/onboarding" className="text-accent-cyan font-bold flex items-center gap-2 hover:translate-x-2 transition-transform uppercase tracking-widest text-xs">
            Explore Music →
          </Link>
        </div>
      </div>
    </section>
  );
};
