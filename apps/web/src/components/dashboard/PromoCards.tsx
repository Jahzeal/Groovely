'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Store } from 'lucide-react';

export const PromoCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
      {/* Tips Card (Figma: height 250px, rounded 12px, linear gradient) */}
      <div className="relative h-[250px] rounded-[12px] overflow-hidden group cursor-pointer border border-[#232B3E] bg-[#0F172A]">
        <img 
          src="https://images.unsplash.com/photo-1551288049-bbbda50d879e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
          alt="Grow Audience" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5 sm:p-6">
          <h3 className="font-['Clash_Display',sans-serif] font-bold text-[18px] sm:text-[20px] text-white tracking-tight leading-snug group-hover:text-[#8A2BE2] transition-colors">
            Tips to Grow Your Audience
          </h3>
          <div className="mt-2.5 flex items-center gap-1.5 text-zinc-400 group-hover:text-white transition-all text-xs font-['Space_Grotesk',sans-serif] font-bold">
             <span>Learn more</span>
             <ArrowRight size={14} />
          </div>
        </div>
      </div>

      {/* Web3 Card (Figma: height 250px, rounded 12px, linear gradient) */}
      <div className="relative h-[250px] rounded-[12px] overflow-hidden group cursor-pointer border border-[#232B3E] bg-[#0F172A]">
        <img 
          src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
          alt="How Web3 Works" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5 sm:p-6">
          <h3 className="font-['Clash_Display',sans-serif] font-bold text-[18px] sm:text-[20px] text-white tracking-tight leading-snug group-hover:text-[#40FFA6] transition-colors">
            How &ldquo;Web3&rdquo; Works
          </h3>
          <div className="mt-2.5 flex items-center gap-1.5 text-zinc-400 group-hover:text-white transition-all text-xs font-['Space_Grotesk',sans-serif] font-bold">
             <span>Explore guides</span>
             <ArrowRight size={14} />
          </div>
        </div>
      </div>

      {/* Marketplace CTA Card (Desktop / 3rd item) */}
      <Link href="/marketplace" className="block md:col-span-2 lg:col-span-1">
        <div className="relative h-[250px] rounded-[12px] overflow-hidden group cursor-pointer border border-[#8A2BE2]/30 bg-gradient-to-br from-[#8A2BE2]/15 via-[#0F172A] to-[#192134]">
          <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-6">
            <div className="w-10 h-10 rounded-xl bg-[#8A2BE2]/20 border border-[#8A2BE2]/40 flex items-center justify-center group-hover:bg-[#8A2BE2]/30 transition-all">
              <Store size={20} className="text-[#8A2BE2]" />
            </div>

            <div>
              <h3 className="font-['Clash_Display',sans-serif] font-bold text-[18px] sm:text-[20px] text-white tracking-tight leading-snug group-hover:text-[#8A2BE2] transition-colors">
                Visit the Marketplace
              </h3>
              <div className="mt-3 inline-flex items-center gap-1.5 bg-[#8A2BE2] hover:bg-[#8A2BE2]/90 text-white font-['Space_Grotesk',sans-serif] text-xs font-bold px-4 py-2 rounded-[8px] shadow-[0_0_16px_rgba(138,43,226,0.35)] transition-all">
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
