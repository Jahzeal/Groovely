'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MarketTopBar } from '@/components/marketplace/MarketTopBar';
import { ExploreNav } from '@/components/explore/ExploreNav';
import { ExploreHero } from '@/components/explore/ExploreHero';
import { ExploreCard } from '@/components/explore/ExploreCard';
import { CreatorCard } from '@/components/explore/CreatorCard';
import { MusicPlayer } from '@/components/marketplace/MusicPlayer';
import { CartProvider } from '@/components/marketplace/CartContext';
import { Twitter, Instagram } from '@/components/ui/SocialIcons';
import { Send, Disc, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function ExplorePage() {
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
    artist: t.artist_name || t.artistName || t.creatorName || t.artist || 'Unknown Artist',
    image: t.cover_url || t.coverArt || t.image || '',
    audioUrl: t.audio_url || t.audioUrl || t.preview_url
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
        // If we get "Already following" but we were trying to follow, just sync state
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

  return (
    <CartProvider>
      <div className="flex h-screen overflow-hidden bg-[#050510] text-white font-sans selection:bg-accent-purple selection:text-white">
        {/* We use role="fan" here to show the correct menu */}
        <Sidebar activePage="explore" />

        <div className="flex-1 flex flex-col min-w-0">
          <MarketTopBar />
          <ExploreNav />

          <main className="flex-1 overflow-y-auto pb-24">
            <div className="p-8 pt-4">
              <ExploreHero />

              {/* Trending Now */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-white tracking-tight">Trending Now</h2>
                  <button className="text-xs font-bold text-accent-purple uppercase tracking-widest hover:text-white transition-colors">View All</button>
                </div>
                
                {isLoadingTrending ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
                  </div>
                ) : trending.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {trending.map((track, i) => (
                      <ExploreCard 
                        key={track.id || i} 
                        id={track.id}
                        title={track.title}
                        artist={track.artist_name || track.artistName || track.creatorName || track.artist || 'Unknown Artist'}
                        image={track.cover_url || track.coverArt || track.image || 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                        audioUrl={track.audio_url || track.audioUrl || track.preview_url}
                        queue={mapTracksToQueue(trending)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-zinc-500 font-medium">No trending tracks found at the moment.</p>
                  </div>
                )}
              </div>

              {/* Creators */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-white tracking-tight">Creators</h2>
                  <button className="text-xs font-bold text-accent-purple uppercase tracking-widest hover:text-white transition-colors">Discover More</button>
                </div>
                
                {isLoadingCreators ? (
                  <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="min-w-[140px] h-[200px] bg-white/5 rounded-full animate-pulse" />
                    ))}
                  </div>
                ) : creators.length > 0 ? (
                  <div className="flex items-center gap-10 overflow-x-auto no-scrollbar pb-6 px-2">
                    {creators.map((creator, i) => (
                      <div key={creator.id || i} className="shrink-0">
                        <CreatorCard 
                          id={creator.id}
                          name={creator.displayName || creator.display_name || creator.name || 'Unknown'}
                          role={creator.creatorType || creator.creator_type || creator.role || 'Creator'}
                          image={creator.profileUrl || creator.profile_url || creator.image || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                          isFollowing={creator.isFollowing || creator.is_following}
                          onFollow={(id) => handleFollow(id, !!(creator.isFollowing || creator.is_following))}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-zinc-500 font-medium">No creators featured today.</p>
                  </div>
                )}
              </div>

              {/* Recommended For You */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-white tracking-tight">Recommended For You</h2>
                  <button className="text-xs font-bold text-accent-purple uppercase tracking-widest hover:text-white transition-colors">See More</button>
                </div>
                
                {isLoadingRecommended ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
                  </div>
                ) : recommended.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {recommended.map((track, i) => (
                      <ExploreCard 
                        key={track.id || i} 
                        id={track.id}
                        title={track.title}
                        artist={track.artist_name || track.artistName || track.creatorName || track.artist || 'Unknown Artist'}
                        image={track.cover_url || track.coverArt || track.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                        audioUrl={track.audio_url || track.audioUrl || track.preview_url}
                        queue={mapTracksToQueue(recommended)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-zinc-500 font-medium">Listening to more tracks helps us improve your recommendations!</p>
                  </div>
                )}
              </div>

              {/* Recently Added */}
              <div className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-white tracking-tight">Recently Added</h2>
                  <button className="text-xs font-bold text-accent-purple uppercase tracking-widest hover:text-white transition-colors">View Newest</button>
                </div>
                
                {isLoadingRecent ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
                  </div>
                ) : recent.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {recent.map((track, i) => (
                      <ExploreCard 
                        key={track.id || i} 
                        id={track.id}
                        title={track.title}
                        artist={track.artist_name || track.artistName || track.creatorName || track.artist || 'Unknown Artist'}
                        image={track.cover_url || track.coverArt || track.image || 'https://images.unsplash.com/photo-1485603348612-40db7f90bbbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                        audioUrl={track.audio_url || track.audioUrl || track.preview_url}
                        queue={mapTracksToQueue(recent)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-zinc-500 font-medium">New content is uploaded every day. Check back soon!</p>
                  </div>
                )}
              </div>

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
                  <a href="#" className="hover:text-accent-purple transition-colors">Feedback</a>
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
