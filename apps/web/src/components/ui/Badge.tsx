'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';

export type LicenseType = 'Personal' | 'Remix' | 'Commercial' | 'Exclusive' | string;

interface BadgeProps {
  type: LicenseType;
  label?: string;
  showTooltip?: boolean;
  className?: string;
}

const LICENSE_DETAILS: Record<string, { title: string; description: string; badgeStyle: string }> = {
  Personal: {
    title: 'Personal License',
    description: 'Listen anywhere, download high-quality audio, add to personal playlists.',
    badgeStyle: 'bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20',
  },
  Remix: {
    title: 'Remix License',
    description: 'Use audio stems for non-monetized DJ sets, fan edits, and personal remixes.',
    badgeStyle: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20',
  },
  Commercial: {
    title: 'Commercial License',
    description: 'Monetize on YouTube, Spotify, Podcast & TV background sync up to 100k streams.',
    badgeStyle: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20',
  },
  Exclusive: {
    title: 'Exclusive License',
    description: 'Full master rights ownership, unlimited stream monetization & stem access.',
    badgeStyle: 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20',
  },
};

export function Badge({ type, label, showTooltip = true, className = '' }: BadgeProps) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const normalizedType = Object.keys(LICENSE_DETAILS).find(
    (k) => k.toLowerCase() === type.toLowerCase()
  ) || 'Personal';

  const info = LICENSE_DETAILS[normalizedType] || {
    title: `${type} Badge`,
    description: 'Standard track metadata badge.',
    badgeStyle: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/30',
  };

  return (
    <div className="relative inline-flex items-center group">
      <span
        onMouseEnter={() => setIsTooltipOpen(true)}
        onMouseLeave={() => setIsTooltipOpen(false)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border backdrop-blur-sm transition-all duration-200 cursor-help ${info.badgeStyle} ${className}`}
      >
        <span>{label || type}</span>
        {showTooltip && <Info size={11} className="opacity-70 group-hover:opacity-100" />}
      </span>

      {/* Hover Tooltip Popover */}
      {showTooltip && isTooltipOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-[#0E0E24] border border-white/15 rounded-2xl shadow-2xl z-50 text-left animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
          <p className="text-xs font-bold text-white mb-1">{info.title}</p>
          <p className="text-[11px] text-zinc-400 leading-relaxed">{info.description}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0E0E24]" />
        </div>
      )}
    </div>
  );
}
