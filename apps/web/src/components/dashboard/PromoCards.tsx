'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

export const PromoCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      {/* Tips Card */}
      <div className="relative h-64 rounded-[40px] overflow-hidden group cursor-pointer border border-white/5">
        <img 
          src="https://images.unsplash.com/photo-1551288049-bbbda50d879e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
          alt="Grow Audience" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
          <h3 className="text-3xl font-black text-white tracking-tight leading-tight max-w-xs group-hover:text-accent-purple transition-colors">Tips to Grow Your Audience</h3>
          <div className="mt-4 flex items-center gap-2 text-zinc-400 group-hover:text-white transition-all transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 uppercase tracking-widest text-xs font-black">
             <span>Learn more</span>
             <ArrowRight size={14} />
          </div>
        </div>
      </div>

      {/* Web3 Card */}
      <div className="relative h-64 rounded-[40px] overflow-hidden group cursor-pointer border border-white/5">
        <img 
          src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
          alt="How Web3 Works" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-all group-hover:backdrop-blur-none" />
        <div className="absolute inset-0 flex flex-col justify-end p-10">
          <div className="flex items-center gap-6 mb-8 transform -translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
             <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <span className="text-white font-black text-xl italic font-serif">ꞩ</span>
             </div>
             <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <span className="text-white font-black text-xl">Ð</span>
             </div>
             <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <span className="text-white font-black text-xl italic font-serif">₿</span>
             </div>
             <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <span className="text-white font-black text-xl">Ξ</span>
             </div>
          </div>
          <h3 className="text-3xl font-black text-white tracking-tight leading-tight max-w-xs group-hover:text-accent-cyan transition-colors">How "Web3" Works</h3>
          <div className="mt-4 flex items-center gap-2 text-zinc-400 group-hover:text-white transition-all transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 uppercase tracking-widest text-xs font-black">
             <span>Explore guides</span>
             <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};
