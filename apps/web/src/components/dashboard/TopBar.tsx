'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Search, ShoppingCart, ChevronDown } from 'lucide-react';

export const TopBar = () => {
  return (
    <header className="flex items-center justify-between px-10 py-6 bg-[#050510] border-b border-white/5">
      <div className="flex items-center gap-8 flex-1">
        <button className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
           <ChevronLeft size={18} strokeWidth={3} />
           <span>Back</span>
        </button>

        <div className="relative w-full max-w-md group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-white transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full bg-[#0F0F1A] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-accent-purple/50 transition-all placeholder-zinc-600"
          />
        </div>

        <nav className="hidden md:flex items-center gap-6 ml-4">
          <Link href="/dashboard/rooms" className="text-sm font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
            Listening Room
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-zinc-500 hover:text-white transition-colors relative">
           <ShoppingCart size={22} strokeWidth={2.5} />
           <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent-purple rounded-full shadow-[0_0_8px_rgba(157,0,255,0.6)]" />
        </button>

        <div className="flex items-center gap-3 bg-[#0F0F1A] border border-white/5 rounded-xl px-4 py-2 hover:bg-white/5 cursor-pointer transition-all">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 group-hover:scale-110 transition-transform">
             <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="Profile" className="w-full h-full object-contain" />
          </div>
          <span className="text-sm font-black tracking-tight text-white/90">0xc...y69</span>
          <ChevronDown size={14} className="text-zinc-500" />
        </div>
      </div>
    </header>
  );
};
