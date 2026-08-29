'use client';

import React, { useState, useEffect } from 'react';
import { Play, ShoppingCart, Heart, Loader2, Pause, Share2 } from 'lucide-react';
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
  const { addToCart } = useCart();
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('grooveli_user_id') || localStorage.getItem('groovely_user_id');
      if (stored) setCurrentUserId(Number(stored));
    }
  }, []);

  const isUploader = currentUserId !== null && uploaderId !== undefined && Number(uploaderId) === currentUserId;
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
      className="relative rounded-2xl overflow-hidden h-[165px] sm:h-[190px] group cursor-pointer border border-white/5 hover:border-accent-purple/30 transition-all duration-300"
    >
      {/* Image */}
      <img
        src={resolveIpfsUrl(image) || 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Quick Share button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share({
              title: `${title} by ${creator}`,
              url: `${typeof window !== 'undefined' ? window.location.origin : ''}/marketplace/${id}`
            }).catch(() => {});
          } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}/marketplace/${id}`);
            toast.success('Track link copied!');
          }
        }}
        className={`absolute top-2 sm:top-3 left-2 sm:left-3 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 border bg-black/60 sm:bg-black/40 backdrop-blur-md border-white/15 text-white hover:bg-black/80 shadow-lg cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100 scale-100 sm:scale-75 sm:group-hover:scale-100`}
        title="Share track"
      >
        <Share2 size={12} />
      </button>

      {/* Like button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-300 shadow-lg cursor-pointer
          ${liked ? 'bg-red-500/30 border-red-500/50 text-red-400' : 'bg-black/60 sm:bg-black/40 border-white/15 text-white/90 hover:text-white'}
          opacity-100 sm:opacity-0 sm:group-hover:opacity-100 scale-100 sm:scale-75 sm:group-hover:scale-100
          disabled:opacity-50`}
      >
        {isSaving ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Heart size={12} fill={liked ? 'currentColor' : 'none'} />
        )}
      </button>

      {/* Play button */}
      <button
        onClick={(e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
          playTrack({ 
            id: id || title, 
            title, 
            artist: creator, 
            image: resolveIpfsUrl(image), 
            audioUrl: resolveIpfsUrl(audioUrl), 
            uploaderId,
            price,
            licenseTypes
          }, queue);
        }}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-accent-purple rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-300 z-10 cursor-pointer
          ${isThisTrackPlaying ? 'opacity-100 scale-100' : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 scale-100 sm:scale-75 sm:group-hover:scale-100'}`}
      >
        {isThisTrackPlaying ? (
          <Pause size={14} fill="white" className="text-white" />
        ) : (
          <Play size={14} fill="white" className="text-white ml-0.5" />
        )}
      </button>

      {/* Footer info */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-4">
        <h4 className="text-xs sm:text-sm font-black text-white tracking-tight leading-tight mb-0.5 truncate">{title}</h4>
        <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium mb-1.5 truncate">{creator}</p>

        <div className="flex items-end justify-between gap-1">
          {/* License pills */}
          <div className="flex flex-wrap gap-1 overflow-hidden max-h-5">
            {(licenseTypes || []).slice(0, 1).map((lt) => (
              <span
                key={lt}
                className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-zinc-300 truncate max-w-[80px]"
              >
                {lt}
              </span>
            ))}
          </div>

          {/* Price + Buy */}
          <div className="flex items-center gap-1.5 shrink-0">
            {price === 'Free' || currency === 'Free' ? (
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Free
              </span>
            ) : (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-accent-purple/30 border border-accent-purple/50 flex items-center justify-center">
                  <span className="text-[6px] sm:text-[7px] text-accent-purple font-black">$</span>
                </div>
                <span className="text-[11px] sm:text-xs font-black text-white">
                  {currency && currency !== '$0' && currency !== '$0.00' && currency !== 'Free' 
                    ? currency 
                    : `$${Number(price) > 0 ? Number(price).toFixed(2) : '1.00'}`}
                </span>
              </div>
            )}
            {!isUploader && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addToCart({
                    id: String(id),
                    trackId: typeof id === 'number' ? id : parseInt(String(id)) || undefined,
                    uploaderId,
                    title,
                    creator,
                    image,
                    license: licenseTypes[0] || 'License',
                    price: 1.0,
                    currency: currency || '$1.00 USDC'
                  });
                }}
                className="w-6 h-6 sm:w-7 sm:h-7 bg-accent-purple hover:bg-accent-purple/80 rounded-lg flex items-center justify-center transition-all duration-300 shadow-[0_0_10px_rgba(139,92,246,0.4)] opacity-100 scale-100 cursor-pointer"
                title="Add to cart"
              >
                <ShoppingCart size={11} className="text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
