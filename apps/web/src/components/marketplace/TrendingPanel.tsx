'use client';

import React, { useState, useEffect } from 'react';
import { Play, ShoppingCart, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface TrendingTrack {
  id: number;
  title: string;
  creator: string;
  image: string;
  licenseTypes: string[];
  price: string;
  currency: string;
}

export const TrendingPanel = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [trending, setTrending] = useState<TrendingTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await apiFetch('/api/market/trending?limit=10');
        if (res && res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            const tracks = data.data.tracks || data.data.trending || data.data.data || (Array.isArray(data.data) ? data.data : []);
            
            const mappedTracks = tracks.map((t: any) => ({
              id: t.id,
              title: t.title,
              creator: t.artist_name || t.artistName || t.creatorName || t.creator || 'Unknown',
              image: t.cover_url || t.coverArt || t.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
              licenseTypes: t.license_types || t.licenseTypes || ['License'],
              price: t.price || '0.00 ETH',
              currency: t.currency || t.fiat_price || '$0'
            }));
            
            setTrending(mappedTracks);
          }
        }
      } catch (error) {
        console.error('Failed to fetch market trending', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTrending();
  }, []);

  return (
    <div className="flex flex-col gap-1 min-h-[400px]">
      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3 px-1">Trending</h3>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-accent-purple animate-spin" />
        </div>
      ) : trending.length > 0 ? (
        trending.map((track) => (
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
        ))
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 bg-white/[0.02] border border-dashed border-white/5 rounded-2xl py-10 px-4 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest">No Trending Items</p>
          <p className="text-[10px] mt-1 font-medium">Check back later for trending tracks</p>
        </div>
      )}
    </div>
  );
};
