import React from 'react';

export const ExperienceMockup = () => {
  return (
    <section className="py-32 px-6 relative z-10">
      <div className="max-w-5xl mx-auto">
        <div className="relative rounded-[48px] overflow-hidden bg-white/2 border border-white/5 p-16 lg:p-32 text-center flex flex-col items-center group">
            {/* Ambient Background Blur */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-accent-purple/5 blur-[120px] -z-10" />
            
            <div className="flex items-center gap-3 mb-10">
               <div className="px-3 py-1 rounded-full border border-red-500/20 bg-red-500/10 text-[10px] font-bold text-red-500 tracking-widest uppercase flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                 LIVE EXPERIENCE
               </div>
               <div className="px-3 py-1 rounded-full border border-accent-cyan/20 bg-accent-cyan/10 text-[10px] font-bold text-accent-cyan tracking-widest uppercase flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                 Coming Soon
               </div>
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-black mb-8 leading-[1.1] uppercase tracking-tighter">Experience <br/> Tunes Together</h2>
            <p className="text-zinc-500 text-lg lg:text-xl max-w-2xl mb-20 leading-relaxed font-medium">
               Groovely Listening Rooms bring the concert vibe to your browser. Chat with artists, meet other fans, and participate in live drops.
            </p>
            
            {/* Sophisticated Player UI */}
            <div className="w-full max-w-2xl relative">
               <div className="absolute -inset-4 bg-accent-purple/10 blur-2xl rounded-full -z-10" />
               <div className="bg-black/60 backdrop-blur-2xl rounded-3xl p-6 lg:p-10 border border-white/10 flex items-center gap-8 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
                  <button className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-black shadow-2xl hover:scale-105 transition-transform active:scale-95 group/play">
                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-black border-b-[10px] border-b-transparent translate-x-1" />
                  </button>
                  <div className="flex-1 flex flex-col gap-5">
                    <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="absolute top-0 left-0 h-full w-[65%] bg-accent-purple shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
                    </div>
                    <div className="flex justify-between text-xs text-zinc-600 font-bold tracking-[0.2em]">
                       <span>03:22</span>
                       <span>04:45</span>
                    </div>
                  </div>
               </div>
            </div>
        </div>
      </div>
    </section>
  );
};
