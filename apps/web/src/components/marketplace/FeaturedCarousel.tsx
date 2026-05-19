'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMusicPlayer } from './MusicPlayerContext';
import { ShoppingCart, ChevronLeft, ChevronRight, Play, Heart, Loader2, Pause } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

interface FeaturedTrack {
  id: number;
  title: string;
  creator: string;
  image: string;
  audioUrl?: string;
  licenseType: string;
  price: string;
  currency: string;
}

const FEATURED: FeaturedTrack[] = [
  {
    id: 1,
    title: 'Neon Soul',
    creator: 'Midnight Vibe',
    image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    licenseType: 'Exclusive License',
    price: '0.25 ETH',
    currency: '$420',
  },
  {
    id: 2,
    title: 'Lagos at 2AM',
    creator: 'Groove Master',
    image: 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    licenseType: 'Non-Exclusive',
    price: '0.05 ETH',
    currency: '$84',
  },
  {
    id: 3,
    title: 'Cosmic Drift',
    creator: 'Synth Wave',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    licenseType: 'Stems Included',
    price: '0.12 ETH',
    currency: '$202',
  },
  {
    id: 4,
    title: 'After Rain',
    creator: 'Static Echo',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    licenseType: 'Beat Lease',
    price: '0.03 ETH',
    currency: '$50',
  },
];

export const FeaturedCarousel = () => {
  const [active, setActive] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();

  const prev = () => setActive(i => (i === 0 ? FEATURED.length - 1 : i - 1));
  const next = () => setActive(i => (i === FEATURED.length - 1 ? 0 : i + 1));
  const track = FEATURED[active];

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isCurrentlySaved = savedIds.includes(track.id);
    setIsSaving(true);
    try {
      const res = await apiFetch(`/api/library/save/${track.id}`, {
        method: isCurrentlySaved ? 'DELETE' : 'POST'
      });
      if (res && res.ok) {
        if (isCurrentlySaved) {
          setSavedIds(prev => prev.filter(id => id !== track.id));
          toast.success('Removed from library');
        } else {
          setSavedIds(prev => [...prev, track.id]);
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
      setIsSaving(false);
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden h-[300px] shadow-2xl group">
      {/* Background image */}
      <img
        key={track.id}
        src={track.image}
        alt={track.title}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 scale-105 group-hover:scale-100"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-8">
        <div className="flex items-center justify-between mb-4">
          <Link href={`/marketplace/${track.id}`} className="block group/link">
            <h2 className="text-4xl font-black text-white tracking-tight mb-1 drop-shadow-lg group-hover/link:text-accent-purple transition-colors">{track.title}</h2>
            <p className="text-zinc-400 text-sm font-medium">{track.creator}</p>
          </Link>
          
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={handleSave}
              disabled={isSaving || savedIds.includes(track.id)}
              className={`w-12 h-12 backdrop-blur-md border rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-50 ${savedIds.includes(track.id) ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'}`}
            >
              {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Heart size={20} fill={savedIds.includes(track.id) ? 'currentColor' : 'none'} />}
            </button>
            <button
              onClick={() => playTrack({ 
                id: track.id, 
                title: track.title, 
                artist: track.creator, 
                image: track.image,
                audioUrl: track.audioUrl
              }, FEATURED.map(t => ({
                id: t.id,
                title: t.title,
                artist: t.creator,
                image: t.image,
                audioUrl: t.audioUrl
              })))}
              className="w-16 h-16 bg-accent-purple rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:scale-110 hover:shadow-[0_0_40px_rgba(139,92,246,0.7)] transition-all active:scale-95"
            >
              {currentTrack?.id === track.id && isPlaying ? (
                <Pause size={24} fill="white" className="text-white" />
              ) : (
                <Play size={24} fill="white" className="text-white ml-1" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* License pill */}
          <div className="bg-black/50 border border-white/10 backdrop-blur-md rounded-xl px-4 py-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">LICENSE</p>
            <p className="text-xs font-bold text-white">{track.licenseType}</p>
          </div>
          {/* Price pill */}
          <div className="bg-black/50 border border-white/10 backdrop-blur-md rounded-xl px-4 py-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">PRICE</p>
            <p className="text-xs font-bold text-white">{track.price}</p>
          </div>
          {/* Buy */}
          <Link href={`/marketplace/${track.id}`} className="ml-1 flex items-center gap-2 bg-white text-black hover:bg-zinc-200 font-bold text-sm px-6 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95">
            <ShoppingCart size={15} />
            Buy {track.currency}
          </Link>
        </div>
      </div>

      {/* Arrow nav */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 border border-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-accent-purple/50 transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 border border-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-accent-purple/50 transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {FEATURED.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`rounded-full transition-all duration-300 ${i === active ? 'w-6 h-2 bg-accent-purple' : 'w-2 h-2 bg-white/20 hover:bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};
