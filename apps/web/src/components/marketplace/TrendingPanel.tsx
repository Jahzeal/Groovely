'use client';

import React, { useState } from 'react';
import { Play, ShoppingCart } from 'lucide-react';

interface TrendingTrack {
  id: number;
  title: string;
  creator: string;
  image: string;
  licenseTypes: string[];
  price: string;
  currency: string;
}

const TRENDING: TrendingTrack[] = [
  {
    id: 1,
    title: 'Purple Haze Reboot',
    creator: 'DJ Spectra',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    licenseTypes: ['Exclusive', 'Non-Exclusive'],
    price: '0.18 ETH',
    currency: '$302',
  },
  {
    id: 2,
    title: 'Frequency Shift',
    creator: 'Vault Audio',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    licenseTypes: ['Beat Lease'],
    price: '0.04 ETH',
    currency: '$67',
  },
  {
    id: 3,
    title: 'Burnt Orange Ep. 3',
    creator: 'The Podcast Lab',
    image: 'https://images.unsplash.com/photo-1478737270197-497851a1f29d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    licenseTypes: ['Stems', 'License'],
    price: '0.09 ETH',
    currency: '$151',
  },
];

export const TrendingPanel = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3 px-1">Trending</h3>

      {TRENDING.map((track) => (
        <div
          key={track.id}
          onMouseEnter={() => setHoveredId(track.id)}
          onMouseLeave={() => setHoveredId(null)}
          className="relative rounded-2xl overflow-hidden h-[130px] group cursor-pointer border border-white/5 hover:border-accent-purple/30 transition-all duration-300"
        >
          {/* Background */}
          <img
            src={track.image}
            alt={track.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-black text-white tracking-tight leading-tight">{track.title}</h4>
                <p className="text-[11px] text-zinc-400 font-medium mt-0.5">{track.creator}</p>
              </div>
              {/* Play button on hover */}
              <button
                className={`w-8 h-8 bg-accent-purple rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${hoveredId === track.id ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
              >
                <Play size={12} fill="white" className="text-white ml-0.5" />
              </button>
            </div>

            <div className="flex items-end justify-between">
              {/* License badges */}
              <div className="flex gap-1.5 flex-wrap">
                {track.licenseTypes.map((lt) => (
                  <span
                    key={lt}
                    className="text-[9px] font-black uppercase tracking-wider bg-black/60 border border-white/10 backdrop-blur-md px-2 py-0.5 rounded-md text-zinc-300"
                  >
                    {lt}
                  </span>
                ))}
              </div>

              {/* Price + buy */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-accent-purple/30 border border-accent-purple/50 flex items-center justify-center">
                    <span className="text-[7px] text-accent-purple font-black">Ξ</span>
                  </div>
                  <span className="text-xs font-black text-white">{track.currency}</span>
                </div>
                <button
                  className={`w-7 h-7 bg-accent-purple/80 hover:bg-accent-purple rounded-lg flex items-center justify-center transition-all duration-300 ${hoveredId === track.id ? 'opacity-100' : 'opacity-0'}`}
                >
                  <ShoppingCart size={12} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
