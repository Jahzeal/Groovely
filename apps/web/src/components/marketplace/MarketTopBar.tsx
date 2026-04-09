'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, Bell, ShoppingCart } from 'lucide-react';
import { useCart } from './CartContext';

export const MarketTopBar = () => {
  const [sortOpen, setSortOpen] = useState(false);
  const [sortLabel, setSortLabel] = useState('Sort By');
  const { openCart } = useCart();

  const sortOptions = ['Most Popular', 'Newest', 'Price: Low to High', 'Price: High to Low', 'Trending'];

  return (
    <header className="flex items-center justify-between px-10 py-5 bg-[#050510]/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
      {/* Search + Sort */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-accent-purple transition-colors">
            <Search size={17} />
          </div>
          <input
            type="text"
            placeholder="Search beats, podcasts, samples..."
            className="w-full bg-[#0F0F1A] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-accent-purple/50 transition-all placeholder-zinc-600"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 bg-[#0F0F1A] border border-white/5 rounded-xl px-5 py-3 text-sm font-bold text-zinc-400 hover:text-white hover:border-white/10 transition-all whitespace-nowrap"
          >
            {sortLabel}
            <ChevronDown size={14} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
          </button>
          {sortOpen && (
            <div className="absolute top-full mt-2 right-0 w-52 bg-[#0F0F1A] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
              {sortOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setSortLabel(opt); setSortOpen(false); }}
                  className="w-full text-left px-5 py-3 text-sm font-medium text-zinc-400 hover:bg-accent-purple/10 hover:text-white transition-all"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-5 ml-8">
        <button className="text-zinc-500 hover:text-white transition-colors relative">
          <Bell size={21} strokeWidth={2} />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent-purple rounded-full shadow-[0_0_8px_rgba(157,0,255,0.7)]" />
        </button>

        <button 
          onClick={openCart}
          className="text-zinc-500 hover:text-white transition-colors relative"
        >
          <ShoppingCart size={21} strokeWidth={2} />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent-purple rounded-full shadow-[0_0_8px_rgba(157,0,255,0.7)]" />
        </button>

        <div className="flex items-center gap-3 bg-[#0F0F1A] border border-white/5 rounded-xl px-4 py-2 hover:bg-white/5 cursor-pointer transition-all">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10">
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="Wallet" className="w-full h-full object-contain" />
          </div>
          <span className="text-sm font-black tracking-tight text-white/90">0xc...y69</span>
          <ChevronDown size={13} className="text-zinc-500" />
        </div>
      </div>
    </header>
  );
};
