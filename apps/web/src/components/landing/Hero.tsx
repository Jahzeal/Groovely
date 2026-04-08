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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-purple/30 bg-accent-purple/10 text-[10px] font-bold tracking-widest uppercase text-accent-purple mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-pulse" />
            New Level To Data
          </div>
          
          <h1 className="text-7xl lg:text-[100px] font-black tracking-tight leading-[0.9] mb-10">
            Own Your <br/>
            <span className="text-gradient-cyan">Sound.</span> <br/>
            Reward Your <br/>
            <span className="text-gradient-purple">Fans.</span>
          </h1>
          
          <p className="text-zinc-400 text-lg lg:text-2xl max-w-xl mb-12 leading-relaxed font-medium">
            The first audio platform where listening pays off and creators keep 100% of their revenue. No crypto wallet needed to start.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
            <Link 
              href="/onboarding"
              className="w-full sm:w-auto rounded-full bg-accent-cyan px-12 py-5 text-black font-extrabold text-sm hover:bg-cyan-400 transition-all shadow-[0_0_25px_rgba(0,209,255,0.4)] hover:scale-105 uppercase tracking-wider"
            >
              Start Listening
            </Link>
            <Link 
              href="/onboarding"
              className="w-full sm:w-auto rounded-full border border-accent-cyan/40 bg-black/20 backdrop-blur-sm px-12 py-5 text-accent-cyan font-bold text-sm hover:bg-accent-cyan/10 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <span className="text-lg">⊙</span> For Creators
            </Link>
          </div>
          
          <p className="mt-8 text-zinc-500 text-sm flex items-center justify-center lg:justify-start gap-2">
            <span>ⓘ</span> Free to Join. No Credit card required.
          </p>
        </div>

        {/* Dashboard Preview Visual */}
        <div className="flex-1 relative group w-full max-w-3xl">
          <div className="relative z-10 glass-card p-2 glow-purple overflow-hidden border-white/10 shadow-[0_45px_120px_rgba(157,0,255,0.2)]">
            <div className="bg-[#020205] rounded-2xl overflow-hidden border border-white/5 flex flex-col h-[520px]">
              {/* Header Mock */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
                </div>
                <div className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase">Groovely Player</div>
                <div className="w-12 h-4 bg-white/5 rounded-full" />
              </div>
              
              {/* Sidebar + Main Mock */}
              <div className="flex flex-1 overflow-hidden">
                <div className="w-16 border-r border-white/5 p-4 flex flex-col items-center gap-8 bg-black/10">
                   <div className="w-8 h-8 rounded-lg bg-accent-purple/20 border border-accent-purple/30" />
                   <div className="w-8 h-8 rounded-lg bg-white/5" />
                   <div className="w-8 h-8 rounded-lg bg-white/5" />
                </div>
                <div className="flex-1 p-8 grid grid-cols-4 gap-6">
                   {[...Array(8)].map((_, i) => (
                     <div key={i} className="space-y-3">
                       <div className="aspect-square rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden group/album">
                          <div className={`w-full h-full bg-gradient-to-br from-zinc-800 to-black p-4 flex items-center justify-center`}>
                             <div className="w-8 h-8 bg-white/10 rounded-full" />
                          </div>
                       </div>
                       <div className="h-2 w-full bg-white/10 rounded-full" />
                       <div className="h-1.5 w-2/3 bg-white/5 rounded-full" />
                     </div>
                   ))}
                </div>
              </div>
              
              {/* Player Bar Mock */}
              <div className="h-20 bg-black/60 border-t border-white/5 p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent-purple shadow-lg" />
                  <div className="space-y-1">
                    <div className="h-2 w-32 bg-white/80 rounded" />
                    <div className="h-1.5 w-20 bg-zinc-600 rounded" />
                  </div>
                </div>
                <div className="flex-1 max-w-sm flex flex-col gap-2 px-10">
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-accent-cyan" />
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
          {/* Background Ambient Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-accent-purple/10 blur-[130px] -z-10" />
        </div>
      </div>
    </section>
  );
};
