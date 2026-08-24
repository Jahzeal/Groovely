'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CATEGORIES: Record<string, string[]> = {
  'Music': ['Hip-Hop', 'Afrobeats', 'R&B', 'Trap', 'Lo-Fi', 'Jazz', 'Electronic', 'Drill', 'Pop', 'Gospel', 'Reggae'],
  'Podcast': ['Society & Culture', 'Tech', 'Comedy', 'Business', 'Education', 'Music News', 'True Crime', 'Health', 'Sports'],
  'Samples': ['Drum Kits', 'Vocals', 'Melodies', 'One-Shots', 'Loops', 'Bass', 'FX', 'Percussion'],
  'Skit': ['Comedy', 'Social Commentary', 'Parody', 'Pranks', 'Satire', 'Street Interviews'],
  'Beat': ['Type Beats', 'Instrumentals', 'Trap Beats', 'Old School', 'Drill Beats', 'Acoustic'],
};

const CONTENT_TYPES = ['Podcast', 'Samples', 'Music', 'Skit', 'Beat'];

export const GenreBar = () => {
  const [activeType, setActiveType] = useState('Music');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  // Set default selection based on type
  useEffect(() => {
    const currentCats = CATEGORIES[activeType] || [];
    if (currentCats.length > 0) {
      setSelectedGenres([currentCats[0]]);
    } else {
      setSelectedGenres([]);
    }
  }, [activeType]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const currentCategories = CATEGORIES[activeType] || [];

  return (
    <div className="flex items-center gap-0 px-8 py-4 border-b border-[#2D3548] bg-[#192134]/80 backdrop-blur-md sticky top-[73px] z-20">
      {/* Dynamic Category pills - scrollable */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 pr-4">
        {currentCategories.map(cat => {
          const active = selectedGenres.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => toggleGenre(cat)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border shrink-0
                ${active
                  ? 'bg-accent-purple text-white border-accent-purple shadow-[0_0_12px_rgba(139,92,246,0.35)]'
                  : 'bg-white/5 text-zinc-400 border-white/5 hover:border-white/15 hover:text-white'
                }`}
            >
              {cat}
              {active && (
                <span className="ml-1 opacity-80" onClick={(e) => { e.stopPropagation(); toggleGenre(cat); }}>
                  <X size={11} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-white/10 shrink-0 mx-2" />

      {/* Content type tabs */}
      <div className="flex items-center gap-1 shrink-0">
        {CONTENT_TYPES.map(type => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200
              ${activeType === type
                ? 'bg-accent-purple text-white shadow-[0_0_12px_rgba(139,92,246,0.35)]'
                : 'text-zinc-500 hover:text-white hover:bg-white/5'
              }`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};
