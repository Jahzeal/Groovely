'use client';

import React from 'react';
import { Plus } from 'lucide-react';

export const ActiveRoomCard = () => {
  return (
    <div className="glass-card p-8 flex flex-col items-center justify-center relative overflow-hidden h-full">
      {/* Blurred out content */}
      <div className="w-full flex flex-col h-full opacity-50 blur-[2px] pointer-events-none select-none">
        <div className="flex items-center justify-between w-full mb-8">
          <h2 className="text-xl font-black text-white tracking-tight uppercase">Active Room</h2>
          <button className="text-accent-purple text-xs font-bold uppercase tracking-widest">
             View All Rooms
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center py-10 w-full border-2 border-dashed border-white/5 rounded-3xl">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-zinc-600 mb-6">
             <Plus size={32} strokeWidth={2.5} />
          </div>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-10">You have no active rooms</p>
          
          <button className="bg-accent-purple text-white font-bold py-4 px-10 rounded-2xl flex items-center gap-2">
             <Plus size={18} strokeWidth={3} />
             <span>Create New Room</span>
          </button>
        </div>
      </div>

      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="px-6 py-3 bg-[#050510]/80 backdrop-blur-md border border-accent-purple/30 text-accent-purple font-black uppercase tracking-widest rounded-full shadow-[0_0_30px_rgba(157,0,255,0.2)]">
          Coming Soon
        </div>
      </div>

      {/* Decorative gradient blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent-purple/5 blur-[80px] rounded-full pointer-events-none" />
    </div>
  );
};
