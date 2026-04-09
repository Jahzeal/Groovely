'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Store } from 'lucide-react';

export const PromoCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
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

      {/* Marketplace CTA Card */}
      <Link href="/dashboard/marketplace" className="block">
        <div className="relative h-64 rounded-[40px] overflow-hidden group cursor-pointer border border-accent-purple/20 bg-gradient-to-br from-accent-purple/20 via-[#0F0F1A] to-accent-cyan/10">
          {/* Animated glow orbs */}
          <div className="absolute top-6 right-6 w-32 h-32 bg-accent-purple/20 rounded-full blur-[40px] group-hover:bg-accent-purple/40 transition-all duration-700" />
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-accent-cyan/10 rounded-full blur-[30px] group-hover:bg-accent-cyan/25 transition-all duration-700" />

          <div className="absolute inset-0 flex flex-col justify-between p-10">
            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center group-hover:bg-accent-purple/30 transition-all">
              <Store size={22} className="text-accent-purple" />
            </div>

            <div>
              <h3 className="text-3xl font-black text-white tracking-tight leading-tight max-w-xs group-hover:text-accent-purple transition-colors">
                Visit the Marketplace
              </h3>
              <div className="mt-5 inline-flex items-center gap-2 bg-accent-purple hover:bg-accent-purple/90 text-white text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-[0_0_16px_rgba(139,92,246,0.35)] transition-all group-hover:shadow-[0_0_24px_rgba(139,92,246,0.5)] group-hover:scale-105">
                <span>Browse &amp; Buy</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
