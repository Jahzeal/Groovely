'use client';

import React, { useState } from 'react';
import { Play, Heart, Loader2, Pause, Share2 } from 'lucide-react';
import { useMusicPlayer } from '@/components/marketplace/MusicPlayerContext';
import { apiFetch, resolveIpfsUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ExploreCardProps {
  id?: string | number;
  title: string;
  artist: string;
  image: string;
  audioUrl?: string;
  price?: string;
  uploaderId?: number;
  queue?: any[];
  type?: string; 
}

export const ExploreCard = ({ id, title, artist, image, audioUrl, price, uploaderId, queue }: ExploreCardProps) => {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();

  const isThisTrackPlaying = currentTrack?.id === id && isPlaying;

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!id) return;
    
    setIsSaving(true);
    try {
      const method = isSaved ? 'DELETE' : 'POST';
      const res = await apiFetch(`/api/library/save/${id}`, {
        method
      });
      
      if (res && res.ok) {
        setIsSaved(!isSaved);
        toast.success(isSaved ? 'Removed from library' : 'Saved to library');
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

  const resolvedImageUrl = resolveIpfsUrl(image) || 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
  const resolvedAudioUrl = resolveIpfsUrl(audioUrl);

  return (
    <div
      onClick={() => { if (id) router.push(`/marketplace/${id}`); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-2xl overflow-hidden group cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-300 w-full aspect-[16/10]"
    >
      <img
        src={resolvedImageUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      {/* Quick Share button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share({
              title: `${title} by ${artist}`,
              url: `${typeof window !== 'undefined' ? window.location.origin : ''}/marketplace/${id}`
            }).catch(() => {});
          } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}/marketplace/${id}`);
            toast.success('Track link copied!');
          }
        }}
        className="absolute top-2 left-2 sm:top-3 sm:left-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 border bg-black/60 sm:bg-black/40 backdrop-blur-md border-white/15 text-white hover:bg-black/80 shadow-lg cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100 scale-100 sm:scale-75 sm:group-hover:scale-100 z-20"
        title="Share track"
      >
        <Share2 size={12} />
      </button>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 backdrop-blur-md border rounded-full flex items-center justify-center transition-all duration-300 z-20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 scale-100 sm:scale-75 sm:group-hover:scale-100 ${isSaved ? 'bg-red-500/30 border-red-500/50 text-red-400' : 'bg-black/60 sm:bg-black/40 border-white/15 text-white/90 hover:text-white'} disabled:opacity-50 cursor-pointer shadow-lg`}
      >
        {isSaving ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Heart size={12} fill={isSaved ? 'currentColor' : 'none'} />
        )}
      </button>

      {/* Play button */}
      <button
        type="button"
        onClick={(e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
          playTrack({ id: id || title, title, artist, image: resolvedImageUrl, audioUrl: resolvedAudioUrl, uploaderId, price }, queue);
        }}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-accent-purple rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-200 z-20 cursor-pointer
          ${isThisTrackPlaying ? 'opacity-100 scale-100' : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 scale-100 sm:scale-90 sm:group-hover:scale-100'}`}
      >
        {isThisTrackPlaying ? (
          <Pause size={14} fill="white" className="text-white" />
        ) : (
          <Play size={14} fill="white" className="text-white ml-0.5" />
        )}
      </button>

      <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-4">
        <h4 className="text-xs sm:text-[15px] font-black text-white tracking-tight leading-tight mb-0.5 truncate">{title}</h4>
        <p className="text-[10px] sm:text-xs text-zinc-400 font-medium truncate">{artist}</p>
      </div>
    </div>
  );
};
