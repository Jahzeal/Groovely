'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MarketTopBar } from '@/components/marketplace/MarketTopBar';
import { GenreBar } from '@/components/marketplace/GenreBar';
import { FeaturedCarousel } from '@/components/marketplace/FeaturedCarousel';
import { TrendingPanel } from '@/components/marketplace/TrendingPanel';
import { TrackCard } from '@/components/marketplace/TrackCard';
import { MusicPlayer } from '@/components/marketplace/MusicPlayer';
import { Twitter, Instagram } from '@/components/ui/SocialIcons';
import { Send, Disc, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { CartProvider } from '@/components/marketplace/CartContext';

export default function MarketplacePage() {
  const [forYou, setForYou] = useState<any[]>([]);
  const [isLoadingForYou, setIsLoadingForYou] = useState(true);
  const [allTracks, setAllTracks] = useState<any[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const [musicTracks, setMusicTracks] = useState<any[]>([]);
  const [isLoadingMusic, setIsLoadingMusic] = useState(true);
  const [podcastTracks, setPodcastTracks] = useState<any[]>([]);
  const [isLoadingPodcast, setIsLoadingPodcast] = useState(true);
  const [skitTracks, setSkitTracks] = useState<any[]>([]);
  const [isLoadingSkit, setIsLoadingSkit] = useState(true);
  const [beatsTracks, setBeatsTracks] = useState<any[]>([]);
  const [isLoadingBeats, setIsLoadingBeats] = useState(true);

  useEffect(() => {
    async function fetchForYou() {
      try {
        const res = await apiFetch('/api/market/for-you?limit=10');
        if (res && res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            const tracks = data.data.tracks || data.data.recommendations || data.data.data || (Array.isArray(data.data) ? data.data : []);
            setForYou(tracks);
          } else if (Array.isArray(data)) {
            setForYou(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch marketplace for-you', error);
      } finally {
        setIsLoadingForYou(false);
      }
    }

    async function fetchAllTracks() {
      try {
        const res = await apiFetch('/api/market/category/all?limit=20');
        if (res && res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            const tracks = data.data.tracks || data.data.data || (Array.isArray(data.data) ? data.data : []);
            setAllTracks(tracks);
          } else if (Array.isArray(data)) {
            setAllTracks(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch all tracks', error);
      } finally {
        setIsLoadingAll(false);
      }
    }

    async function fetchMusicTracks() {
      try {
        const res = await apiFetch('/api/market/category/music?limit=20');
        if (res && res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            const tracks = data.data.tracks || data.data.data || (Array.isArray(data.data) ? data.data : []);
            setMusicTracks(tracks);
          } else if (Array.isArray(data)) {
            setMusicTracks(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch music tracks', error);
      } finally {
        setIsLoadingMusic(false);
      }
    }

    async function fetchPodcastTracks() {
      try {
        const res = await apiFetch('/api/market/category/podcast?limit=20');
        if (res && res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            const tracks = data.data.tracks || data.data.data || (Array.isArray(data.data) ? data.data : []);
            setPodcastTracks(tracks);
          } else if (Array.isArray(data)) {
            setPodcastTracks(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch podcast tracks', error);
      } finally {
        setIsLoadingPodcast(false);
      }
    }

    async function fetchSkitTracks() {
      try {
        const res = await apiFetch('/api/market/category/skit?limit=20');
        if (res && res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            const tracks = data.data.tracks || data.data.data || (Array.isArray(data.data) ? data.data : []);
            setSkitTracks(tracks);
          } else if (Array.isArray(data)) {
            setSkitTracks(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch skit tracks', error);
      } finally {
        setIsLoadingSkit(false);
      }
    }

    async function fetchBeatsTracks() {
      try {
        const res = await apiFetch('/api/market/category/beats?limit=20');
        if (res && res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            const tracks = data.data.tracks || data.data.data || (Array.isArray(data.data) ? data.data : []);
            setBeatsTracks(tracks);
          } else if (Array.isArray(data)) {
            setBeatsTracks(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch beats tracks', error);
      } finally {
        setIsLoadingBeats(false);
      }
    }

    fetchForYou();
    fetchAllTracks();
    fetchMusicTracks();
    fetchPodcastTracks();
    fetchSkitTracks();
    fetchBeatsTracks();
  }, []);

  return (
    <CartProvider>
      <div className="flex h-screen overflow-hidden bg-[#050510] text-white font-sans selection:bg-accent-cyan selection:text-black">
        <Sidebar activePage="market" />

        <div className="flex-1 flex flex-col min-w-0">
          <MarketTopBar />
          <GenreBar />

          {/* Main scrollable area */}
          <main className="flex-1 overflow-y-auto pb-24">
            <div className="p-8 pt-4">
              {/* Featured + Trending two-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mb-4">
                <FeaturedCarousel />
                <TrendingPanel />
              </div>

              {/* For You section */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-black uppercase tracking-widest text-white">For You</h2>
                <button className="text-accent-purple text-xs font-bold uppercase tracking-widest hover:underline transition-all">
                  See All
                </button>
              </div>

              {isLoadingForYou ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-accent-cyan animate-spin" />
                </div>
              ) : forYou.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-16">
                  {forYou.map((track, i) => (
                    <TrackCard 
                      key={track.id || i} 
                      title={track.title}
                      creator={track.artist_name || track.artistName || track.creatorName || track.creator || 'Unknown'}
                      image={track.cover_url || track.coverArt || track.image || 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                      licenseTypes={track.license_types || track.licenseTypes || ['License']}
                      price={track.price || '0.00 ETH'}
                      currency={track.currency || track.fiat_price || '$0'}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5 mb-16">
                  <p className="text-zinc-500 font-medium">Explore the marketplace to get personalized recommendations!</p>
                </div>
              )}

              {/* Explore All section */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-black uppercase tracking-widest text-white">Explore Marketplace</h2>
                <div className="flex items-center gap-4">
                   <button className="text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Filters</button>
                   <div className="w-px h-3 bg-white/10" />
                   <button className="text-accent-purple text-xs font-bold uppercase tracking-widest hover:underline transition-all">
                     View All
                   </button>
                </div>
              </div>

              {isLoadingAll ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 text-accent-purple animate-spin" />
                </div>
              ) : allTracks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-16">
                  {allTracks.map((track, i) => (
                    <TrackCard 
                      key={track.id || i} 
                      title={track.title}
                      creator={track.artist_name || track.artistName || track.creatorName || track.creator || 'Unknown'}
                      image={track.cover_url || track.coverArt || track.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                      licenseTypes={track.license_types || track.licenseTypes || ['License']}
                      price={track.price || '0.00 ETH'}
                      currency={track.currency || track.fiat_price || '$0'}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed mb-16">
                  <p className="text-zinc-500 font-medium">No tracks found in the marketplace yet.</p>
                </div>
              )}

              {/* Music Category section */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-black uppercase tracking-widest text-white">Music</h2>
                <button className="text-accent-purple text-xs font-bold uppercase tracking-widest hover:underline transition-all">
                  Browse Music
                </button>
              </div>

              {isLoadingMusic ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-10 h-10 text-accent-cyan animate-spin" />
                </div>
              ) : musicTracks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-16">
                  {musicTracks.map((track, i) => (
                    <TrackCard 
                      key={track.id || i} 
                      title={track.title}
                      creator={track.artist_name || track.artistName || track.creatorName || track.creator || 'Unknown'}
                      image={track.cover_url || track.coverArt || track.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                      licenseTypes={track.license_types || track.licenseTypes || ['Music']}
                      price={track.price || '0.05 ETH'}
                      currency={track.currency || track.fiat_price || '$84'}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/5 mb-16">
                  <p className="text-zinc-500 font-medium">New music tracks arriving soon.</p>
                </div>
              )}

              {/* Podcast Category section */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-black uppercase tracking-widest text-white">Podcasts</h2>
                <button className="text-accent-purple text-xs font-bold uppercase tracking-widest hover:underline transition-all">
                  Browse Podcasts
                </button>
              </div>

              {isLoadingPodcast ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-10 h-10 text-accent-purple animate-spin" />
                </div>
              ) : podcastTracks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-16">
                  {podcastTracks.map((track, i) => (
                    <TrackCard 
                      key={track.id || i} 
                      title={track.title}
                      creator={track.artist_name || track.artistName || track.creatorName || track.creator || 'Unknown'}
                      image={track.cover_url || track.coverArt || track.image || 'https://images.unsplash.com/photo-1478737270197-497851a1f29d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                      licenseTypes={track.license_types || track.licenseTypes || ['Podcast']}
                      price={track.price || '0.02 ETH'}
                      currency={track.currency || track.fiat_price || '$33'}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/5 mb-16">
                  <p className="text-zinc-500 font-medium">Stay tuned for new podcast episodes.</p>
                </div>
              )}

              {/* Skit Category section */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-black uppercase tracking-widest text-white">Skits</h2>
                <button className="text-accent-purple text-xs font-bold uppercase tracking-widest hover:underline transition-all">
                  Browse Skits
                </button>
              </div>

              {isLoadingSkit ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-10 h-10 text-accent-cyan animate-spin" />
                </div>
              ) : skitTracks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-16">
                  {skitTracks.map((track, i) => (
                    <TrackCard 
                      key={track.id || i} 
                      title={track.title}
                      creator={track.artist_name || track.artistName || track.creatorName || track.creator || 'Unknown'}
                      image={track.cover_url || track.coverArt || track.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                      licenseTypes={track.license_types || track.licenseTypes || ['Skit']}
                      price={track.price || '0.01 ETH'}
                      currency={track.currency || track.fiat_price || '$16'}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/5 mb-16">
                  <p className="text-zinc-500 font-medium">Laughter is coming! Check back for new skits.</p>
                </div>
              )}

              {/* Beats Category section */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-black uppercase tracking-widest text-white">Beats & Instrumentals</h2>
                <button className="text-accent-purple text-xs font-bold uppercase tracking-widest hover:underline transition-all">
                  Browse Beats
                </button>
              </div>

              {isLoadingBeats ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-10 h-10 text-accent-purple animate-spin" />
                </div>
              ) : beatsTracks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-24">
                  {beatsTracks.map((track, i) => (
                    <TrackCard 
                      key={track.id || i} 
                      title={track.title}
                      creator={track.artist_name || track.artistName || track.creatorName || track.creator || 'Unknown'}
                      image={track.cover_url || track.coverArt || track.image || 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                      licenseTypes={track.license_types || track.licenseTypes || ['Beat', 'Lease']}
                      price={track.price || '0.08 ETH'}
                      currency={track.currency || track.fiat_price || '$134'}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/5 mb-24">
                  <p className="text-zinc-500 font-medium">New beats are being cooked up. Stay tuned!</p>
                </div>
              )}

              {/* Footer */}
              <footer className="py-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-60 hover:opacity-100 transition-opacity">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <a href="#" className="hover:text-accent-purple transition-colors">About Groovely</a>
                  <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                  <a href="#" className="hover:text-accent-purple transition-colors">Privacy Policy</a>
                  <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                  <a href="#" className="hover:text-accent-purple transition-colors">Terms of Use</a>
                  <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                  <a href="#" className="hover:text-accent-purple transition-colors">Docs/Developer API</a>
                  <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                  <a href="#" className="hover:text-accent-cyan transition-colors text-accent-cyan">Feedback</a>
                </div>
                <div className="flex items-center gap-6 text-zinc-500">
                  <a href="#" className="hover:text-white transition-all hover:scale-110"><Twitter size={17} /></a>
                  <a href="#" className="hover:text-white transition-all hover:scale-110"><Disc size={17} /></a>
                  <a href="#" className="hover:text-white transition-all hover:scale-110"><Send size={17} /></a>
                  <a href="#" className="hover:text-white transition-all hover:scale-110"><Instagram size={17} /></a>
                </div>
              </footer>
            </div>
          </main>
        </div>

        {/* Bottom Music Player */}
        <MusicPlayer />
      </div>
    </CartProvider>
  );
}
