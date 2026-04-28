'use client';

import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { useMusicPlayer } from '@/components/marketplace/MusicPlayerContext';

interface ExploreCardProps {
  id?: string | number;
  title: string;
  artist: string;
  image: string;
  audioUrl?: string;
  queue?: any[];
  type?: string; 
}

export const ExploreCard = ({ id, title, artist, image, audioUrl, queue }: ExploreCardProps) => {
  const [hovered, setHovered] = useState(false);
  const { playTrack } = useMusicPlayer();

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-2xl overflow-hidden group cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-300 w-full aspect-[16/10]"
    >
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      {/* Play button */}
      <button
        onClick={(e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
          playTrack({ id: id || title, title, artist, image, audioUrl }, queue);
        }}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-accent-purple rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-300
          ${hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
      >
        <Play size={16} fill="white" className="text-white ml-0.5" />
      </button>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h4 className="text-[15px] font-black text-white tracking-tight leading-tight mb-1">{title}</h4>
        <p className="text-xs text-zinc-400 font-medium">{artist}</p>
      </div>
    </div>
  );
};
