'use client';

import React from 'react';
import { Info, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  change: number;
  info?: string;
}

export const StatCard = ({ icon: Icon, label, value, change, info }: StatCardProps) => {
  const isPositive = change > 0;
  
  return (
    <div className="glass-card flex-1 p-6 relative overflow-hidden group">
      <div className="flex items-start justify-between mb-8">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-accent-purple group-hover:bg-accent-purple/10 transition-all duration-300">
           <Icon size={24} />
        </div>
        <button className="text-zinc-600 hover:text-white transition-colors">
           <Info size={18} />
        </button>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
        <div className="flex items-end justify-between gap-4">
          <h3 className="text-4xl font-black tracking-tight text-white">{value}</h3>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black ${isPositive ? 'bg-[#00FF85]/10 text-[#00FF85]' : 'bg-red-500/10 text-red-500'} border border-white/5`}>
             {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
             <span>{isPositive ? `+${change}%` : `${change}%`}</span>
          </div>
        </div>
        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">This Month</p>
      </div>
      
      {/* Decorative gradient blur */}
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-accent-purple/5 blur-[50px] rounded-full group-hover:bg-accent-purple/10 transition-all" />
    </div>
  );
};
