'use client';

import React from 'react';
import { Plus, Headphones } from 'lucide-react';
import Link from 'next/link';

export const ActiveRoomCard = () => {
  return (
    <div className="glass-card p-6 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden h-full">
      <div className="w-full flex flex-col h-full">
        <div className="flex items-center justify-between w-full mb-6">
          <h2 className="text-lg font-black text-white tracking-tight uppercase flex items-center gap-2">
            <Headphones size={20} className="text-accent-purple" />
            <span>Active Listening Rooms</span>
          </h2>
          <Link href="/rooms">
            <button className="text-accent-purple text-xs font-bold uppercase tracking-widest hover:underline cursor-pointer">
               View All Rooms
            </button>
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center py-8 w-full border-2 border-dashed border-white/10 rounded-3xl bg-[#0F172A]/40">
          <div className="w-16 h-16 rounded-full bg-[#8A2BE2]/10 border border-[#8A2BE2]/30 flex items-center justify-center text-accent-purple mb-4">
             <Headphones size={28} />
          </div>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-6 text-center">
            Host live sessions &amp; stream stems
          </p>
          
          <Link href="/rooms">
            <button className="bg-[#8A2BE2] hover:bg-[#7823c9] text-white font-bold py-3 px-8 rounded-2xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(138,43,226,0.4)] cursor-pointer text-xs">
               <Plus size={16} strokeWidth={3} />
               <span>Create / Join Room</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Decorative gradient blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent-purple/10 blur-[80px] rounded-full pointer-events-none" />
    </div>
  );
};
