'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useMusicPlayer } from './MusicPlayerContext';
import {
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Play,
  Heart,
  Loader2,
  Pause,
  Sparkles,
  Upload,
  Radio,
  Flame,
  ArrowRight,
  ShieldCheck,
  Zap,
  Disc3,
  Headphones
} from 'lucide-react';
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

const PROMO_SLIDES = [
  {
    id: 'spotlight',
    tag: 'Spotlight Arena',
    tagIcon: Sparkles,
    tagColor: 'text-accent-cyan border-accent-purple/40 bg-accent-purple/20',
    title: 'No Featured Tracks Yet',
    description: 'When creators upload and mint tracks, they will automatically appear here in the spotlight! Be the first artist to claim the stage.',
    badges: [
      { icon: Flame, text: '100% Direct Payouts', color: 'text-accent-purple' },
      { icon: Radio, text: 'On-Chain Royalties', color: 'text-accent-cyan' },
    ],
    primaryCta: { label: 'Upload & Mint Track', href: '/dashboard/upload', icon: Upload },
    secondaryCta: { label: 'Explore Grooveli', href: '/explore', icon: ArrowRight },
    bgGradient: 'from-[#1a0f3c] via-[#0B0F19] to-[#082238]',
    glow1: 'bg-accent-purple/35 -top-24 -left-24',
    glow2: 'bg-accent-cyan/25 -bottom-24 -right-24',
  },
  {
    id: 'royalties',
    tag: 'Web3 Music Licensing',
    tagIcon: Zap,
    tagColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/20',
    title: 'Keep 100% of Your Creator Earnings',
    description: 'Mint tracks as limited editions or open licenses. Collect instant USDC payouts with automated smart contract royalties on every resale.',
    badges: [
      { icon: Zap, text: 'Instant USDC Settlement', color: 'text-emerald-400' },
      { icon: ShieldCheck, text: 'On-Chain Copyright', color: 'text-accent-cyan' },
    ],
    primaryCta: { label: 'Start Creating', href: '/dashboard/upload', icon: Disc3 },
    secondaryCta: { label: 'Creator Dashboard', href: '/dashboard', icon: ArrowRight },
    bgGradient: 'from-[#072922] via-[#0B0F19] to-[#12163b]',
    glow1: 'bg-emerald-500/30 -top-24 -left-24',
    glow2: 'bg-accent-purple/25 -bottom-24 -right-24',
  },
  {
    id: 'fans',
    tag: 'For Fans & Producers',
    tagIcon: Headphones,
    tagColor: 'text-pink-400 border-pink-500/40 bg-pink-500/20',
    title: 'Direct-to-Fan Music Marketplace',
    description: 'Discover exclusive beats, stream ad-free master audio, and support your favorite underground and chart-topping artists directly.',
    badges: [
      { icon: Headphones, text: 'Lossless Master Audio', color: 'text-pink-400' },
      { icon: ShieldCheck, text: 'Commercial License Included', color: 'text-accent-cyan' },
    ],
    primaryCta: { label: 'Browse Marketplace', href: '/marketplace', icon: ShoppingCart },
    secondaryCta: { label: 'Your Library', href: '/library', icon: ArrowRight },
    bgGradient: 'from-[#330f28] via-[#0B0F19] to-[#0f1f3d]',
    glow1: 'bg-pink-500/30 -top-24 -left-24',
    glow2: 'bg-accent-cyan/25 -bottom-24 -right-24',
  },
];

export const FeaturedCarousel = () => {
  const [featured, setFeatured] = useState<FeaturedTrack[]>([]);
  const [active, setActive] = useState(0);
  const [promoActive, setPromoActive] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await apiFetch('/api/market/category/all?limit=10');
        if (res && res.ok) {
          const json = await res.json();
          const items = json.data?.tracks || json.tracks || (Array.isArray(json.data) ? json.data : []) || (Array.isArray(json) ? json : []);
          
          if (Array.isArray(items) && items.length > 0) {
            setFeatured(items.map((item: any) => {
              const isFree = item.payment_model === 'none' ||
                item.price === 0 || item.price === '0' || item.price === '0.00' ||
                item.license_price === 0 || item.license_price === '0' || item.license_price === '0.00';

              const displayPrice = isFree
                ? 'Free'
                : (item.license_price ? `$${item.license_price} USDC` : (item.price ? `$${item.price} USDC` : '$1.00 USDC'));

              const displayCurrency = isFree
                ? 'Free'
                : (item.license_price ? `$${item.license_price}` : (item.price ? `$${item.price}` : '$1.00'));

              return {
                id: item.id,
                uploaderId: item.user_id,
                title: item.title,
                creator: item.artist_name || item.artist_username || 'Grooveli Creator',
                image: resolveIpfsUrl(item.cover_url || item.coverImage) || 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?auto=format&fit=crop&w=1200&q=80',
                audioUrl: item.audio_url,
                licenseType: isFree ? 'Free License' : (item.payment_model === 'royalty' ? 'Royalty License' : 'Commercial License'),
                price: displayPrice,
                currency: displayCurrency,
                licenseTypes: item.usage_rights || [isFree ? 'Free License' : 'Commercial License']
              };
            }));
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

  // Auto-slide effect
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      if (featured.length > 1) {
        setActive(i => (i === featured.length - 1 ? 0 : i + 1));
      } else {
        setPromoActive(i => (i === PROMO_SLIDES.length - 1 ? 0 : i + 1));
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [featured.length, isPaused]);

  const prev = () => {
    if (featured.length > 0) {
      setActive(i => (i === 0 ? featured.length - 1 : i - 1));
    } else {
      setPromoActive(i => (i === 0 ? PROMO_SLIDES.length - 1 : i - 1));
    }
  };

  const next = () => {
    if (featured.length > 0) {
      setActive(i => (i === featured.length - 1 ? 0 : i + 1));
    } else {
      setPromoActive(i => (i === PROMO_SLIDES.length - 1 ? 0 : i + 1));
    }
  };
  
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

  // Multi-Slide Sliding Spotlight Fallback Banner
  if (featured.length === 0) {
    return (
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative rounded-3xl overflow-hidden min-h-[320px] shadow-2xl border border-white/10 bg-[#0B0F19] group select-none"
      >
        {/* Sliding Slides Container */}
        <div
          className="flex transition-transform duration-700 ease-out h-full"
          style={{ transform: `translateX(-${promoActive * 100}%)` }}
        >
          {PROMO_SLIDES.map((slide, idx) => {
            const TagIcon = slide.tagIcon;
            const PrimaryIcon = slide.primaryCta.icon;
            const SecondaryIcon = slide.secondaryCta.icon;

            return (
              <div
                key={slide.id}
                className={`w-full shrink-0 min-h-[320px] flex flex-col justify-center p-6 sm:p-10 relative bg-gradient-to-br ${slide.bgGradient}`}
              >
                {/* Ambient Glows */}
                <div className={`absolute w-80 h-80 rounded-full blur-3xl pointer-events-none ${slide.glow1}`} />
                <div className={`absolute w-80 h-80 rounded-full blur-3xl pointer-events-none ${slide.glow2}`} />
                
                {/* Mesh Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.04] via-transparent to-black/40 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="max-w-xl">
                    {/* Spotlight Tag */}
                    <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] mb-3.5 shadow-sm ${slide.tagColor}`}>
                      <TagIcon size={12} className="animate-pulse" />
                      <span>{slide.tag}</span>
                    </div>

                    <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-2.5">
                      {slide.title}
                    </h2>
                    <p className="text-zinc-300 text-xs sm:text-sm font-medium leading-relaxed mb-4 max-w-lg">
                      {slide.description}
                    </p>

                    {/* Benefit Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                      {slide.badges.map((b, bIdx) => {
                        const BIcon = b.icon;
                        return (
                          <span
                            key={bIdx}
                            className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 backdrop-blur-md flex items-center gap-1.5 text-zinc-200"
                          >
                            <BIcon size={12} className={b.color} />
                            <span>{b.text}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full sm:w-auto shrink-0">
                    <Link
                      href={slide.primaryCta.href}
                      className="px-6 py-3.5 rounded-2xl bg-accent-purple hover:bg-accent-purple/90 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:scale-[1.02] active:scale-95 cursor-pointer text-center"
                    >
                      <PrimaryIcon size={15} />
                      <span>{slide.primaryCta.label}</span>
                    </Link>

                    <Link
                      href={slide.secondaryCta.href}
                      className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 hover:border-white/30 text-center cursor-pointer"
                    >
                      <span>{slide.secondaryCta.label}</span>
                      <SecondaryIcon size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Left Arrow Button */}
        <button
          onClick={prev}
          aria-label="Previous Slide"
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-accent-purple border border-white/15 text-white flex items-center justify-center transition-all duration-200 shadow-xl cursor-pointer hover:scale-110 active:scale-95 z-20 backdrop-blur-md"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={next}
          aria-label="Next Slide"
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-accent-purple border border-white/15 text-white flex items-center justify-center transition-all duration-200 shadow-xl cursor-pointer hover:scale-110 active:scale-95 z-20 backdrop-blur-md"
        >
          <ChevronRight size={20} />
        </button>

        {/* Bottom Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {PROMO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setPromoActive(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === promoActive
                  ? 'w-7 h-2 bg-accent-purple shadow-[0_0_10px_rgba(139,92,246,0.6)]'
                  : 'w-2 h-2 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  // Active Featured Tracks Carousel with Smooth Slide & Navigation
  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative rounded-3xl overflow-hidden h-[320px] sm:h-[340px] shadow-2xl group border border-white/10 bg-[#0B0F19] select-none"
    >
      {/* Sliding Track View */}
      <div
        className="flex transition-transform duration-700 ease-out h-full"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {featured.map((t) => (
          <div key={t.id} className="relative w-full h-full shrink-0">
            {/* Background image */}
            <img
              src={t.image}
              alt={t.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradients */}
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
                <Link href={`/marketplace/${t.id}`} className="block group/link min-w-0 flex-1">
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-1 drop-shadow-lg group-hover/link:text-accent-purple transition-colors truncate">
                    {t.title}
                  </h2>
                  <p className="text-zinc-300 text-xs sm:text-sm font-semibold truncate">
                    by <span className="text-white hover:underline">{t.creator}</span>
                  </p>
                </Link>
                
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`w-11 h-11 sm:w-12 sm:h-12 backdrop-blur-md border rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                      savedIds.includes(t.id)
                        ? 'bg-red-500/20 border-red-500/40 text-red-400'
                        : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                    }`}
                    title="Save to library"
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Heart size={18} fill={savedIds.includes(t.id) ? 'currentColor' : 'none'} />}
                  </button>

                  <button
                    onClick={() => playTrack({ 
                      id: t.id, 
                      title: t.title, 
                      artist: t.creator, 
                      image: t.image, 
                      audioUrl: t.audioUrl, 
                      uploaderId: t.uploaderId, 
                      price: t.price, 
                      licenseTypes: t.licenseTypes 
                    }, featured.map(item => ({
                      id: item.id,
                      title: item.title,
                      artist: item.creator,
                      image: item.image,
                      audioUrl: item.audioUrl,
                      uploaderId: item.uploaderId,
                      price: item.price,
                      licenseTypes: item.licenseTypes
                    })))}
                    className="w-14 h-14 sm:w-16 sm:h-16 bg-accent-purple hover:bg-accent-purple/90 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.6)] hover:scale-105 transition-all active:scale-95 cursor-pointer text-white"
                    title={currentTrack?.id === t.id && isPlaying ? "Pause" : "Play preview"}
                  >
                    {currentTrack?.id === t.id && isPlaying ? (
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
                  <p className="text-[11px] font-bold text-white">{t.licenseType}</p>
                </div>

                {/* Price pill */}
                <div className="bg-black/60 border border-white/10 backdrop-blur-md rounded-xl px-3.5 py-1.5">
                  <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">PRICE</p>
                  <p className="text-[11px] font-bold text-white">{t.price}</p>
                </div>

                {/* Buy / Stream Action */}
                {t.price === 'Free' ? (
                  <Link
                    href={`/marketplace/${t.id}`}
                    className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
                  >
                    <Headphones size={13} />
                    <span>Stream Free</span>
                  </Link>
                ) : (
                  <Link
                    href={`/marketplace/${t.id}`}
                    className="flex items-center gap-1.5 bg-white text-black hover:bg-zinc-200 font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
                  >
                    <ShoppingCart size={13} />
                    <span>Buy {t.currency}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrow Buttons */}
      <button
        onClick={prev}
        aria-label="Previous Track"
        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-accent-purple border border-white/15 text-white flex items-center justify-center transition-all duration-200 shadow-xl cursor-pointer hover:scale-110 active:scale-95 z-20 backdrop-blur-md"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={next}
        aria-label="Next Track"
        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-accent-purple border border-white/15 text-white flex items-center justify-center transition-all duration-200 shadow-xl cursor-pointer hover:scale-110 active:scale-95 z-20 backdrop-blur-md"
      >
        <ChevronRight size={20} />
      </button>

      {/* Pagination Indicators */}
      <div className="absolute bottom-4 right-6 sm:right-8 flex items-center gap-1.5 z-20">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 cursor-pointer ${
              i === active ? 'w-5 h-1.5 bg-accent-purple' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
