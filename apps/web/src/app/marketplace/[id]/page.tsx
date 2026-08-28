'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MarketTopBar } from '@/components/marketplace/MarketTopBar';
import { TrackCard } from '@/components/marketplace/TrackCard';
import { MusicPlayer } from '@/components/marketplace/MusicPlayer';
import { useMusicPlayer } from '@/components/marketplace/MusicPlayerContext';
import { MintModal, EditionInfo } from '@/components/marketplace/MintModal';
import { ShareModal } from '@/components/marketplace/ShareModal';
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
  Info,
  Check,
  Download
} from 'lucide-react';
import { CartProvider, useCart } from '@/components/marketplace/CartContext';
import { use } from 'react';
import { apiFetch, resolveIpfsUrl } from '@/lib/api';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { playTrack, currentTrack, isPlaying, addPurchasedTrack } = useMusicPlayer();
  
  const [trackData, setTrackData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isPurchased, setIsPurchased] = React.useState(false);
  const [mintModalOpen, setMintModalOpen] = React.useState(false);
  const [shareModalOpen, setShareModalOpen] = React.useState(false);
  const [audioDuration, setAudioDuration] = React.useState<string>('Loading...');
  const [currentUserId, setCurrentUserId] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('grooveli_user_id');
      if (stored) setCurrentUserId(Number(stored));
    }
  }, []);

  const isUploader = currentUserId !== null && (trackData?.track?.user_id === currentUserId || trackData?.creator?.id === currentUserId);

  React.useEffect(() => {
    const rawAudioUrl = trackData?.track?.audio_url;
    const audioUrl = resolveIpfsUrl(rawAudioUrl);
    if (audioUrl) {
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audio.preload = "metadata";
      audio.src = audioUrl.includes('?') ? `${audioUrl}&t=${Date.now()}` : `${audioUrl}?t=${Date.now()}`;
      
      const onLoadedMetadata = () => {
        const d = audio.duration;
        if (d && !isNaN(d)) {
          const minutes = Math.floor(d / 60);
          const seconds = Math.floor(d % 60);
          setAudioDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setAudioDuration('N/A');
        }
      };

      const onError = () => {
        setAudioDuration('N/A');
      };

      audio.addEventListener('loadedmetadata', onLoadedMetadata);
      audio.addEventListener('error', onError);
      audio.load();

      return () => {
        audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        audio.removeEventListener('error', onError);
      };
    } else {
      setAudioDuration('N/A');
    }
  }, [trackData]);

  // Fetch purchase status to lift 40s limit if already owned
  React.useEffect(() => {
    if (isUploader) {
      setIsPurchased(true);
      addPurchasedTrack(id);
      return;
    }

    const storedWallet = typeof window !== 'undefined'
      ? (localStorage.getItem('groovely_wallet') || localStorage.getItem('grooveli_wallet') || '')
      : '';
    const queryStr = storedWallet ? `?wallet=${encodeURIComponent(storedWallet)}` : '';

    apiFetch(`/api/tracks/${id}/purchased${queryStr}`, { skipAuthRedirect: true })
      .then(async (res) => {
        if (res && res.ok) {
          const data = await res.json();
          if (data?.data?.purchased) {
            setIsPurchased(true);
            addPurchasedTrack(id);
          }
        }
      })
      .catch(() => {});
  }, [id, isUploader]); // eslint-disable-line

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

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMintAction = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'mint') {
        setMintModalOpen(true);
        window.history.replaceState({}, '', `/marketplace/${id}`);
      }
    };
    checkMintAction();

    const handleOpenMint = () => setMintModalOpen(true);
    window.addEventListener('open_mint_modal', handleOpenMint);
    return () => {
      window.removeEventListener('open_mint_modal', handleOpenMint);
    };
  }, [id]);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const track = trackData?.track;
  const creator = trackData?.creator;
  const more_from_creator = trackData?.more_from_creator;

  // Build editions list from database or fallback (hook is always called at top level)
  const editionsList: EditionInfo[] = React.useMemo(() => {
    if (!trackData) return [];
    if (trackData.editions && trackData.editions.length > 0) {
      return trackData.editions.map((e: any) => ({
        id: e.id,
        contractEditionId: Number(e.contract_edition_id) || 1, // Fallback to 1 if not yet synced/indexed
        editionType: e.edition_type,
        mintPriceUsdc: parseFloat(e.mint_price_usdc) || parseFloat(track?.license_price || '0') || 5,
        maxSupply: e.max_supply !== null && e.max_supply !== undefined ? Number(e.max_supply) : null,
        mintedSupply: Number(e.minted_supply) || 0,
        active: e.active !== false,
      }));
    }

    const fallbackPrice = parseFloat(track?.license_price || track?.price || '5');
    return [
      {
        id: track?.id || 0,
        contractEditionId: 1,
        editionType: 'fan',
        mintPriceUsdc: isNaN(fallbackPrice) || fallbackPrice <= 0 ? 5 : fallbackPrice,
        maxSupply: 1000,
        mintedSupply: 0,
        active: true,
      }
    ];
  }, [trackData, track]);

  // Map backend fields to the UI needs (hook is always called at top level)
  const displayTrack = React.useMemo(() => {
    if (!track || !creator) return null;
    const startingPriceVal = editionsList.length > 0
      ? Math.min(...editionsList.map(e => e.mintPriceUsdc))
      : (parseFloat(track.license_price || track.price || '5.00'));
    const finalPrice = isNaN(startingPriceVal) || startingPriceVal <= 0 ? '5.00' : startingPriceVal.toFixed(2);

    return {
      ...track,
      creator: creator.name || 'Unknown',
      handle: creator.username ? `@${creator.username}` : '@unknown',
      image: resolveIpfsUrl(track.cover_url) || 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      audio_url: resolveIpfsUrl(track.audio_url),
      description: track.description || 'No description provided.',
      price: finalPrice,
      priceUsd: (parseFloat(finalPrice) * 2400).toFixed(2), // Mock conversion
      bpm: track.bpm || 'N/A',
      key: track.key || 'N/A',
      duration: audioDuration,
      fileType: track.file_type || 'WAV',
      nftId: track.nft_id || 'Not Minted',
      royalty: track.royalty_percentage ? `${track.royalty_percentage}%` : '10%',
      licenses: track.license_types || ['Standard License']
    };
  }, [track, creator, audioDuration, editionsList]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !trackData || !displayTrack) {
    return (
      <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-black mb-4">Oops! {error || 'Track not found'}</h1>
        <Button onClick={() => router.push('/marketplace')}>Back to Marketplace</Button>
      </div>
    );
  }

  return (
    <CartProvider>
      <div className="flex min-h-screen bg-[#050510] text-white font-sans selection:bg-accent-cyan selection:text-black">
        <Sidebar activePage="market" />

        <div className="flex-1 flex flex-col min-w-0">
          <MarketTopBar />

          <main className="flex-1 overflow-y-auto flex flex-col justify-between min-h-[calc(100vh-140px)]">
            <div>
              {/* Spotify / Apple Music Style Crisp Hero Banner */}
              <div className="relative min-h-[380px] sm:min-h-[420px] w-full overflow-hidden flex items-end p-6 sm:p-10 border-b border-white/5">
              {/* Ambient Blur Backdrop */}
              <img 
                src={displayTrack.image} 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-30 scale-110 pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-[#050510]/70 to-black/40" />

              {/* Foreground Content: Crisp 1:1 HD Cover Art Card */}
              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8 w-full max-w-7xl mx-auto">
                <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-3xl overflow-hidden border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] shrink-0 bg-[#0F0F1A]">
                  <img 
                    src={displayTrack.image} 
                    alt={displayTrack.title} 
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 text-center sm:text-left min-w-0">
                  <span className="inline-block px-3.5 py-1 bg-accent-purple/20 border border-accent-purple/40 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-accent-cyan mb-3">
                    {displayTrack.fileType || 'WAV'} Track
                  </span>
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white mb-3 truncate leading-none">
                    {displayTrack.title}
                  </h1>
                  <p className="text-sm sm:text-base font-bold text-zinc-400">
                    by <Link href={`/creator/${creator.username}`} className="text-white hover:text-accent-cyan transition-colors underline font-black">{displayTrack.creator}</Link>
                  </p>
                </div>

                <div className="shrink-0 self-center sm:self-end mt-2 sm:mt-0">
                  <button 
                    onClick={() => playTrack({
                       id: displayTrack.id,
                       title: displayTrack.title,
                       artist: displayTrack.creator,
                       image: displayTrack.image,
                       audioUrl: displayTrack.audio_url,
                       uploaderId: track.user_id || creator.id,
                       price: displayTrack.price,
                       licenseTypes: displayTrack.licenses
                    })}
                    className="w-16 h-16 sm:w-20 sm:h-20 bg-accent-purple hover:bg-accent-purple/90 rounded-full flex items-center justify-center shadow-[0_0_35px_rgba(139,92,246,0.6)] hover:scale-105 transition-all cursor-pointer"
                  >
                    {currentTrack?.id === displayTrack.id && isPlaying ? (
                      <Pause size={28} fill="white" className="text-white" />
                    ) : (
                      <Play size={28} fill="white" className="text-white ml-1" />
                    )}
                  </button>
                </div>
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
                          uploaderId={creator.id}
                        />
                      ))
                    ) : (
                      <p className="text-zinc-500 italic">No other tracks found from this creator.</p>
                    )}
                  </div>
                </section>
              </div>

              <aside className="space-y-6">
                <PurchaseSidebar
                  track={displayTrack}
                  isPurchased={isPurchased}
                  isUploader={isUploader}
                  editionsList={editionsList}
                  onBuy={() => setMintModalOpen(true)}
                />
              </aside>
            </div>
            </div>

            <footer className="mt-auto px-6 sm:px-10 pt-8 pb-28 sm:pb-32 border-t border-white/5 opacity-60 hover:opacity-100 transition-opacity flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
              <div className="flex gap-6 sm:gap-8">
                <a href="#" className="hover:text-white transition-colors">About Grooveli</a>
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

      {/* Mint Modal */}
      <MintModal
        isOpen={mintModalOpen}
        onClose={() => setMintModalOpen(false)}
        trackId={Number(id)}
        trackTitle={displayTrack.title}
        trackImage={displayTrack.image}
        creatorName={displayTrack.creator}
        editions={editionsList}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        track={{
          id: String(id),
          title: displayTrack.title,
          artist: displayTrack.creator,
          image: displayTrack.image,
          audioUrl: displayTrack.audio_url,
          isPurchased,
          isCreator: isUploader,
        }}
        onOpenMintModal={() => setMintModalOpen(true)}
      />

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



const PurchaseSidebar = ({
  track,
  isPurchased,
  isUploader,
  editionsList,
  onBuy,
  onShare,
  onExport,
}: {
  track: any;
  isPurchased?: boolean;
  isUploader?: boolean;
  editionsList: EditionInfo[];
  onBuy?: () => void;
  onShare?: () => void;
  onExport?: () => void;
}) => {
  return (
    <div className="bg-[#0F0F1A] border border-white/5 rounded-3xl p-8 sticky top-32">
      {/* Price display */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="w-5 h-5 rounded-full bg-accent-purple/30 border border-accent-purple/50 flex items-center justify-center">
          <span className="text-[10px] text-accent-purple font-black">$</span>
        </div>
        <span className="text-sm font-bold text-zinc-400">USDC</span>
      </div>

      <div className="text-center mb-8">
        <div className="text-4xl font-black tracking-tight text-white mb-1">
          {track.price || '5.00'}
        </div>
        <div className="text-zinc-500 font-bold text-sm">Starting price per edition</div>
      </div>

      {isUploader ? (
        /* ── Uploader state ── */
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 py-4 bg-accent-cyan/10 border border-accent-cyan/20 rounded-2xl mb-3">
            <span className="text-sm font-black text-accent-cyan">You Uploaded This Track</span>
          </div>
          <p className="text-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            Owner Access Enabled
          </p>
        </div>
      ) : isPurchased ? (
        /* ── Owned state ── */
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 py-4 bg-accent-purple/10 border border-accent-purple/20 rounded-2xl mb-3">
            <Check size={18} className="text-accent-purple" strokeWidth={2.5} />
            <span className="text-sm font-black text-accent-purple">You Own This Track</span>
          </div>
          <p className="text-center text-[11px] text-zinc-600 font-bold uppercase tracking-wider">
            Unlimited listening · Full license active
          </p>
        </div>
      ) : (
        /* ── Buy CTA ── */
        <Button
          fullWidth
          onClick={onBuy}
          className="mb-6 flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(139,92,246,0.4)] cursor-pointer"
        >
          <ShoppingCart size={18} />
          Mint / Purchase
        </Button>
      )}

      {/* Share and Export Action Row */}
      <div className="grid grid-cols-2 gap-2.5 mb-8">
        <button
          onClick={onShare}
          className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:border-white/20"
        >
          <Share2 size={13} className="text-accent-purple" />
          <span>Share</span>
        </button>

        <button
          onClick={onExport}
          className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:border-white/20"
        >
          <Download size={13} className="text-accent-cyan" />
          <span>Export</span>
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <div className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 divider-text">
            <span className="bg-[#0F0F1A] px-4 -mt-px">Editions Available</span>
          </div>
          <div className="space-y-2">
            {editionsList.map((ed) => (
              <div key={ed.editionType} className="flex items-center justify-between bg-[#050510] border border-white/5 rounded-xl py-2.5 px-4 text-xs">
                <span className="font-bold text-zinc-400 capitalize">{ed.editionType} Edition</span>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-600">
                    {ed.editionType === 'open' || ed.maxSupply === null || ed.maxSupply === 0 || ed.maxSupply >= 1000000 ? 'Unlimited' : `${ed.maxSupply - ed.mintedSupply} left`}
                  </span>
                  <span className="font-black text-white">${ed.mintPriceUsdc.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 divider-text">
            <span className="bg-[#0F0F1A] px-4 -mt-px">Royalty (%)</span>
          </div>
          <div className="bg-[#050510] border border-white/5 rounded-xl py-4 px-6 text-2xl font-black text-accent-purple text-center">
            {track.royalty || '10%'}
          </div>
        </div>

        <div>
          <div className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 divider-text">
            <span className="bg-[#0F0F1A] px-4 -mt-px">Licenses</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(track.licenses || ['Standard License']).map((lic: string, i: number) => (
              <div key={i} className="bg-[#050510] border border-white/5 rounded-xl py-3 px-4 text-center text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer">
                {lic}
              </div>
            ))}
          </div>
        </div>
      </div>

      {!isPurchased && (
        <p className="mt-6 text-[10px] text-zinc-700 text-center leading-relaxed">
          Free 40-second preview · Purchase to unlock full track
        </p>
      )}
    </div>
  );
};
