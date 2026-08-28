'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMusicPlayer } from './MusicPlayerContext';
import { ShoppingCart, ChevronLeft, ChevronRight, Play, Heart, Loader2, Pause, Sparkles, Upload, Radio, Flame, ArrowRight } from 'lucide-react';
import { apiFetch, resolveIpfsUrl } from '@/lib/api';
import toast from 'react-hot-toast';

interface FeaturedTrack {
  id: number;
  uploaderId?: number;
  title: string;
  creator: string;
  image: string;
  audioUrl?: string;
  licenseType: string;
  price: string;
  currency: string;
  licenseTypes?: string[];
}

export const FeaturedCarousel = () => {
  const [featured, setFeatured] = useState<FeaturedTrack[]>([]);
  const [active, setActive] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await apiFetch('/api/market/category/all?limit=10');
        if (res && res.ok) {
          const json = await res.json();
          const items = json.data?.tracks || json.tracks || (Array.isArray(json.data) ? json.data : []) || (Array.isArray(json) ? json : []);
          
          if (Array.isArray(items) && items.length > 0) {
            setFeatured(items.map((item: any) => ({
              id: item.id,
              uploaderId: item.user_id,
              title: item.title,
              creator: item.artist_name || item.artist_username || 'Grooveli Creator',
              image: resolveIpfsUrl(item.cover_url || item.coverImage) || 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?auto=format&fit=crop&w=1200&q=80',
              audioUrl: item.audio_url,
              licenseType: item.payment_model === 'free' ? 'Free License' : 'Commercial License',
              price: item.license_price ? `${item.license_price} USDC` : '$1.00 USDC',
              currency: item.license_price ? `$${item.license_price}` : '$1.00',
              licenseTypes: item.usage_rights || [item.payment_model === 'free' ? 'Free License' : 'Commercial License']
            })));
          }
        }
      } catch (err) {
        console.error('Failed to load featured tracks:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const prev = () => setActive(i => (i === 0 ? featured.length - 1 : i - 1));
  const next = () => setActive(i => (i === featured.length - 1 ? 0 : i + 1));
  
  const track = featured[active];

  const handleSave = async (e: React.MouseEvent) => {
    if (!track) return;
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

  if (loading) {
    return (
      <div className="relative rounded-3xl overflow-hidden h-[300px] shadow-2xl bg-[#0B0F19] border border-white/5 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Loading Spotlight...</p>
      </div>
    );
  }

  // Premium Spotlight Fallback Banner
  if (featured.length === 0) {
    return (
      <div className="relative rounded-3xl overflow-hidden min-h-[300px] shadow-2xl bg-gradient-to-br from-[#130d2e] via-[#0B0F19] to-[#071d2b] border border-white/10 flex flex-col justify-center p-6 sm:p-10 group">
        {/* Ambient Glows */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-accent-purple/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-accent-cyan/20 rounded-full blur-3xl pointer-events-none" />

        {/* Ambient Mesh Texture Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.03] via-transparent to-black/40 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            {/* Spotlight Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-purple/20 border border-accent-purple/40 text-accent-cyan text-[10px] font-black uppercase tracking-[0.2em] mb-3.5 shadow-sm">
              <Sparkles size={12} className="text-accent-purple animate-pulse" />
              <span>Spotlight Arena</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-2.5">
              No Featured Tracks Yet
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed mb-4 max-w-lg">
              When creators upload and mint tracks, they will automatically appear here in the spotlight! Be the first artist to claim the stage.
            </p>

            {/* Benefit Badges */}
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-zinc-400">
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1 text-zinc-300">
                <Flame size={12} className="text-accent-purple" /> 100% Direct Payouts
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1 text-zinc-300">
                <Radio size={12} className="text-accent-cyan" /> On-Chain Royalties
              </span>
            </div>
          </div>

          {/* CTA Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full sm:w-auto shrink-0">
            <Link
              href="/dashboard/upload"
              className="px-6 py-3.5 rounded-2xl bg-accent-purple hover:bg-accent-purple/90 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:scale-[1.02] active:scale-95 cursor-pointer text-center"
            >
              <Upload size={15} />
              <span>Upload & Mint Track</span>
            </Link>

            <Link
              href="/explore"
              className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 hover:border-white/20 text-center"
            >
              <span>Explore Grooveli</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active Featured Carousel
  return (
    <div className="relative rounded-3xl overflow-hidden h-[320px] sm:h-[340px] shadow-2xl group border border-white/10 bg-[#0B0F19]">
      {/* Background image with smooth transition */}
      <img
        key={track.id}
        src={track.image}
        alt={track.title}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 scale-105 group-hover:scale-100"
      />
      {/* Dynamic gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />

      {/* Top Spotlight Tag */}
      <div className="absolute top-6 left-6 sm:left-8 z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-accent-cyan text-[10px] font-black uppercase tracking-[0.2em] shadow-md">
          <Sparkles size={11} className="text-accent-purple animate-pulse" />
          <span>Featured Spotlight</span>
        </div>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
        <div className="flex items-end justify-between mb-4 gap-4">
          <Link href={`/marketplace/${track.id}`} className="block group/link min-w-0 flex-1">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-1 drop-shadow-lg group-hover/link:text-accent-purple transition-colors truncate">
              {track.title}
            </h2>
            <p className="text-zinc-300 text-xs sm:text-sm font-semibold truncate">
              by <span className="text-white hover:underline">{track.creator}</span>
            </p>
          </Link>
          
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`w-11 h-11 sm:w-12 sm:h-12 backdrop-blur-md border rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                savedIds.includes(track.id)
                  ? 'bg-red-500/20 border-red-500/40 text-red-400'
                  : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
              }`}
              title="Save to library"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Heart size={18} fill={savedIds.includes(track.id) ? 'currentColor' : 'none'} />}
            </button>

            <button
              onClick={() => playTrack({ 
                id: track.id, 
                title: track.title, 
                artist: track.creator, 
                image: track.image,
                audioUrl: track.audioUrl,
                uploaderId: track.uploaderId,
                price: track.price,
                licenseTypes: track.licenseTypes
              }, featured.map(t => ({
                id: t.id,
                title: t.title,
                artist: t.creator,
                image: t.image,
                audioUrl: t.audioUrl,
                uploaderId: t.uploaderId,
                price: t.price,
                licenseTypes: t.licenseTypes
              })))}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-accent-purple hover:bg-accent-purple/90 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.6)] hover:scale-105 transition-all active:scale-95 cursor-pointer text-white"
              title={currentTrack?.id === track.id && isPlaying ? "Pause" : "Play preview"}
            >
              {currentTrack?.id === track.id && isPlaying ? (
                <Pause size={24} fill="white" className="text-white" />
              ) : (
                <Play size={24} fill="white" className="text-white ml-0.5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* License pill */}
          <div className="bg-black/60 border border-white/10 backdrop-blur-md rounded-xl px-3.5 py-1.5">
            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">LICENSE</p>
            <p className="text-[11px] font-bold text-white">{track.licenseType}</p>
          </div>

          {/* Price pill */}
          <div className="bg-black/60 border border-white/10 backdrop-blur-md rounded-xl px-3.5 py-1.5">
            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">PRICE</p>
            <p className="text-[11px] font-bold text-white">{track.price}</p>
          </div>

          {/* Buy Action */}
          <Link
            href={`/marketplace/${track.id}`}
            className="flex items-center gap-1.5 bg-white text-black hover:bg-zinc-200 font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            <ShoppingCart size={13} />
            <span>Buy {track.currency}</span>
          </Link>
        </div>
      </div>

      {/* Navigation Arrows */}
      {featured.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 bg-black/60 border border-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-accent-purple transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 bg-black/60 border border-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-accent-purple transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>

          {/* Pagination Indicators */}
          <div className="absolute bottom-4 right-6 sm:right-8 flex items-center gap-1.5">
            {featured.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  i === active ? 'w-5 h-1.5 bg-accent-purple' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
