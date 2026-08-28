'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MarketTopBar } from '@/components/marketplace/MarketTopBar';
import { GenreBar } from '@/components/marketplace/GenreBar';
import { FeaturedCarousel } from '@/components/marketplace/FeaturedCarousel';
import { ExploreCard } from '@/components/explore/ExploreCard';
import { CreatorCard } from '@/components/explore/CreatorCard';
import { MusicPlayer } from '@/components/marketplace/MusicPlayer';
import { CartProvider } from '@/components/marketplace/CartContext';
import { Twitter, Instagram } from '@/components/ui/SocialIcons';
import { Send, Disc, Loader2, Sparkles, TrendingUp, Users, Clock, Music } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiFetch, resolveIpfsUrl } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function ExplorePage() {
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const [trending, setTrending] = useState<any[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [creators, setCreators] = useState<any[]>([]);
  const [isLoadingCreators, setIsLoadingCreators] = useState(true);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(true);
  const [recent, setRecent] = useState<any[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await apiFetch('/api/fan/trending?limit=10');
        if (res && res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            if (Array.isArray(data.data.tracks)) {
              setTrending(data.data.tracks);
            } else if (Array.isArray(data.data)) {
              setTrending(data.data);
            }
          } else if (Array.isArray(data)) {
            setTrending(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch trending tracks', error);
      } finally {
        setIsLoadingTrending(false);
      }
    }

    async function fetchCreators() {
      try {
        const res = await apiFetch('/api/fan/creators?limit=20');
        if (res && res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            if (Array.isArray(data.data.creators)) {
              setCreators(data.data.creators);
            } else if (Array.isArray(data.data)) {
              setCreators(data.data);
            }
          } else if (Array.isArray(data)) {
            setCreators(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch creators', error);
      } finally {
        setIsLoadingCreators(false);
      }
    }

    async function fetchRecommended() {
      try {
        const res = await apiFetch('/api/fan/recommendations?limit=10');
        if (res && res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            const tracks = data.data.tracks || data.data.recommendations || data.data.data || (Array.isArray(data.data) ? data.data : []);
            setRecommended(tracks);
          } else if (Array.isArray(data)) {
            setRecommended(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch recommendations', error);
      } finally {
        setIsLoadingRecommended(false);
      }
    }

    async function fetchRecent() {
      try {
        const res = await apiFetch('/api/fan/recent?limit=10');
        if (res && res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            const tracks = data.data.tracks || data.data.recent || data.data.data || (Array.isArray(data.data) ? data.data : []);
            setRecent(tracks);
          } else if (Array.isArray(data)) {
            setRecent(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch recent tracks', error);
      } finally {
        setIsLoadingRecent(false);
      }
    }

    fetchTrending();
    fetchCreators();
    fetchRecommended();
    fetchRecent();
  }, []);

  const mapTracksToQueue = (tracks: any[]) => tracks.map(t => ({
    id: t.id,
    title: t.title,
    artist: t.artist_name || t.artistName || t.creatorName || t.artist || 'Grooveli Creator',
    image: resolveIpfsUrl(t.cover_url || t.coverArt || t.image || ''),
    audioUrl: resolveIpfsUrl(t.audio_url || t.audioUrl || t.preview_url),
    uploaderId: t.user_id,
    price: t.price || t.license_price
  }));

  const handleFollow = async (id: string | number, currentStatus: boolean) => {
    try {
      const method = currentStatus ? 'DELETE' : 'POST';
      const res = await apiFetch(`/api/fan/creators/${id}/follow`, {
        method,
      });
      
      if (res && res.ok) {
        const nextStatus = !currentStatus;
        toast.success(nextStatus ? 'Successfully followed creator!' : 'Unfollowed creator');
        setCreators(prev => prev.map(c => c.id === id ? { ...c, is_following: nextStatus, isFollowing: nextStatus } : c));
      } else {
        const data = await res?.json();
        if (data?.error === 'Already following this creator' && !currentStatus) {
           setCreators(prev => prev.map(c => c.id === id ? { ...c, is_following: true, isFollowing: true } : c));
           return;
        }
        toast.error(data?.message || data?.error || 'Action failed');
      }
    } catch (error) {
      console.error('Toggle follow error:', error);
      toast.error('Something went wrong');
    }
  };

  const filterByCategory = (list: any[]) => {
    if (activeCategory === 'All') return list;
    const catLower = activeCategory.toLowerCase();
    return list.filter(item => {
      const itemCat = (item.category || item.type || '').toLowerCase();
      if (catLower === 'music') return itemCat === 'music' || itemCat === 'song' || itemCat === 'track' || !itemCat;
      if (catLower === 'beats' || catLower === 'beat') return itemCat.includes('beat');
      if (catLower === 'podcasts' || catLower === 'podcast') return itemCat.includes('podcast');
      if (catLower === 'skits' || catLower === 'skit') return itemCat.includes('skit');
      return true;
    });
  };

  const filteredTrending = filterByCategory(trending);
  const filteredRecommended = filterByCategory(recommended);
  const filteredRecent = filterByCategory(recent);

  return (
    <CartProvider>
      <div className="flex h-screen overflow-hidden bg-[#070a14] text-white font-sans selection:bg-[#8A2BE2] selection:text-white">
        <Sidebar activePage="explore" />

        <div className="flex-1 flex flex-col min-w-0 bg-[#070a14]">
          <MarketTopBar />
          <GenreBar
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            activeGenre={selectedGenre}
            onSelectGenre={setSelectedGenre}
          />

          <main className="flex-1 overflow-y-auto flex flex-col">
            <div className="p-4 sm:p-6 md:p-8 pt-4 flex-1 flex flex-col justify-between min-h-[calc(100vh-140px)]">
              <div>
                {/* Dynamic Spotlight Carousel */}
                <div className="mb-8">
                  <FeaturedCarousel />
                </div>

                {/* Trending Now */}
                <div className="mb-8 sm:mb-12">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={18} className="text-accent-purple" />
                      <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">Trending Now</h2>
                    </div>
                    <button
                      onClick={() => router.push('/marketplace')}
                      className="text-xs font-bold text-accent-purple uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
                    >
                      View All
                    </button>
                  </div>
                  
                  {isLoadingTrending ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
                    </div>
                  ) : filteredTrending.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                      {filteredTrending.map((track, i) => (
                        <ExploreCard 
                          key={track.id || i} 
                          id={track.id}
                          title={track.title}
                          artist={track.artist_name || track.artistName || track.creatorName || track.artist || 'Grooveli Creator'}
                          image={track.cover_url || track.coverArt || track.image || 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                          audioUrl={track.audio_url || track.audioUrl || track.preview_url}
                          uploaderId={track.user_id}
                          price={track.price || track.license_price || '1.00'}
                          queue={mapTracksToQueue(filteredTrending)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white/[0.02] rounded-2xl border border-white/5">
                      <p className="text-zinc-500 font-medium text-xs sm:text-sm">No trending tracks found in this category.</p>
                    </div>
                  )}
                </div>

                {/* Creators */}
                <div className="mb-8 sm:mb-12">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-accent-cyan" />
                      <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">Featured Creators</h2>
                    </div>
                    <button
                      onClick={() => router.push('/marketplace')}
                      className="text-xs font-bold text-accent-purple uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
                    >
                      Discover More
                    </button>
                  </div>
                  
                  {isLoadingCreators ? (
                    <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="min-w-[120px] sm:min-w-[140px] h-[180px] sm:h-[200px] bg-white/5 rounded-full animate-pulse" />
                      ))}
                    </div>
                  ) : creators.length > 0 ? (
                    <div className="flex items-center gap-6 sm:gap-10 overflow-x-auto no-scrollbar pb-6 px-1">
                      {creators.map((creator, i) => (
                        <div key={creator.id || i} className="shrink-0">
                          <CreatorCard 
                            id={creator.id}
                            name={creator.displayName || creator.display_name || creator.name || 'Unknown'}
                            username={creator.username}
                            role={creator.creatorType || creator.creator_type || creator.role || 'Creator'}
                            image={creator.avatar_url || creator.avatarUrl || creator.profileUrl || creator.profile_url || creator.image}
                            isFollowing={creator.isFollowing || creator.is_following}
                            onFollow={(id) => handleFollow(id, !!(creator.isFollowing || creator.is_following))}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-white/[0.02] rounded-2xl border border-white/5">
                      <p className="text-zinc-500 font-medium text-xs sm:text-sm">No creators featured today.</p>
                    </div>
                  )}
                </div>

                {/* Recommended For You */}
                <div className="mb-8 sm:mb-12">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-accent-purple" />
                      <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">Recommended For You</h2>
                    </div>
                    <button
                      onClick={() => router.push('/marketplace')}
                      className="text-xs font-bold text-accent-purple uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
                    >
                      See More
                    </button>
                  </div>
                  
                  {isLoadingRecommended ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
                    </div>
                  ) : filteredRecommended.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                      {filteredRecommended.map((track, i) => (
                        <ExploreCard 
                          key={track.id || i} 
                          id={track.id}
                          title={track.title}
                          artist={track.artist_name || track.artistName || track.creatorName || track.artist || 'Grooveli Creator'}
                          image={track.cover_url || track.coverArt || track.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                          audioUrl={track.audio_url || track.audioUrl || track.preview_url}
                          uploaderId={track.user_id}
                          price={track.price || track.license_price || '1.00'}
                          queue={mapTracksToQueue(filteredRecommended)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white/[0.02] rounded-2xl border border-white/5">
                      <p className="text-zinc-500 font-medium text-xs sm:text-sm">Explore and listen to tracks to personalize your recommendations!</p>
                    </div>
                  )}
                </div>

                {/* Recently Added */}
                <div className="mb-16">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-accent-cyan" />
                      <h2 className="text-xl font-black text-white tracking-tight">Recently Added</h2>
                    </div>
                    <button
                      onClick={() => router.push('/marketplace')}
                      className="text-xs font-bold text-accent-purple uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
                    >
                      View Newest
                    </button>
                  </div>
                  
                  {isLoadingRecent ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
                    </div>
                  ) : filteredRecent.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {filteredRecent.map((track, i) => (
                        <ExploreCard 
                          key={track.id || i} 
                          id={track.id}
                          title={track.title}
                          artist={track.artist_name || track.artistName || track.creatorName || track.artist || 'Grooveli Creator'}
                          image={track.cover_url || track.coverArt || track.image || 'https://images.unsplash.com/photo-1485603348612-40db7f90bbbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                          audioUrl={track.audio_url || track.audioUrl || track.preview_url}
                          uploaderId={track.user_id}
                          price={track.price || track.license_price || '1.00'}
                          queue={mapTracksToQueue(filteredRecent)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white/[0.02] rounded-2xl border border-white/5">
                      <p className="text-zinc-500 font-medium text-xs sm:text-sm">New tracks are uploaded regularly. Check back soon!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <footer className="mt-auto pt-8 pb-28 sm:pb-32 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <a href="#" className="hover:text-accent-purple transition-colors">About Grooveli</a>
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
