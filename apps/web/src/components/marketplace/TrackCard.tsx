'use client';

import React, { useState } from 'react';
import { Play, ShoppingCart, Heart, Loader2, Pause } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from './CartContext';
import { useMusicPlayer } from './MusicPlayerContext';
import { apiFetch, resolveIpfsUrl } from '@/lib/api';
import toast from 'react-hot-toast';

interface TrackCardProps {
  id?: string | number;
  title: string;
  creator: string;
  image: string;
  audioUrl?: string;
  licenseTypes: string[];
  price: string;
  currency: string;
  uploaderId?: number;
  queue?: any[];
}

export const TrackCard = ({ id, title, creator, image, audioUrl, licenseTypes, price, currency, uploaderId, queue }: TrackCardProps) => {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { openCart } = useCart();
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();

  const isThisTrackPlaying = currentTrack?.id === id && isPlaying;

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!id) return;
    
    setIsSaving(true);
    try {
      const method = liked ? 'DELETE' : 'POST';
      const res = await apiFetch(`/api/library/save/${id}`, {
        method
      });
      
      if (res && res.ok) {
        setLiked(!liked);
        toast.success(liked ? 'Removed from library' : 'Saved to library');
      } else {
        const errorData = await res?.json();
        throw new Error(errorData?.error || 'Action failed');
      }
    } catch (error: any) {
      console.error('Library action error:', error);
      toast.error(error.message || 'Action failed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      onClick={() => router.push(`/marketplace/${id || 1}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-2xl overflow-hidden h-[190px] group cursor-pointer border border-white/5 hover:border-accent-purple/30 transition-all duration-300"
    >
      {/* Image */}
      <img
        src={resolveIpfsUrl(image) || 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Like button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-300
          ${liked ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-black/40 border-white/10 text-zinc-500 hover:text-white'}
          ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}
          disabled:opacity-50`}
      >
        {isSaving ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <Heart size={13} fill={liked ? 'currentColor' : 'none'} />
        )}
      </button>

      {/* Play button */}
      <button
        onClick={(e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
          playTrack({ id: id || title, title, artist: creator, image: resolveIpfsUrl(image), audioUrl: resolveIpfsUrl(audioUrl), uploaderId }, queue);
        }}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-accent-purple rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-300
          ${hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
      >
        {isThisTrackPlaying ? (
          <Pause size={16} fill="white" className="text-white" />
        ) : (
          <Play size={16} fill="white" className="text-white ml-0.5" />
        )}
      </button>

      {/* Footer info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h4 className="text-sm font-black text-white tracking-tight leading-tight mb-0.5">{title}</h4>
        <p className="text-[11px] text-zinc-400 font-medium mb-2">{creator}</p>

        <div className="flex items-end justify-between">
          {/* License pills */}
          <div className="flex flex-wrap gap-1">
            {(licenseTypes || []).map((lt) => (
              <span
                key={lt}
                className="text-[9px] font-black uppercase tracking-wider bg-white/10 border border-white/10 px-2 py-0.5 rounded-md text-zinc-300"
              >
                {lt}
              </span>
            ))}
          </div>

          {/* Price + Buy */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1">
              <div className="w-3.5 h-3.5 rounded-full bg-accent-purple/30 border border-accent-purple/50 flex items-center justify-center">
                <span className="text-[7px] text-accent-purple font-black">Ξ</span>
              </div>
              <span className="text-xs font-black text-white">{currency}</span>
            </div>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); openCart(); }}
              className={`w-7 h-7 bg-accent-purple hover:bg-accent-purple/80 rounded-lg flex items-center justify-center transition-all duration-300 shadow-[0_0_10px_rgba(139,92,246,0.4)]
                ${hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
            >
              <ShoppingCart size={12} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
