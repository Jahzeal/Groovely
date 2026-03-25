import React from 'react';
import Link from 'next/link';

export const FeatureCards = () => {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto relative z-10">
      <div className="grid md:grid-cols-2 gap-10">
        {/* For Creators */}
        <div className="glass-card p-12 group hover:border-accent-cyan/50 transition-all border-accent-cyan/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-accent-cyan/10 flex items-center justify-center text-3xl">🎸</div>
            <h3 className="text-3xl font-black text-accent-cyan uppercase tracking-tighter">For Creators</h3>
          </div>
          <p className="text-zinc-400 text-lg mb-10 max-w-sm leading-relaxed">
            Monetize instantly. Keep 100% of your sales. Own your relationship with fans.
          </p>
          <ul className="space-y-5 mb-12">
            {[
              "Multi-layered royalty split",
              "Mint as music collectibles",
              "Direct relationship tools"
            ].map((item, i) => (
               <li key={i} className="flex items-center gap-3 text-md text-zinc-300">
                 <span className="text-accent-cyan font-bold">✓</span> {item}
               </li>
            ))}
          </ul>
          <Link href="/onboarding" className="text-accent-cyan font-black flex items-center gap-2 hover:translate-x-2 transition-transform uppercase tracking-widest text-sm">
            Start Building →
          </Link>
        </div>

        {/* For Listeners */}
        <div className="glass-card p-12 group hover:border-accent-magenta/50 transition-all border-accent-magenta/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-accent-magenta/10 flex items-center justify-center text-3xl">💜</div>
            <h3 className="text-3xl font-black text-accent-magenta uppercase tracking-tighter">For Listeners</h3>
          </div>
          <p className="text-zinc-400 text-lg mb-10 max-w-sm leading-relaxed">
            Get paid to discover new music. Curate playlists and earn shared royalties.
          </p>
          <ul className="space-y-5 mb-12">
            {[
              "Earn credits for listening",
              "Exclusive access to drops",
              "Support artists directly"
            ].map((item, i) => (
               <li key={i} className="flex items-center gap-3 text-md text-zinc-300">
                 <span className="text-accent-magenta font-bold">✓</span> {item}
               </li>
            ))}
          </ul>
          <Link href="/onboarding" className="text-accent-magenta font-black flex items-center gap-2 hover:translate-x-2 transition-transform uppercase tracking-widest text-sm">
            Explore Music →
          </Link>
        </div>
      </div>
    </section>
  );
};
