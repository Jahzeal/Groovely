'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MarketTopBar } from '@/components/marketplace/MarketTopBar';
import { TrackCard } from '@/components/marketplace/TrackCard';
import { MusicPlayer } from '@/components/marketplace/MusicPlayer';
import { useMusicPlayer } from '@/components/marketplace/MusicPlayerContext';
import { Button } from '@/components/ui/Button';
import {
  ChevronLeft,
  ShoppingCart,
  Search,
  Bell,
  ChevronDown,
  Play,
  Pause,
  Share2,
  ExternalLink,
  Copy,
  Info
} from 'lucide-react';
import { CartProvider, useCart } from '@/components/marketplace/CartContext';
import { use } from 'react';
import { apiFetch } from '@/lib/api';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();
  
  const [trackData, setTrackData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    async function fetchTrack() {
      try {
        const res = await apiFetch(`/api/market/tracks/${id}`);
        if (res && res.ok) {
          const json = await res.json();
          if (json.success) {
            setTrackData(json.data);
          } else {
            setError(json.message || 'Track not found');
          }
        } else {
          setError('Failed to fetch track details');
        }
      } catch (err) {
        console.error('Fetch track error:', err);
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    fetchTrack();
  }, [id]);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !trackData) {
    return (
      <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-black mb-4">Oops! {error || 'Track not found'}</h1>
        <Button onClick={() => router.push('/marketplace')}>Back to Marketplace</Button>
      </div>
    );
  }

  const { track, creator, more_from_creator } = trackData;

  // Map backend fields to the UI needs
  const displayTrack = {
    ...track,
    creator: creator.name || 'Unknown',
    handle: creator.username ? `@${creator.username}` : '@unknown',
    image: track.cover_url || 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: track.description || 'No description provided.',
    price: track.price || '0.00',
    priceUsd: (parseFloat(track.price || '0') * 2400).toFixed(2), // Mock conversion
    bpm: track.bpm || 'N/A',
    key: track.key || 'N/A',
    duration: track.duration || 'N/A',
    fileType: track.file_type || 'WAV',
    nftId: track.nft_id || 'Not Minted',
    royalty: track.royalty_percentage ? `${track.royalty_percentage}%` : '0%',
    licenses: track.license_types || ['Standard License']
  };

  return (
    <CartProvider>
      <div className="flex min-h-screen bg-[#050510] text-white font-sans selection:bg-accent-cyan selection:text-black">
        <Sidebar activePage="market" />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="flex items-center justify-between px-10 py-5 bg-[#050510]/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
            <div className="flex items-center gap-6 flex-1">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                  <ChevronLeft size={18} />
                </div>
                <span className="text-sm font-bold">Back</span>
              </button>

              <div className="relative flex-1 max-w-md group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-accent-purple transition-colors">
                  <Search size={16} />
                </div>
                 <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  className="w-full bg-[#0F0F1A] border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-xs font-medium focus:outline-none focus:border-accent-purple/50 transition-all placeholder-zinc-600"
                />
              </div>
            </div>

            <HeaderActions />
          </header>

          <main className="flex-1 overflow-y-auto pb-32">
            <div className="relative h-[450px] w-full overflow-hidden">
              <img 
                src={displayTrack.image} 
                alt={displayTrack.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-[#050510]/40 to-transparent" />
              <div className="absolute bottom-10 right-10">
                <button 
                  onClick={() => playTrack({
                    id: displayTrack.id,
                    title: displayTrack.title,
                    artist: displayTrack.creator,
                    image: displayTrack.image,
                    audioUrl: displayTrack.audio_url
                  })}
                  className="w-20 h-20 bg-accent-purple rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(157,0,255,0.6)] hover:scale-105 transition-all"
                >
                  {currentTrack?.id === displayTrack.id && isPlaying ? (
                    <Pause size={32} fill="white" />
                  ) : (
                    <Play size={32} fill="white" className="ml-2" />
                  )}
                </button>
              </div>
              <div className="absolute bottom-10 left-10">
                <h1 className="text-6xl font-black tracking-tighter text-white mb-2">{displayTrack.title}</h1>
              </div>
            </div>

            <div className="px-10 py-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
              <div className="space-y-12">
                <section>
                  <h3 className="text-lg font-black uppercase tracking-widest text-zinc-500 mb-6">Description</h3>
                  <p className="text-zinc-400 leading-relaxed max-w-3xl">
                    {displayTrack.description}
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-black uppercase tracking-widest text-zinc-500 mb-6">Technical Data</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'BPM', value: displayTrack.bpm },
                      { label: 'Key', value: displayTrack.key },
                      { label: 'Duration', value: displayTrack.duration },
                      { label: 'File Type', value: displayTrack.fileType },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider whitespace-nowrap">{item.label}:</span>
                        <div className="bg-[#0F0F1A] border border-white/5 rounded-lg px-6 py-2.5 text-xs font-black text-white min-w-[80px] text-center">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-[#0F0F1A]/50 border border-white/5 rounded-3xl p-8 max-w-2xl">
                  <h3 className="text-lg font-black uppercase tracking-widest text-zinc-500 mb-8">Creator Info</h3>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-zinc-800 overflow-hidden border-2 border-white/5">
                      <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-4xl font-black text-white/20">
                        {displayTrack.creator[0]}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-white mb-1">{displayTrack.creator}</h4>
                      <p className="text-zinc-500 font-bold mb-4">{displayTrack.handle}</p>
                      <Link href={`/creator/${creator.username}`}>
                        <Button variant="secondary" className="px-5 py-2 text-xs rounded-xl">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-black uppercase tracking-widest text-zinc-500 mb-8">More from this Creator</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-5">
                    {more_from_creator && more_from_creator.length > 0 ? (
                      more_from_creator.map((t: any, i: number) => (
                        <TrackCard 
                          key={t.id || i}
                          id={t.id}
                          title={t.title}
                          creator={displayTrack.creator}
                          image={t.cover_url || displayTrack.image}
                          audioUrl={t.audio_url}
                          licenseTypes={t.license_types || ['License']}
                          price={t.price || '0.00'}
                          currency={t.currency || '$0'}
                        />
                      ))
                    ) : (
                      <p className="text-zinc-500 italic">No other tracks found from this creator.</p>
                    )}
                  </div>
                </section>
              </div>

              <aside className="space-y-6">
                <PurchaseSidebar track={displayTrack} />
              </aside>
            </div>

            <footer className="px-10 py-10 border-t border-white/5 opacity-40 hover:opacity-100 transition-opacity flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
              <div className="flex gap-8">
                <a href="#" className="hover:text-white transition-colors">About Groovely</a>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
              </div>
              <div className="flex gap-4">
                <Share2 size={16} />
                <ExternalLink size={16} />
                <Copy size={16} />
              </div>
            </footer>
          </main>
        </div>

        <MusicPlayer />
      </div>

      <style jsx>{`
        .divider-text {
          position: relative;
        }
        .divider-text::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(255, 255, 255, 0.05);
          z-index: 0;
        }
        .divider-text span {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </CartProvider>
  );
}

const HeaderActions = () => {
  const { openCart } = useCart();
  return (
    <div className="flex items-center gap-5 ml-8">
      <button className="text-zinc-500 hover:text-white transition-colors">
        <Bell size={20} />
      </button>
      <button
        onClick={openCart}
        className="text-zinc-500 hover:text-white transition-colors"
      >
        <ShoppingCart size={20} />
      </button>
      <div className="flex items-center gap-3 bg-[#0F0F1A] border border-white/5 rounded-xl px-4 py-2 hover:bg-white/5 cursor-pointer transition-all">
        <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/10">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="Wallet" className="w-full h-full object-contain" />
        </div>
        <span className="text-[11px] font-black tracking-tight text-white/90">0xc...y69</span>
        <ChevronDown size={12} className="text-zinc-500" />
      </div>
    </div>
  );
};

const PurchaseSidebar = ({ track }: { track: any }) => {
  const { openCart } = useCart();
  return (
    <div className="bg-[#0F0F1A] border border-white/5 rounded-3xl p-8 sticky top-32">
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="w-5 h-5 rounded-full bg-accent-purple/30 border border-accent-purple/50 flex items-center justify-center">
          <span className="text-[10px] text-accent-purple font-black">Ξ</span>
        </div>
        <span className="text-sm font-bold text-zinc-400">ETH</span>
      </div>
      
      <div className="text-center mb-8">
        <div className="text-4xl font-black tracking-tight text-white mb-1">{track.price}</div>
        <div className="text-zinc-500 font-bold text-sm">(${track.priceUsd})</div>
      </div>

      <Button 
        fullWidth 
        onClick={openCart}
        className="mb-8 flex items-center justify-center gap-2"
      >
        <ShoppingCart size={18} />
        Add to Cart
      </Button>

      <div className="space-y-6">
        <div>
          <div className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 divider-text">
            <span className="bg-[#0F0F1A] px-4 -mt-px">Licenses</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(track.licenses || []).map((lic: string, i: number) => (
              <div key={i} className="bg-[#050510] border border-white/5 rounded-xl py-3 px-4 text-center text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer">
                {lic}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 divider-text">
            <span className="bg-[#0F0F1A] px-4 -mt-px">Royalty (%)</span>
          </div>
          <div className="bg-[#050510] border border-white/5 rounded-xl py-4 px-6 text-2xl font-black text-accent-purple text-center">
            {track.royalty}
          </div>
        </div>
      </div>
    </div>
  );
};
