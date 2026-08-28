'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, ShoppingCart, Loader2, Heart, Share2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useMusicPlayer } from './MusicPlayerContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface TrendingTrack {
  id: number;
  uploaderId?: number;
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
  const router = useRouter();

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
              uploaderId: t.user_id,
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
    <div className="flex flex-col h-auto xl:h-[300px]">
      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3 px-1 shrink-0">Trending</h3>

      <div className="grid grid-cols-2 gap-3 xl:flex xl:flex-col xl:gap-2 overflow-y-auto xl:pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="col-span-2 xl:col-span-1 flex-1 flex items-center justify-center min-h-[140px] xl:min-h-[200px]">
            <Loader2 className="w-6 h-6 text-accent-purple animate-spin" />
          </div>
        ) : trending.length > 0 ? (
          trending.map((track) => (
            <div
              key={track.id}
              onClick={() => router.push(`/marketplace/${track.id}`)}
              onMouseEnter={() => setHoveredId(track.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="relative rounded-2xl overflow-hidden aspect-square sm:aspect-[4/3] xl:aspect-auto xl:h-[110px] shrink-0 group cursor-pointer border border-white/5 hover:border-accent-purple/30 transition-all duration-300 bg-[#121829]"
            >
              {/* Background */}
              <img
                src={track.image}
                alt={track.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/20 xl:to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-2.5 sm:p-3">
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0 pr-1 flex-1">
                    <h4 className="text-xs font-black text-white tracking-tight leading-tight truncate">{track.title}</h4>
                    <p className="text-[10px] text-zinc-400 font-medium mt-0.5 truncate">{track.creator}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {/* Play button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        playTrack({
                          id: track.id,
                          title: track.title,
                          artist: track.creator,
                          image: track.image,
                          audioUrl: track.audioUrl,
                          uploaderId: track.uploaderId,
                          price: track.price,
                          licenseTypes: track.licenseTypes
                        }, trending.map(t => ({
                          id: t.id,
                          title: t.title,
                          artist: t.creator,
                          image: t.image,
                          audioUrl: t.audioUrl,
                          uploaderId: t.uploaderId,
                          price: t.price,
                          licenseTypes: t.licenseTypes
                        })));
                      }}
                      className={`w-7 h-7 bg-accent-purple rounded-full flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer ${
                        hoveredId === track.id || currentTrack?.id === track.id
                          ? 'opacity-100 scale-100'
                          : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 scale-100 sm:scale-75 sm:group-hover:scale-100'
                      }`}
                      title={currentTrack?.id === track.id && isPlaying ? "Pause" : "Play"}
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Pause size={10} fill="white" className="text-white" />
                      ) : (
                        <Play size={10} fill="white" className="text-white ml-0.5" />
                      )}
                    </button>

                    {/* Save button */}
                    <button
                      onClick={(e) => handleSave(e, track.id)}
                      disabled={savingId === track.id}
                      className={`w-7 h-7 backdrop-blur-md border rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer ${
                        savedIds.includes(track.id)
                          ? 'bg-red-500/30 border-red-500/50 text-red-400'
                          : 'bg-black/60 sm:bg-black/40 border-white/15 text-white/90 hover:text-white'
                      } ${
                        hoveredId === track.id || savedIds.includes(track.id)
                          ? 'opacity-100 scale-100'
                          : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 scale-100 sm:scale-75 sm:group-hover:scale-100'
                      }`}
                      title="Save to library"
                    >
                      {savingId === track.id ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : (
                        <Heart size={10} fill={savedIds.includes(track.id) ? 'currentColor' : 'none'} />
                      )}
                    </button>

                    {/* Quick Share button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (typeof navigator !== 'undefined' && navigator.share) {
                          navigator.share({
                            title: `${track.title} by ${track.creator}`,
                            url: `${typeof window !== 'undefined' ? window.location.origin : ''}/marketplace/${track.id}`
                          }).catch(() => {});
                        } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                          navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}/marketplace/${track.id}`);
                          toast.success('Track link copied!');
                        }
                      }}
                      className={`w-7 h-7 bg-black/60 sm:bg-black/40 border border-white/15 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/80 shadow-lg transition-all duration-300 cursor-pointer ${
                        hoveredId === track.id
                          ? 'opacity-100 scale-100'
                          : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 scale-100 sm:scale-75 sm:group-hover:scale-100'
                      }`}
                      title="Share track"
                    >
                      <Share2 size={10} />
                    </button>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-1 pt-1">
                  {/* License badges */}
                  <div className="flex gap-1 flex-wrap">
                    {track.licenseTypes.slice(0, 1).map((lt) => (
                      <span
                        key={lt}
                        className="text-[8px] font-black uppercase tracking-wider bg-black/60 border border-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-md text-zinc-300 truncate max-w-[80px]"
                      >
                        {lt}
                      </span>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 shrink-0">
                    <span className={`text-[10px] font-black ${track.currency === 'Free' || track.price === '0.00' || Number(track.price) === 0 ? 'text-emerald-400' : 'text-accent-cyan'}`}>
                      {track.currency === '$0' || track.currency === '$0.00' || Number(track.price) === 0 ? 'Free' : track.currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 xl:col-span-1 flex-1 flex flex-col items-center justify-center text-zinc-600 bg-white/[0.02] border border-dashed border-white/5 rounded-2xl py-8 px-4 text-center">
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
