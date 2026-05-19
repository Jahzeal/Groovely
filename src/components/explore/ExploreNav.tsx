'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

const CONTENT_TYPES = ['All', 'Podcast', 'Samples', 'Music', 'Skit'];
const GENRES = ['genre', 'genre ', 'genre  ', 'genre   ', 'genre    ', 'genre     ']; // Just placeholders like the design

export const ExploreNav = () => {
  const [activeType, setActiveType] = useState('All');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['genre']); // Mocking the selected 'genre x' in image

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  return (
    <div className="flex items-center gap-0 px-8 py-4 bg-[#050510]/80 backdrop-blur-md sticky top-[73px] z-20 overflow-x-auto no-scrollbar">
      {/* Content type tabs */}
      <div className="flex items-center gap-1 shrink-0 pr-4">
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

      {/* Genre pills */}
      <div className="flex items-center gap-2 flex-1 pl-2">
        {GENRES.map((genre, index) => {
          // the first genre gets selected just to match the visual of 'genre X'
          const isActive = selectedGenres.includes(genre);
          return (
            <button
              key={index}
              onClick={() => toggleGenre(genre)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border shrink-0
                ${isActive
                  ? 'bg-accent-purple text-white border-accent-purple shadow-[0_0_12px_rgba(139,92,246,0.35)]'
                  : 'bg-white/5 text-zinc-400 border-white/5 hover:border-white/15 hover:text-white'
                }`}
            >
              genre
              {isActive && (
                <span className="ml-1 opacity-80" onClick={(e) => { e.stopPropagation(); toggleGenre(genre); }}>
                  <X size={11} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
