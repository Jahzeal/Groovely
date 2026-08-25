'use client';

import React, { useState } from 'react';

interface StreamItem {
  id: number;
  title: string;
  artist: string;
  genre: string;
  tag: string;
  image: string;
  duration: string;
}

const ALL_STREAMS: StreamItem[] = [
  {
    id: 1,
    title: "Midnight Waves",
    artist: "Kaleb Vance",
    genre: "Hip-Hop & R&B",
    tag: "Earn 3.2 $GRV",
    image: "/images/landing/artist_1.jpg",
    duration: "03:45"
  },
  {
    id: 2,
    title: "Studio Reflections",
    artist: "Maya Santos",
    genre: "Lo-Fi & Soul",
    tag: "Earn 2.8 $GRV",
    image: "/images/landing/artist_2.jpg",
    duration: "02:58"
  },
  {
    id: 3,
    title: "Neon Riot",
    artist: "Lucas Cole",
    genre: "Electronic & EDM",
    tag: "Earn 4.1 $GRV",
    image: "/images/landing/artist_3.jpg",
    duration: "04:12"
  },
  {
    id: 4,
    title: "Golden Hour Glow",
    artist: "Amaia Reed",
    genre: "Hip-Hop & R&B",
    tag: "Earn 3.6 $GRV",
    image: "/images/landing/artist_4.jpg",
    duration: "03:20"
  },
  {
    id: 5,
    title: "Midnight Currents",
    artist: "Elias Kai",
    genre: "Lo-Fi & Soul",
    tag: "Earn 2.4 $GRV",
    image: "/images/landing/artist_5.jpg",
    duration: "03:10"
  },
  {
    id: 6,
    title: "Neon Void",
    artist: "Anya Vane",
    genre: "Electronic & EDM",
    tag: "Earn 4.5 $GRV",
    image: "/images/landing/artist_6.jpg",
    duration: "03:52"
  }
];

const TABS = ["Trending", "Hip-Hop & R&B", "Electronic & EDM", "Lo-Fi & Soul"];

export const Hero = () => {
  const [activeTab, setActiveTab] = useState("Trending");
  const [selectedTrack, setSelectedTrack] = useState<StreamItem>(ALL_STREAMS[0]);
  const [isPlaying, setIsPlaying] = useState(true);

  const displayedStreams = activeTab === "Trending"
    ? ALL_STREAMS
    : ALL_STREAMS.filter(s => s.genre === activeTab);

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
        
        {/* Left Column / Main Content */}
        <div className="flex-1 text-center lg:text-left w-full max-w-xl mx-auto lg:max-w-none pt-4 sm:pt-0">
          {/* Main Title */}
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

        {/* Right Column / Interactive Audio App Preview Widget */}
        <div className="flex-1 relative w-full max-w-md lg:max-w-xl mx-auto">
          <div className="relative z-10 rounded-[32px] p-1 sm:p-2 bg-gradient-to-b from-white/15 via-white/5 to-transparent border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden">
             <div className="bg-[#0F172A] rounded-[28px] overflow-hidden border border-white/5 flex flex-col min-h-[490px] sm:min-h-[530px]">
                
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

                {/* Track Grid Section */}
                <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                   <div>
                      <div className="flex items-center justify-between mb-3">
                         <span className="text-xs font-bold uppercase tracking-wider text-white">Trending Streams</span>
                         <span className="text-[10px] font-medium text-[#00FFC6]">Live Rewards 🔥</span>
                      </div>

                      {/* Interactive Genre / Category Tabs */}
                      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
                        {TABS.map((tab) => {
                          const isActive = activeTab === tab;
                          return (
                            <button
                              key={tab}
                              onClick={() => setActiveTab(tab)}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                                isActive
                                  ? 'bg-[#8B5CF6] text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              {tab}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Stream Cards Grid with Diverse Artist Pictures */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                         {displayedStreams.map((item) => {
                           const isCurrent = selectedTrack.id === item.id;
                           return (
                             <div 
                               key={item.id} 
                               onClick={() => {
                                 setSelectedTrack(item);
                                 setIsPlaying(true);
                               }}
                               className={`group/card relative rounded-xl p-2 bg-white/5 border transition-all cursor-pointer ${
                                 isCurrent 
                                   ? 'border-[#00FFC6] bg-white/[0.08] shadow-[0_0_15px_rgba(0,255,198,0.2)]' 
                                   : 'border-white/5 hover:border-[#00FFC6]/40 hover:bg-white/10'
                               }`}
                             >
                                <div className="aspect-square rounded-lg border border-white/10 relative overflow-hidden mb-2">
                                   <img 
                                     src={item.image} 
                                     alt={item.title} 
                                     className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                                   />
                                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                                   
                                   <span className="absolute top-1.5 left-1.5 text-[7.5px] font-black uppercase bg-black/70 backdrop-blur-md text-[#00FFC6] px-1.5 py-0.5 rounded border border-[#00FFC6]/30">
                                     {item.tag}
                                   </span>

                                   <div className={`absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all ${
                                     isCurrent && isPlaying 
                                       ? 'bg-[#00FFC6] text-black scale-105' 
                                       : 'bg-[#8B5CF6] text-white group-hover/card:scale-110'
                                   }`}>
                                     {isCurrent && isPlaying ? (
                                       <span className="text-[8px] font-black">❚❚</span>
                                     ) : (
                                       <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                     )}
                                   </div>
                                </div>
                                <div className="text-[10.5px] font-bold text-white truncate">{item.title}</div>
                                <div className="text-[8.5px] font-medium text-zinc-400 truncate">{item.artist}</div>
                             </div>
                           );
                         })}
                      </div>
                   </div>

                   {/* Dynamic Audio Player Bar */}
                   <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-2 bg-[#050510]/90 backdrop-blur-md rounded-2xl p-3 border border-white/10 shadow-lg">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 shrink-0">
                               <img 
                                 src={selectedTrack.image} 
                                 alt={selectedTrack.title} 
                                 className="w-full h-full object-cover" 
                               />
                            </div>
                            <div className="flex flex-col">
                               <span className="text-xs font-bold text-white truncate max-w-[130px] sm:max-w-[170px]">{selectedTrack.title}</span>
                               <span className="text-[9px] font-medium text-zinc-400 truncate">{selectedTrack.artist}</span>
                            </div>
                         </div>
                         <div className="flex items-center gap-2.5">
                            <button 
                              onClick={() => {
                                const currentIndex = ALL_STREAMS.findIndex(s => s.id === selectedTrack.id);
                                const prevIndex = (currentIndex - 1 + ALL_STREAMS.length) % ALL_STREAMS.length;
                                setSelectedTrack(ALL_STREAMS[prevIndex]);
                              }}
                              className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white text-xs hover:bg-white/20 transition-all cursor-pointer"
                              aria-label="Previous track"
                            >
                              ⏮
                            </button>
                            <button 
                              onClick={() => setIsPlaying(!isPlaying)}
                              className="w-8 h-8 rounded-full bg-[#00FFC6] text-black font-bold flex items-center justify-center text-xs shadow-[0_0_15px_rgba(0,255,198,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                              aria-label={isPlaying ? "Pause" : "Play"}
                            >
                              {isPlaying ? "❚❚" : "▶"}
                            </button>
                            <button 
                              onClick={() => {
                                const currentIndex = ALL_STREAMS.findIndex(s => s.id === selectedTrack.id);
                                const nextIndex = (currentIndex + 1) % ALL_STREAMS.length;
                                setSelectedTrack(ALL_STREAMS[nextIndex]);
                              }}
                              className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white text-xs hover:bg-white/20 transition-all cursor-pointer"
                              aria-label="Next track"
                            >
                              ⏭
                            </button>
                         </div>
                      </div>

                      {/* Waveform / Progress Line */}
                      <div className="w-full flex items-center gap-2 pt-1">
                         <span className="text-[8px] font-mono text-zinc-500">01:42</span>
                         <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                            <div className="h-full w-[60%] bg-gradient-to-r from-[#8B5CF6] to-[#00FFC6] rounded-full shadow-[0_0_8px_rgba(0,255,198,0.4)]" />
                         </div>
                         <span className="text-[8px] font-mono text-zinc-500">{selectedTrack.duration}</span>
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
