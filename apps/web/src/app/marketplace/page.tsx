'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MarketTopBar } from '@/components/marketplace/MarketTopBar';
import { GenreBar } from '@/components/marketplace/GenreBar';
import { FeaturedCarousel } from '@/components/marketplace/FeaturedCarousel';
import { TrendingPanel } from '@/components/marketplace/TrendingPanel';
import { TrackCard } from '@/components/marketplace/TrackCard';
import { MusicPlayer } from '@/components/marketplace/MusicPlayer';
import { Twitter, Instagram } from '@/components/ui/SocialIcons';
import { Send, Disc, Loader2 } from 'lucide-react';
import { apiFetch, cachedApiFetch } from '@/lib/api';
import { CartProvider } from '@/components/marketplace/CartContext';
import { useSearchParams } from 'next/navigation';

function MarketplaceContent() {
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
  
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q')?.toLowerCase() || '';

  const filterTracks = (tracks: any[]) => {
    let result = tracks;
    if (searchQuery) {
      result = result.filter(t => 
        t.title?.toLowerCase().includes(searchQuery) || 
        t.creator?.toLowerCase().includes(searchQuery) ||
        t.category?.toLowerCase().includes(searchQuery)
      );
    }
    if (selectedGenre) {
      const gLower = selectedGenre.toLowerCase();
      result = result.filter(t => 
        t.title?.toLowerCase().includes(gLower) ||
        t.description?.toLowerCase().includes(gLower) ||
        (Array.isArray(t.tags) && t.tags.some((tag: string) => tag.toLowerCase().includes(gLower))) ||
        (Array.isArray(t.license_types) && t.license_types.some((lt: string) => lt.toLowerCase().includes(gLower)))
      );
    }
    return result;
  };

  useEffect(() => {
    async function fetchForYou() {
      try {
        const { data } = await cachedApiFetch('/api/market/for-you?limit=10', {
          onBackgroundUpdate: (fresh) => {
            if (fresh?.success && fresh.data) {
              const tracks = fresh.data.tracks || fresh.data.recommendations || fresh.data.data || (Array.isArray(fresh.data) ? fresh.data : []);
              setForYou(tracks);
            }
          }
        });
        if (data) {
          const tracks = data.data?.tracks || data.data?.recommendations || data.data?.data || (Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
          setForYou(tracks);
        }
      } catch (error) {
        console.error('Failed to fetch marketplace for-you', error);
      } finally {
        setIsLoadingForYou(false);
      }
    }

    async function fetchAllTracks() {
      try {
        const { data } = await cachedApiFetch('/api/market/category/all?limit=20', {
          onBackgroundUpdate: (fresh) => {
            if (fresh?.success && fresh.data) {
              const tracks = fresh.data.tracks || fresh.data.data || (Array.isArray(fresh.data) ? fresh.data : []);
              setAllTracks(tracks);
            }
          }
        });
        if (data) {
          const tracks = data.data?.tracks || data.data?.data || (Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
          setAllTracks(tracks);
        }
      } catch (error) {
        console.error('Failed to fetch all tracks', error);
      } finally {
        setIsLoadingAll(false);
      }
    }

    async function fetchMusicTracks() {
      try {
        const { data } = await cachedApiFetch('/api/market/category/music?limit=20', {
          onBackgroundUpdate: (fresh) => {
            if (fresh?.success && fresh.data) {
              const tracks = fresh.data.tracks || fresh.data.data || (Array.isArray(fresh.data) ? fresh.data : []);
              setMusicTracks(tracks);
            }
          }
        });
        if (data) {
          const tracks = data.data?.tracks || data.data?.data || (Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
          setMusicTracks(tracks);
        }
      } catch (error) {
        console.error('Failed to fetch music tracks', error);
      } finally {
        setIsLoadingMusic(false);
      }
    }

    async function fetchPodcastTracks() {
      try {
        const { data } = await cachedApiFetch('/api/market/category/podcast?limit=20', {
          onBackgroundUpdate: (fresh) => {
            if (fresh?.success && fresh.data) {
              const tracks = fresh.data.tracks || fresh.data.data || (Array.isArray(fresh.data) ? fresh.data : []);
              setPodcastTracks(tracks);
            }
          }
        });
        if (data) {
          const tracks = data.data?.tracks || data.data?.data || (Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
          setPodcastTracks(tracks);
        }
      } catch (error) {
        console.error('Failed to fetch podcast tracks', error);
      } finally {
        setIsLoadingPodcast(false);
      }
    }

    async function fetchSkitTracks() {
      try {
        const { data } = await cachedApiFetch('/api/market/category/skit?limit=20', {
          onBackgroundUpdate: (fresh) => {
            if (fresh?.success && fresh.data) {
              const tracks = fresh.data.tracks || fresh.data.data || (Array.isArray(fresh.data) ? fresh.data : []);
              setSkitTracks(tracks);
            }
          }
        });
        if (data) {
          const tracks = data.data?.tracks || data.data?.data || (Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
          setSkitTracks(tracks);
        }
      } catch (error) {
        console.error('Failed to fetch skit tracks', error);
      } finally {
        setIsLoadingSkit(false);
      }
    }

    async function fetchBeatsTracks() {
      try {
        const { data } = await cachedApiFetch('/api/market/category/beats?limit=20', {
          onBackgroundUpdate: (fresh) => {
            if (fresh?.success && fresh.data) {
              const tracks = fresh.data.tracks || fresh.data.data || (Array.isArray(fresh.data) ? fresh.data : []);
              setBeatsTracks(tracks);
            }
          }
        });
        if (data) {
          const tracks = data.data?.tracks || data.data?.data || (Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
          setBeatsTracks(tracks);
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

  const mapTracksToQueue = (tracks: any[]) => tracks.map(t => ({
    id: t.id,
    title: t.title,
    artist: t.artist_name || t.artistName || t.creatorName || t.creator || 'Unknown',
    image: t.cover_url || t.coverArt || t.image || '',
    audioUrl: t.audio_url || t.audioUrl || t.preview_url,
    uploaderId: t.user_id
  }));

  return (
    <CartProvider>
      <div className="flex h-screen overflow-hidden bg-[#192134] text-white font-sans selection:bg-[#8A2BE2] selection:text-white">
        <Sidebar activePage="market" />

        <div className="flex-1 flex flex-col min-w-0 bg-[#192134]">
          <MarketTopBar />
          <GenreBar
            activeCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            activeGenre={selectedGenre}
            onSelectGenre={setSelectedGenre}
          />

          {/* Main scrollable area */}
          <main className="flex-1 overflow-y-auto flex flex-col">
            <div className="p-4 sm:p-6 md:p-8 pt-4 flex-1 flex flex-col justify-between min-h-[calc(100vh-140px)]">
              <div>
                {/* When 'All' is selected, show Featured + Trending and all overview shelves */}
                {selectedCategory === 'All' && (
                  <>
                    {/* Featured + Trending two-column layout */}
                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 mb-6 sm:mb-8">
                      <FeaturedCarousel />
                      <TrendingPanel />
                    </div>

                    {/* For You section */}
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-base sm:text-lg font-black uppercase tracking-widest text-white">For You</h2>
                      <button onClick={() => setSelectedCategory('All')} className="text-accent-purple text-xs font-bold uppercase tracking-widest hover:underline transition-all">
                        See All
                      </button>
                    </div>

                    {isLoadingForYou ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-accent-cyan animate-spin" />
                      </div>
                    ) : filterTracks(forYou).length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 mb-10 sm:mb-16">
                        {filterTracks(forYou).map((track, i) => (
                          <TrackCard 
                            key={track.id || i} 
                            id={track.id}
                            title={track.title}
                            creator={track.artist_name || track.artistName || track.creatorName || track.creator || 'Unknown'}
                            image={track.cover_url || track.coverArt || track.image || 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                            audioUrl={track.audio_url || track.audioUrl || track.preview_url}
                            licenseTypes={track.license_types || track.licenseTypes || ['License']}
                            price={track.price || '0.00 ETH'}
                            currency={track.currency || track.fiat_price || '$0'}
                            uploaderId={track.user_id}
                            queue={mapTracksToQueue(filterTracks(forYou))}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5 mb-10 sm:mb-16">
                        <p className="text-zinc-500 font-medium text-xs sm:text-sm">
                          {searchQuery ? `No results found for "${searchQuery}"` : 'Explore the marketplace to get personalized recommendations!'}
                        </p>
                      </div>
                    )}

                    {/* Explore All section */}
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-base sm:text-lg font-black uppercase tracking-widest text-white">Explore Marketplace</h2>
                    </div>

                    {isLoadingAll ? (
                      <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-accent-purple animate-spin" />
                      </div>
                    ) : filterTracks(allTracks).length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 mb-10 sm:mb-16">
                        {filterTracks(allTracks).map((track, i) => (
                          <TrackCard 
                            key={track.id || i} 
                            id={track.id}
                            title={track.title}
                            creator={track.artist_name || track.artistName || track.creatorName || track.creator || 'Unknown'}
                            image={track.cover_url || track.coverArt || track.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                            audioUrl={track.audio_url || track.audioUrl || track.preview_url}
                            licenseTypes={track.license_types || track.licenseTypes || ['License']}
                            price={track.price || '0.00 ETH'}
                            currency={track.currency || track.fiat_price || '$0'}
                            uploaderId={track.user_id}
                            queue={mapTracksToQueue(filterTracks(allTracks))}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 sm:py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed mb-10 sm:mb-16">
                        <p className="text-zinc-500 font-medium text-xs sm:text-sm">
                          {searchQuery ? `No results found for "${searchQuery}"` : 'No tracks found in the marketplace yet.'}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Music Category Section */}
                {(selectedCategory === 'All' || selectedCategory === 'Music') && (
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-base sm:text-lg font-black uppercase tracking-widest text-white">Music</h2>
                      {selectedCategory === 'All' && (
                        <button onClick={() => setSelectedCategory('Music')} className="text-accent-purple text-xs font-bold uppercase tracking-widest hover:underline transition-all">
                          See All
                        </button>
                      )}
                    </div>

                    {isLoadingMusic ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-10 h-10 text-accent-cyan animate-spin" />
                      </div>
                    ) : filterTracks(musicTracks).length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 mb-10 sm:mb-16">
                        {filterTracks(musicTracks).map((track, i) => (
                          <TrackCard 
                            key={track.id || i} 
                            id={track.id}
                            title={track.title}
                            creator={track.artist_name || track.artistName || track.creatorName || track.creator || 'Unknown'}
                            image={track.cover_url || track.coverArt || track.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                            audioUrl={track.audio_url || track.audioUrl || track.preview_url}
                            licenseTypes={track.license_types || track.licenseTypes || ['Music']}
                            price={track.price || '0.05 ETH'}
                            currency={track.currency || track.fiat_price || '$84'}
                            uploaderId={track.user_id}
                            queue={mapTracksToQueue(filterTracks(musicTracks))}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 sm:py-16 bg-white/5 rounded-3xl border border-white/5 mb-10 sm:mb-16">
                        <p className="text-zinc-500 font-medium text-xs sm:text-sm">
                          {selectedGenre ? `No music tracks found under "${selectedGenre}".` : 'New music tracks arriving soon.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Beats Category Section */}
                {(selectedCategory === 'All' || selectedCategory === 'Beats') && (
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-base sm:text-lg font-black uppercase tracking-widest text-white">Beats</h2>
                      {selectedCategory === 'All' && (
                        <button onClick={() => setSelectedCategory('Beats')} className="text-accent-purple text-xs font-bold uppercase tracking-widest hover:underline transition-all">
                          See All
                        </button>
                      )}
                    </div>

                    {isLoadingBeats ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-10 h-10 text-accent-purple animate-spin" />
                      </div>
                    ) : filterTracks(beatsTracks).length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 mb-10 sm:mb-16">
                        {filterTracks(beatsTracks).map((track, i) => (
                          <TrackCard 
                            key={track.id || i} 
                            id={track.id}
                            title={track.title}
                            creator={track.artist_name || track.artistName || track.creatorName || track.creator || 'Unknown'}
                            image={track.cover_url || track.coverArt || track.image || 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                            audioUrl={track.audio_url || track.audioUrl || track.preview_url}
                            licenseTypes={track.license_types || track.licenseTypes || ['Beat', 'Lease']}
                            price={track.price || '0.08 ETH'}
                            currency={track.currency || track.fiat_price || '$134'}
                            uploaderId={track.user_id}
                            queue={mapTracksToQueue(filterTracks(beatsTracks))}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 sm:py-16 bg-white/5 rounded-3xl border border-white/5 mb-10 sm:mb-16">
                        <p className="text-zinc-500 font-medium text-xs sm:text-sm">
                          {selectedGenre ? `No beats found under "${selectedGenre}".` : 'New beats are being cooked up. Stay tuned!'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Podcast Category Section */}
                {(selectedCategory === 'All' || selectedCategory === 'Podcasts') && (
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-base sm:text-lg font-black uppercase tracking-widest text-white">Podcasts</h2>
                      {selectedCategory === 'All' && (
                        <button onClick={() => setSelectedCategory('Podcasts')} className="text-accent-purple text-xs font-bold uppercase tracking-widest hover:underline transition-all">
                          See All
                        </button>
                      )}
                    </div>

                    {isLoadingPodcast ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-10 h-10 text-accent-purple animate-spin" />
                      </div>
                    ) : filterTracks(podcastTracks).length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 mb-10 sm:mb-16">
                        {filterTracks(podcastTracks).map((track, i) => (
                          <TrackCard 
                            key={track.id || i} 
                            id={track.id}
                            title={track.title}
                            creator={track.artist_name || track.artistName || track.creatorName || track.creator || 'Unknown'}
                            image={track.cover_url || track.coverArt || track.image || 'https://images.unsplash.com/photo-1478737270197-497851a1f29d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                            audioUrl={track.audio_url || track.audioUrl || track.preview_url}
                            licenseTypes={track.license_types || track.licenseTypes || ['Podcast']}
                            price={track.price || '0.02 ETH'}
                            currency={track.currency || track.fiat_price || '$33'}
                            uploaderId={track.user_id}
                            queue={mapTracksToQueue(filterTracks(podcastTracks))}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 sm:py-16 bg-white/5 rounded-3xl border border-white/5 mb-10 sm:mb-16">
                        <p className="text-zinc-500 font-medium text-xs sm:text-sm">
                          {selectedGenre ? `No podcasts found under "${selectedGenre}".` : 'Stay tuned for new podcast episodes.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Skits Category Section */}
                {(selectedCategory === 'All' || selectedCategory === 'Skits') && (
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-base sm:text-lg font-black uppercase tracking-widest text-white">Skits</h2>
                      {selectedCategory === 'All' && (
                        <button onClick={() => setSelectedCategory('Skits')} className="text-accent-purple text-xs font-bold uppercase tracking-widest hover:underline transition-all">
                          See All
                        </button>
                      )}
                    </div>

                    {isLoadingSkit ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-10 h-10 text-accent-cyan animate-spin" />
                      </div>
                    ) : filterTracks(skitTracks).length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 mb-10 sm:mb-16">
                        {filterTracks(skitTracks).map((track, i) => (
                          <TrackCard 
                            key={track.id || i} 
                            id={track.id}
                            title={track.title}
                            creator={track.artist_name || track.artistName || track.creatorName || track.creator || 'Unknown'}
                            image={track.cover_url || track.coverArt || track.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                            audioUrl={track.audio_url || track.audioUrl || track.preview_url}
                            licenseTypes={track.license_types || track.licenseTypes || ['Skit']}
                            price={track.price || '0.01 ETH'}
                            currency={track.currency || track.fiat_price || '$16'}
                            uploaderId={track.user_id}
                            queue={mapTracksToQueue(filterTracks(skitTracks))}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 sm:py-16 bg-white/5 rounded-3xl border border-white/5 mb-10 sm:mb-16">
                        <p className="text-zinc-500 font-medium text-xs sm:text-sm">
                          {selectedGenre ? `No skits found under "${selectedGenre}".` : 'Laughter is coming! Check back for new skits.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

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

export default function MarketplacePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent-purple border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}
