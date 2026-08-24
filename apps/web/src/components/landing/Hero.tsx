'use client';

import React from 'react';
import Link from 'next/link';

export const Hero = () => {
  return (
    <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 px-4 sm:px-6 overflow-hidden z-10 font-sans">
      {/* Sparkles Overlay Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
           <div 
             key={i} 
             className="sparkle opacity-40" 
             style={{ 
               top: `${[25, 60, 75, 18, 42, 12, 50, 70, 85, 30, 90, 15][i]}%`, 
               left: `${[88, 42, 28, 68, 5, 52, 62, 82, 15, 92, 48, 35][i]}%`,
               animationDelay: `${i * 0.4}s` 
             }} 
           />
        ))}
      </div>

      {/* Background Glows (Matching SVG blurs #13C8EC & #00FFB2) */}
      <div className="absolute top-10 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-[#13C8EC]/10 blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-96 -left-20 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-[#00FFB2]/10 blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 relative z-10">
        
        {/* Left Column / Mobile Main Content */}
        <div className="flex-1 text-center lg:text-left w-full max-w-xl mx-auto lg:max-w-none pt-4 sm:pt-0">
          {/* Main Title - Stacked Mobile Style */}
          <h1 className="text-4xl sm:text-6xl lg:text-[80px] font-black tracking-tight leading-[1.08] mb-6 text-white uppercase">
            Own Your <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#00FFC6]">Sound.</span> <br />
            <span className="text-[#8B5CF6]">Reward Your </span> <br className="hidden sm:inline" />
            <span className="text-white">Fans.</span>
          </h1>
          
          <p className="text-zinc-400 text-sm sm:text-lg max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed font-medium">
            The first audio platform where listening pays off and creators keep 100% of their revenue. No crypto wallet needed to start.
          </p>
          
          <div className="mt-8 text-zinc-500 text-xs flex items-center justify-center lg:justify-start gap-2 font-medium">
            <span className="text-[#00FFC6] font-bold">✓</span> Free to join. Instant wallet setup.
          </div>
        </div>

        {/* Right Column / Mobile Audio App Preview Widget */}
        <div className="flex-1 relative w-full max-w-md lg:max-w-xl mx-auto">
          <div className="relative z-10 rounded-[32px] p-1 sm:p-2 bg-gradient-to-b from-white/15 via-white/5 to-transparent border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden">
             <div className="bg-[#0F172A] rounded-[28px] overflow-hidden border border-white/5 flex flex-col min-h-[460px] sm:min-h-[500px]">
                
                {/* Mockup Header */}
                <div className="px-5 py-3.5 flex items-center justify-between border-b border-white/5 bg-[#0B1120]">
                   <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#00FFC6] bg-[#1A2C30] px-2.5 py-0.5 rounded-full border border-[#00C68A]/40">
                        GROOVE LIVE
                      </span>
                   </div>
                </div>

                {/* Mobile Track Grid Section */}
                <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                   <div>
                      <div className="flex items-center justify-between mb-4">
                         <span className="text-xs font-bold uppercase tracking-wider text-white">Trending Streams</span>
                         <span className="text-[10px] font-medium text-[#00FFC6]">Live Rewards 🔥</span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                         {[
                            { title: "Midnight Lo-Fi", artist: "Lo-Fi Beats", tag: "Earn 2.4 $GRV", color: "from-purple-900/60 to-black" },
                            { title: "Web3 Beats", artist: "Crypto Radio", tag: "Earn 1.8 $GRV", color: "from-teal-900/60 to-black" },
                            { title: "Night Vibes", artist: "Synthwave", tag: "Earn 3.1 $GRV", color: "from-indigo-900/60 to-black" },
                            { title: "Deep House", artist: "Groove Club", tag: "Earn 1.5 $GRV", color: "from-pink-900/60 to-black" },
                            { title: "Summer Soul", artist: "Aura Sound", tag: "Earn 2.0 $GRV", color: "from-[#1A2C30] to-black" },
                            { title: "Future Bass", artist: "Nexus Lab", tag: "Earn 4.0 $GRV", color: "from-blue-900/60 to-black" }
                         ].map((item, i) => (
                           <div key={i} className="group/card relative rounded-xl p-2.5 bg-white/5 border border-white/5 hover:border-[#00FFC6]/40 transition-all cursor-pointer">
                              <div className={`aspect-square rounded-lg bg-gradient-to-br ${item.color} border border-white/10 flex flex-col justify-between p-2 mb-2 relative overflow-hidden`}>
                                 <span className="text-[8px] font-bold uppercase bg-black/60 backdrop-blur-sm text-[#00FFC6] px-1.5 py-0.5 rounded self-start border border-[#00FFC6]/20">
                                   {item.tag}
                                 </span>
                                 <div className="w-7 h-7 rounded-full bg-[#8B5CF6]/80 flex items-center justify-center self-end shadow-md group-hover/card:scale-110 transition-transform">
                                   <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                                 </div>
                              </div>
                              <div className="text-[10px] font-bold text-white truncate">{item.title}</div>
                              <div className="text-[8px] font-medium text-zinc-400 truncate">{item.artist}</div>
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* Mobile Audio Player Control Bar */}
                   <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-2 bg-[#050510]/80 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#4E0AA6] flex items-center justify-center font-bold text-white text-xs shadow-md">
                              🎵
                            </div>
                            <div className="flex flex-col">
                               <span className="text-xs font-bold text-white truncate max-w-[120px] sm:max-w-[160px]">Neon Resonance</span>
                               <span className="text-[9px] font-medium text-zinc-400">Groovely Originals</span>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <button className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white text-xs hover:bg-white/20">
                              ⏮
                            </button>
                            <button className="w-8 h-8 rounded-full bg-[#00FFC6] text-black font-bold flex items-center justify-center text-xs shadow-[0_0_15px_rgba(0,255,198,0.4)] hover:scale-105 transition-transform">
                              ▶
                            </button>
                            <button className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white text-xs hover:bg-white/20">
                              ⏭
                            </button>
                         </div>
                      </div>

                      {/* Waveform / Progress Line */}
                      <div className="w-full flex items-center gap-2 pt-1">
                         <span className="text-[8px] font-mono text-zinc-500">01:42</span>
                         <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                            <div className="h-full w-[60%] bg-gradient-to-r from-[#8B5CF6] to-[#00FFC6] rounded-full" />
                         </div>
                         <span className="text-[8px] font-mono text-zinc-500">03:30</span>
                      </div>
                   </div>
                </div>

             </div>
          </div>
          
          {/* Ambient Purple Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-[#8B5CF6]/15 blur-[120px] -z-10 pointer-events-none" />
        </div>

      </div>
    </section>
  );
};

