'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '../ui/Logo';

export const Hero = () => {
  return (
    <section className="relative pt-40 pb-20 px-6 overflow-hidden z-10 font-sansSelection">
      {/* Sparkles Overlay Logic duplicated here */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
           <div 
             key={i} 
             className="sparkle opacity-30" 
             style={{ 
               top: `${Math.random() * 80}%`, 
               left: `${Math.random() * 100}%`,
               animationDelay: `${i * 0.5}s` 
             }} 
           />
        ))}
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-cyan/20 bg-accent-cyan/10 text-[10px] font-bold tracking-widest uppercase text-accent-cyan mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
            NOW LIVE IN BETA
          </div>
          
          <h1 className="text-6xl lg:text-[84px] font-black tracking-tight leading-[1.1] mb-8">
            Own Your <br/>
            Sound. <br/>
            <span className="text-accent-purple">Reward Your </span> <br/>
            <span className="text-white">Fans.</span>
          </h1>
          
          <p className="text-zinc-500 text-lg lg:text-xl max-w-xl mb-12 leading-relaxed font-medium">
            The first audio platform where listening pays off and creators keep 100% of their revenue. No crypto wallet needed to start.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link 
              href="/login"
              className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/5 px-10 py-4 text-white font-bold text-sm hover:bg-white/10 transition-all uppercase tracking-wider"
            >
              Log In/Sign Up
            </Link>
            <Link 
              href="/onboarding"
              className="w-full sm:w-auto rounded-xl bg-accent-purple px-10 py-4 text-white font-bold text-sm hover:bg-accent-purple/90 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-105 uppercase tracking-wider"
            >
              Explore Groovely
            </Link>
          </div>
          
          <p className="mt-8 text-zinc-600 text-sm flex items-center justify-center lg:justify-start gap-2">
            <span className="text-accent-cyan small-icon-circle">✓</span> Free to join. No credit card required.
          </p>
        </div>

        {/* Dashboard Preview Visual */}
        <div className="flex-1 relative group w-full max-w-2xl">
          <div className="relative z-10 rounded-[32px] p-1.5 bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-[0_45px_120px_rgba(0,0,0,0.8)] overflow-hidden">
             <div className="bg-[#0D0D10] rounded-[28px] overflow-hidden border border-white/5 flex flex-col h-[480px]">
                {/* Mockup Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
                   <div className="flex gap-1.5">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-2.5 h-2.5 rounded-full bg-white/10" />
                      ))}
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-20 h-2 bg-white/5 rounded-full" />
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10" />
                   </div>
                </div>

                {/* Mockup Body */}
                <div className="flex-1 flex overflow-hidden">
                   {/* Sidebar */}
                   <div className="w-14 border-r border-white/5 flex flex-col items-center py-6 gap-6 bg-black/20">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`w-8 h-8 rounded-lg ${i === 0 ? 'bg-accent-purple/20 border border-accent-purple/40' : 'bg-white/5'}`} />
                      ))}
                   </div>
                   {/* Content Area */}
                   <div className="flex-1 p-6 overflow-hidden">
                      <div className="grid grid-cols-4 gap-4">
                         {[
                            { title: "Midnight Lo-Fi", artist: "Lo-Fi Beats" },
                            { title: "Crypto Talk", artist: "Web3 Radio" },
                            { title: "Night Vibes", artist: "Synthwave" },
                            { title: "Deep House", artist: "Groove" },
                            { title: "Summer Soul", artist: "Aura" },
                            { title: "Future Bass", artist: "Nexus" },
                            { title: "Techno City", artist: "Grid" },
                            { title: "Lounge Chill", artist: "Zen" },
                            { title: "Urban Jazz", artist: "Flow" },
                            { title: "Retro Pop", artist: "Vibe" },
                            { title: "Neo Soul", artist: "Dream" },
                            { title: "Dark Ambient", artist: "Void" }
                         ].map((item, i) => (
                           <div key={i} className="flex flex-col gap-2">
                              <div className="aspect-square rounded-xl bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center">
                                 <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
                              </div>
                              <div className="text-[8px] font-bold text-white/90 truncate">{item.title}</div>
                              <div className="text-[6px] font-medium text-zinc-500 truncate">{item.artist}</div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                {/* Player Bar */}
                <div className="h-20 bg-black/60 backdrop-blur-md border-t border-white/5 px-6 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent-purple/30 group-hover:bg-accent-purple/50 transition-colors" />
                      <div className="flex flex-col gap-1">
                         <div className="h-2 w-24 bg-white/80 rounded" />
                         <div className="h-1.5 w-16 bg-zinc-600 rounded" />
                      </div>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px]">◀◀</div>
                      <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-xs">▶</div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px]">▶▶</div>
                   </div>
                   <div className="w-10 h-1 h-full flex items-center">
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                         <div className="w-1/3 h-full bg-accent-cyan" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-accent-purple/10 blur-[130px] -z-10" />
        </div>
      </div>
    </section>
  );
};
