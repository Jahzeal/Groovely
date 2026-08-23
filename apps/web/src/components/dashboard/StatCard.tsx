'use client';

import React from 'react';
import { Info, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  change?: number | null;
  changeType?: 'up' | 'down' | null;
  info?: string;
  comingSoon?: boolean;
  className?: string;
}

export const StatCard = ({ icon: Icon, label, value, change, changeType, info, comingSoon, className = '' }: StatCardProps) => {
  const isPositive = changeType ? changeType === 'up' : (change ? change > 0 : true);
  
  return (
    <div className={`bg-[#0F172A] border border-[#232B3E] rounded-[12px] p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group transition-all hover:border-[#8A2BE2]/40 ${className}`}>
      {/* Top Row: Circular Icon Badge + Info button */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#192134] flex items-center justify-center text-[#697184] group-hover:text-white transition-colors shrink-0">
           <Icon size={24} />
        </div>
        <button className="text-[#CACACA] hover:text-white transition-colors p-1" title={info || label}>
           <Info size={18} />
        </button>
      </div>

      {/* Metric Content */}
      <div className="space-y-1.5">
        <p className="font-['Space_Grotesk',sans-serif] font-bold text-[14px] sm:text-[16px] text-[#CACACA] leading-tight">
          {label}
        </p>

        <div className="flex items-center justify-between gap-2">
          {comingSoon ? (
            <div className="px-3 py-1 bg-[#8A2BE2]/10 text-[#8A2BE2] border border-[#8A2BE2]/20 rounded-full text-[10px] font-bold tracking-widest uppercase">
              Coming Soon
            </div>
          ) : (
            <h3 className="font-['Clash_Display',sans-serif] font-bold text-[22px] sm:text-[24px] leading-[32px] text-white">
              {value}
            </h3>
          )}
        </div>

        {/* Bottom Tag: This Month + Percent Pill */}
        <div className="flex items-center justify-between pt-1">
          <span className="font-['Space_Grotesk',sans-serif] font-bold text-[12px] text-[#CACACA]">
            This Month
          </span>
          {(change !== null && change !== undefined) && (
            <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-['Space_Grotesk',sans-serif] font-medium ${
              isPositive 
                ? 'bg-[rgba(0,255,136,0.1)] text-[#40FFA6]' 
                : 'bg-[rgba(255,51,102,0.1)] text-[#FA003E]'
            }`}>
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{isPositive && change > 0 ? `+${change}%` : `${change}%`}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
