'use client';

import React from 'react';
import { X } from 'lucide-react';

export const CATEGORIES: Record<string, string[]> = {
  'All': [],
  'Music': ['Afrobeats', 'Hip-Hop', 'R&B', 'Trap', 'Lo-Fi', 'Jazz', 'Electronic', 'Drill', 'Pop', 'Gospel', 'Reggae'],
  'Beats': ['Trap Beats', 'Afro Beats', 'Type Beats', 'Drill Beats', 'Instrumentals', 'Old School', 'Lo-Fi Beats', 'Acoustic'],
  'Podcasts': ['Tech', 'Society & Culture', 'Comedy', 'Business', 'Education', 'Music News', 'True Crime', 'Sports'],
  'Skits': ['Comedy', 'Parody', 'Social Commentary', 'Pranks', 'Satire', 'Street Interviews'],
};

export const MAIN_CATEGORIES = ['All', 'Music', 'Beats', 'Podcasts', 'Skits'];

interface GenreBarProps {
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
  activeGenre?: string | null;
  onSelectGenre?: (genre: string | null) => void;
}

export const GenreBar: React.FC<GenreBarProps> = ({
  activeCategory = 'All',
  onSelectCategory,
  activeGenre = null,
  onSelectGenre,
}) => {
  const subgenres = CATEGORIES[activeCategory] || [];

  const handleCategoryClick = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    if (onSelectGenre) {
      onSelectGenre(null);
    }
  };

  const handleGenreClick = (genre: string) => {
    if (onSelectGenre) {
      if (activeGenre === genre) {
        onSelectGenre(null);
      } else {
        onSelectGenre(genre);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 px-4 sm:px-8 py-2.5 sm:py-3 border-b border-[#2D3548] bg-[#192134]/90 backdrop-blur-md sticky top-[69px] sm:top-[73px] z-20 transition-all">
      {/* Top row: Main Category Pills */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
        {MAIN_CATEGORIES.map((cat) => {
          const isActive = activeCategory.toLowerCase() === cat.toLowerCase() || (cat === 'Beats' && activeCategory.toLowerCase() === 'beat') || (cat === 'Podcasts' && activeCategory.toLowerCase() === 'podcast') || (cat === 'Skits' && activeCategory.toLowerCase() === 'skit');
          return (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-accent-purple text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] border border-accent-purple scale-[1.02]'
                  : 'bg-white/5 text-zinc-400 border border-white/5 hover:border-white/15 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Secondary row: Sub-genre chips (when a specific category is active) */}
      {subgenres.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 pb-0.5 border-t border-white/5">
          <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 shrink-0 pr-1">
            Genre:
          </span>
          {subgenres.map((genre) => {
            const isSelected = activeGenre?.toLowerCase() === genre.toLowerCase();
            return (
              <button
                key={genre}
                onClick={() => handleGenreClick(genre)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all duration-150 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'bg-white/[0.03] text-zinc-400 border border-white/5 hover:text-zinc-200 hover:bg-white/[0.06]'
                }`}
              >
                {genre}
                {isSelected && (
                  <span
                    className="ml-0.5 opacity-80"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenreClick(genre);
                    }}
                  >
                    <X size={10} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
