import React from 'react';

export const ExperienceMockup = () => {
  return (
    <section className="py-32 px-6 relative z-10">
      <div className="max-w-5xl mx-auto">
        <div className="relative glass-card bg-black/40 p-1.5 rounded-[40px] overflow-hidden group shadow-2xl">
          <div className="bg-[#0A0A1F] rounded-[34px] p-24 text-center flex flex-col items-center border border-white/5 relative overflow-hidden">
            {/* Inner Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-accent-purple/5 blur-[100px]" />
            
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-[11px] font-black text-red-500 mb-10 tracking-[0.2em] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              LIVE EXPERIENCE
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-black mb-8 leading-tight uppercase tracking-tighter">Experience Music Together</h2>
            <p className="text-zinc-400 text-lg lg:text-xl max-w-3xl mb-16 leading-relaxed font-medium">
              Groovely Listening Rooms bring the concert vibe to your browser. Chat with artists, meet other fans, and participate in live drops.
            </p>
            
            {/* Visualizer/Player Integration UI from screenshot */}
            <div className="w-full max-w-2xl bg-black/60 backdrop-blur-md rounded-3xl p-8 border border-white/10 flex items-center gap-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
               <button className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-black text-2xl shadow-xl hover:scale-105 transition-transform active:scale-95">
                 ▶
               </button>
               <div className="flex-1 flex flex-col gap-4">
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-accent-cyan shadow-[0_0_20px_rgba(0,209,255,0.5)]" />
                  </div>
                  <div className="flex justify-between text-xs text-zinc-500 font-black tracking-widest font-mono">
                    <span>01:23</span>
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
