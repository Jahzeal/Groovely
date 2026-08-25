'use client';

import React from 'react';
import Link from 'next/link';

interface CreatorCardProps {
  id?: string | number;
  name: string;
  username?: string;
  role: string;
  image?: string;
  isFollowing?: boolean;
  onFollow?: (id: string | number) => void;
}

/** Convert ipfs:// URLs to gateway URL if applicable */
const ipfsToHttp = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('ipfs://')) {
    const cid = url.slice(7);
    if (cid.length < 40) return '';
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  }
  return url;
};

export const CreatorCard = ({ 
  id, 
  name, 
  username, 
  role, 
  image, 
  isFollowing = false, 
  onFollow 
}: CreatorCardProps) => {
  const profileHref = username ? `/creator/${username}` : '#';
  const displayImage = ipfsToHttp(image) || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username || name || 'groovely')}&backgroundColor=192134,0F172A,8A2BE2`;

  return (
    <div className="flex flex-col items-center gap-3 group">
      <Link 
        href={profileHref}
        className="w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] rounded-full overflow-hidden border-2 border-white/10 group-hover:border-[#8A2BE2] transition-all duration-300 cursor-pointer relative shadow-lg group-hover:shadow-[0_0_20px_rgba(138,43,226,0.4)]"
      >
        <img 
          src={displayImage} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username || name || 'groovely')}`;
          }}
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
      </Link>
      
      <Link href={profileHref} className="flex flex-col items-center gap-1 cursor-pointer">
        <div className="flex items-center gap-1.5 max-w-[140px]">
          <span className="text-[13px] font-black text-white group-hover:text-[#8A2BE2] transition-colors truncate">
            {name}
          </span>
        </div>
        {username && (
          <span className="text-[10px] font-medium text-zinc-400">
            @{username}
          </span>
        )}
        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-zinc-300">
          {role}
        </span>
      </Link>

      <button 
        onClick={() => id && onFollow?.(id)}
        className={`w-[100px] py-1.5 rounded-lg text-xs font-bold font-['Space_Grotesk',sans-serif] transition-all duration-300 cursor-pointer ${
          isFollowing 
          ? 'bg-transparent border border-white/20 text-white hover:bg-white/5' 
          : 'bg-[#8A2BE2] text-white hover:bg-opacity-90 shadow-[0_0_12px_rgba(138,43,226,0.35)] active:scale-95'
        }`}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  );
};
