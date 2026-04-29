'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, ShoppingCart, Loader2, Heart } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useMusicPlayer } from './MusicPlayerContext';
import toast from 'react-hot-toast';

interface TrendingTrack {
  id: number;
  title: string;
  creator: string;
  image: string;
  audioUrl?: string;
  licenseTypes: string[];
  price: string;
  currency: string;
}

export const TrendingPanel = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [trending, setTrending] = useState<TrendingTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();

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
              audioUrl: t.audio_url || t.audioUrl || t.preview_url,
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

  const handleSave = async (e: React.MouseEvent, trackId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSavingId(trackId);
    try {
      const isCurrentlySaved = savedIds.includes(trackId);
      const res = await apiFetch(`/api/library/save/${trackId}`, {
        method: isCurrentlySaved ? 'DELETE' : 'POST'
      });
      if (res && res.ok) {
        if (isCurrentlySaved) {
          setSavedIds(prev => prev.filter(id => id !== trackId));
          toast.success('Removed from library');
        } else {
          setSavedIds(prev => [...prev, trackId]);
          toast.success('Saved to library');
        }
      } else {
        const errorData = await res?.json();
        throw new Error(errorData?.error || 'Action failed');
      }
    } catch (error: any) {
      console.error('Library action error:', error);
      toast.error(error.message || 'Action failed');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="flex flex-col h-[300px]">
      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3 px-1 shrink-0">Trending</h3>

      <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2 custom-scrollbar">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-6 h-6 text-accent-purple animate-spin" />
          </div>
        ) : trending.length > 0 ? (
          trending.map((track) => (
            <div
              key={track.id}
              onMouseEnter={() => setHoveredId(track.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="relative rounded-2xl overflow-hidden h-[110px] shrink-0 group cursor-pointer border border-white/5 hover:border-accent-purple/30 transition-all duration-300"
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
              <div className="absolute inset-0 flex flex-col justify-between p-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 pr-2">
                    <h4 className="text-xs font-black text-white tracking-tight leading-tight truncate">{track.title}</h4>
                    <p className="text-[10px] text-zinc-400 font-medium mt-0.5 truncate">{track.creator}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {/* Play button on hover */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        playTrack({
                          id: track.id,
                          title: track.title,
                          artist: track.creator,
                          image: track.image,
                          audioUrl: track.audioUrl
                        }, trending.map(t => ({
                          id: t.id,
                          title: t.title,
                          artist: t.creator,
                          image: t.image,
                          audioUrl: t.audioUrl
                        })));
                      }}
                      className={`w-7 h-7 bg-accent-purple rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${hoveredId === track.id ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Pause size={10} fill="white" className="text-white" />
                      ) : (
                        <Play size={10} fill="white" className="text-white ml-0.5" />
                      )}
                    </button>
                    {/* Save button on hover */}
                    <button
                      onClick={(e) => handleSave(e, track.id)}
                      disabled={savingId === track.id || savedIds.includes(track.id)}
                      className={`w-7 h-7 backdrop-blur-md border rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 ${savedIds.includes(track.id) ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'} ${hoveredId === track.id ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
                    >
                      {savingId === track.id ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : (
                        <Heart size={10} fill={savedIds.includes(track.id) ? 'currentColor' : 'none'} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  {/* License badges */}
                  <div className="flex gap-1 flex-wrap">
                    {track.licenseTypes.slice(0, 1).map((lt) => (
                      <span
                        key={lt}
                        className="text-[8px] font-black uppercase tracking-wider bg-black/60 border border-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-md text-zinc-300"
                      >
                        {lt}
                      </span>
                    ))}
                  </div>

                  {/* Price + buy */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-accent-purple/30 border border-accent-purple/50 flex items-center justify-center">
                        <span className="text-[6px] text-accent-purple font-black">Ξ</span>
                      </div>
                      <span className="text-[10px] font-black text-white">{track.currency}</span>
                    </div>
                    <button
                      className={`w-6 h-6 bg-accent-purple/80 hover:bg-accent-purple rounded-lg flex items-center justify-center transition-all duration-300 ${hoveredId === track.id ? 'opacity-100' : 'opacity-0'}`}
                    >
                      <ShoppingCart size={10} className="text-white" />
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

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.4);
        }
      `}</style>
    </div>
  );
};
