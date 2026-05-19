import React from 'react';

export const ExploreHero = () => {
  return (
    <div className="relative w-full h-[320px] rounded-2xl overflow-hidden mb-8 group cursor-pointer">
      <img
        src="https://images.unsplash.com/photo-1542204165-65bf26472b9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
        alt="Tales of Glass and Ironwood"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      {/* Gradients to match the specific atmospheric lighting in prototype */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent opacity-70" />

      {/* Content positioning */}
      <div className="absolute bottom-10 left-10">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
          Tales of Glass and Ironwood
        </h1>
        <p className="text-lg md:text-xl font-bold text-zinc-300">
          Texas Dolly
        </p>
      </div>

      {/* Pagination dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-8 h-1.5 rounded-full bg-accent-purple" />
        <div className="w-8 h-1.5 rounded-full bg-white/20" />
        <div className="w-8 h-1.5 rounded-full bg-white/20" />
        <div className="w-8 h-1.5 rounded-full bg-white/20" />
        <div className="w-8 h-1.5 rounded-full bg-white/20" />
      </div>
    </div>
  );
};
