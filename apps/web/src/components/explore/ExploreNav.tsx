'use client';

import React, { useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';

const CATEGORIES: Record<string, string[]> = {
  'All': ['All', 'Afrobeats', 'Trap', 'Hip-Hop', 'R&B', 'Lo-Fi', 'Electronic', 'Pop', 'Drill', 'Amapiano', 'Dancehall'],
  'Music': ['All', 'Afrobeats', 'Hip-Hop', 'R&B', 'Pop', 'Electronic', 'Jazz', 'Gospel', 'Amapiano', 'Dancehall'],
  'Beats': ['All', 'Trap Beats', 'Afro Beats', 'Boom Bap', 'Lo-Fi', 'Drill', 'Club', 'Melodic'],
  'Podcasts': ['All', 'Society & Culture', 'Tech & AI', 'Music Business', 'Comedy', 'Education', 'True Crime'],
  'Skits': ['All', 'Comedy', 'Viral Parody', 'Street Interviews', 'Standup', 'Satire'],
};

const CONTENT_TYPES = ['All', 'Music', 'Beats', 'Podcasts', 'Skits'];

interface ExploreNavProps {
  activeType?: string;
  onTypeChange?: (type: string) => void;
  selectedGenre?: string;
  onGenreChange?: (genre: string) => void;
}

export const ExploreNav: React.FC<ExploreNavProps> = ({
  activeType: externalType,
  onTypeChange,
  selectedGenre: externalGenre,
  onGenreChange,
}) => {
  const [internalType, setInternalType] = useState('All');
  const [internalGenre, setInternalGenre] = useState('All');

  const activeType = externalType !== undefined ? externalType : internalType;
  const selectedGenre = externalGenre !== undefined ? externalGenre : internalGenre;

  const handleTypeClick = (type: string) => {
    if (onTypeChange) onTypeChange(type);
    else setInternalType(type);

    if (onGenreChange) onGenreChange('All');
    else setInternalGenre('All');
  };

  const handleGenreClick = (genre: string) => {
    if (onGenreChange) onGenreChange(genre);
    else setInternalGenre(genre);
  };

  const currentGenres = CATEGORIES[activeType] || CATEGORIES['All'];

  return (
    <div className="flex items-center gap-0 px-4 sm:px-8 py-2.5 sm:py-3.5 bg-[#070a14]/90 backdrop-blur-xl sticky top-[65px] sm:top-[73px] z-20 overflow-x-auto no-scrollbar border-b border-white/10 shadow-lg">
      {/* Content type tabs */}
      <div className="flex items-center gap-1.5 shrink-0 pr-3 sm:pr-4">
        {CONTENT_TYPES.map(type => (
          <button
            key={type}
            onClick={() => handleTypeClick(type)}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer
              ${activeType === type
                ? 'bg-accent-purple text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] scale-[1.02]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-white/10 shrink-0 mr-3" />

      {/* Genre pills */}
      <div className="flex items-center gap-1.5 flex-1 overflow-x-auto no-scrollbar">
        {currentGenres.map((genre) => {
          const isActive = selectedGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => handleGenreClick(genre)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border
                ${isActive
                  ? 'bg-white/15 border-accent-purple/60 text-white shadow-sm'
                  : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
            >
              {genre}
            </button>
          );
        })}
      </div>
    </div>
  );
};
