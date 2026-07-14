'use client';

import React, { useState } from 'react';
import { Play, Heart, Loader2, Pause } from 'lucide-react';
import { useMusicPlayer } from '@/components/marketplace/MusicPlayerContext';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

interface ExploreCardProps {
  id?: string | number;
  title: string;
  artist: string;
  image: string;
  audioUrl?: string;
  uploaderId?: number;
  queue?: any[];
  type?: string; 
}

export const ExploreCard = ({ id, title, artist, image, audioUrl, uploaderId, queue }: ExploreCardProps) => {
  const [hovered, setHovered] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();

  const isThisTrackPlaying = currentTrack?.id === id && isPlaying;

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!id || isSaved) return;
    
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

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-2xl overflow-hidden group cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-300 w-full aspect-[16/10]"
    >
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className={`absolute top-3 right-3 w-8 h-8 backdrop-blur-md border rounded-full flex items-center justify-center transition-all duration-300 z-10 ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'} ${isSaved ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-black/40 border-white/10 text-white hover:bg-white/20'} disabled:opacity-50`}
      >
        {isSaving ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <Heart size={13} fill={isSaved ? 'currentColor' : 'none'} />
        )}
      </button>

      {/* Play button */}
      <button
        onClick={(e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
          playTrack({ id: id || title, title, artist, image, audioUrl, uploaderId }, queue);
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

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h4 className="text-[15px] font-black text-white tracking-tight leading-tight mb-1">{title}</h4>
        <p className="text-xs text-zinc-400 font-medium">{artist}</p>
      </div>
    </div>
  );
};
