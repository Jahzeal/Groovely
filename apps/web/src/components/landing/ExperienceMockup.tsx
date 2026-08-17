import React from 'react';

export const ExperienceMockup = () => {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 relative z-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="relative rounded-[36px] sm:rounded-[48px] overflow-hidden bg-[#0F172A]/80 border border-white/10 p-8 sm:p-16 lg:p-24 text-center flex flex-col items-center group shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[#8B5CF6]/10 blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#00FFC6]/10 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
               <div className="px-3.5 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-[10px] font-bold text-red-400 tracking-widest uppercase flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                 LIVE ROOMS
               </div>
               <div className="px-3.5 py-1 rounded-full border border-[#00C68A]/30 bg-[#1A2C30] text-[10px] font-bold text-[#00FFC6] tracking-widest uppercase flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-[#00FFC6]" />
                 Interactive Audio
               </div>
            </div>
            
            <h2 className="text-3xl sm:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] uppercase tracking-tight text-white">
              Experience <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#00FFC6]">Tunes Together</span>
            </h2>
            <p className="text-zinc-400 text-sm sm:text-xl max-w-2xl mb-12 sm:mb-16 leading-relaxed font-medium">
               Groovely Listening Rooms bring the concert vibe to your screen. Chat with artists, meet other superfans, and drop reactions in real time.
            </p>
            
            {/* High-Tech Premium Player Widget */}
            <div className="w-full max-w-2xl relative">
               <div className="absolute -inset-2 bg-gradient-to-r from-[#8B5CF6]/30 via-transparent to-[#00FFC6]/30 blur-xl rounded-3xl -z-10" />
               
               <div className="bg-[#050510]/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 shadow-[0_20px_60px_rgba(0,0,0,0.7)] text-left">
                  
                  {/* Glowing Neon Play Button */}
                  <button className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] via-[#7c4dff] to-[#00FFC6] p-0.5 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(0,255,198,0.6)] hover:scale-105 active:scale-95 transition-all group/play shrink-0">
                    <div className="w-full h-full bg-[#0F172A] rounded-[14px] flex items-center justify-center group-hover/play:bg-transparent transition-colors">
                      <svg width="22" height="26" viewBox="0 0 22 26" fill="none" className="translate-x-0.5 text-white group-hover/play:text-black transition-colors">
                        <path d="M20.5 11.4019C21.8333 12.1717 21.8333 13.8283 20.5 14.5981L3.25 24.5574C1.91666 25.3272 0.25 24.3653 0.25 22.8258L0.250001 3.17418C0.250001 1.63467 1.91667 0.672799 3.25 1.4426L20.5 11.4019Z" fill="currentColor"/>
                      </svg>
                    </div>
                  </button>

                  {/* Track Info & Controls */}
                  <div className="flex-1 flex flex-col gap-3.5 w-full">
                    <div className="flex items-center justify-between gap-2">
                       <div>
                          <h4 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">Neon Horizon Room</h4>
                          <p className="text-xs text-zinc-400 font-medium">Hosted by DJ Aether • Live Set</p>
                       </div>
                       <span className="text-[10px] font-bold text-[#00FFC6] bg-[#1A2C30] px-2.5 py-1 rounded-full border border-[#00C68A]/40 shrink-0">
                         🔴 1,420 Vibe Squad
                       </span>
                    </div>

                    {/* Progress Bar & Waveform */}
                    <div className="flex flex-col gap-1.5">
                       <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="absolute top-0 left-0 h-full w-[65%] bg-gradient-to-r from-[#8B5CF6] to-[#00FFC6] shadow-[0_0_15px_rgba(0,255,198,0.5)] rounded-full" />
                       </div>
                       <div className="flex justify-between text-[10px] font-mono text-zinc-400 font-bold">
                          <span>02:18</span>
                          <span className="text-[#00FFC6]">LIVE STREAM</span>
                          <span>04:45</span>
                       </div>
                    </div>
                  </div>

               </div>
            </div>
        </div>
      </div>
    </section>
  );
};

