'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MarketTopBar } from '@/components/marketplace/MarketTopBar';
import { TrackCard } from '@/components/marketplace/TrackCard';
import { MusicPlayer } from '@/components/marketplace/MusicPlayer';
import { CartProvider } from '@/components/marketplace/CartContext';
import { useMusicPlayer } from '@/components/marketplace/MusicPlayerContext';
import { MintModal, EditionInfo } from '@/components/marketplace/MintModal';
import { ShareModal } from '@/components/marketplace/ShareModal';
import { 
  Play, 
  Pause, 
  Share2, 
  ExternalLink, 
  Copy, 
  Check, 
  ShoppingCart, 
  Download, 
  Headphones, 
  Disc, 
  Heart,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch, resolveIpfsUrl } from '@/lib/api';
import toast from 'react-hot-toast';

export default function TrackDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [trackData, setTrackData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [audioDuration, setAudioDuration] = useState('0:00');
  const [mintModalOpen, setMintModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { playTrack, currentTrack, isPlaying, isTrackPurchased } = useMusicPlayer();

  // Load duration when audio url is available
  React.useEffect(() => {
    if (!trackData?.track?.audio_url) return;
    const url = resolveIpfsUrl(trackData.track.audio_url);
    if (!url) return;

    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => {
      const minutes = Math.floor(audio.duration / 60);
      const seconds = Math.floor(audio.duration % 60);
      setAudioDuration(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    });
  }, [trackData]);

  // Load saved state from API
  React.useEffect(() => {
    if (!id) return;
    async function checkSaved() {
      try {
        const res = await apiFetch(`/api/fan/saved`);
        if (res && res.ok) {
          const json = await res.json();
          const items = json?.data?.tracks || json?.data || [];
          if (Array.isArray(items)) {
            setIsSaved(items.some((it: any) => String(it.id) === String(id)));
          }
        }
      } catch (_) {}
    }
    checkSaved();
  }, [id]);

  const handleToggleSave = async () => {
    try {
      const method = isSaved ? 'DELETE' : 'POST';
      const res = await apiFetch(`/api/fan/saved/${id}`, { method });
      if (res && res.ok) {
        setIsSaved(!isSaved);
        toast.success(!isSaved ? 'Saved to your favorites!' : 'Removed from favorites');
      }
    } catch (_) {
      toast.error('Failed to update favorites');
    }
  };

  React.useEffect(() => {
    async function fetchTrack() {
      try {
        const { data } = await cachedApiFetch(`/api/market/tracks/${id}`, {
          onBackgroundUpdate: (fresh) => {
            if (fresh?.success && fresh.data) {
              setTrackData(fresh.data);
            }
          }
        });

        if (data && data.success) {
          setTrackData(data.data);
        } else if (!data) {
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
      const p = new URLSearchParams(window.location.search);
      if (p.get('action') === 'mint') {
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

  const track = trackData?.track;
  const creator = trackData?.creator;
  const more_from_creator = trackData?.more_from_creator;

  // Build editions list from database or fallback
  const editionsList: EditionInfo[] = React.useMemo(() => {
    if (!trackData) return [];
    const isExplicitlyFree = track?.payment_model === 'none';

    if (trackData.editions && trackData.editions.length > 0) {
      return trackData.editions.map((e: any) => {
        const rawEdPrice = Number(e.mint_price_usdc);
        const edPrice = isExplicitlyFree 
          ? 0 
          : (!isNaN(rawEdPrice) && rawEdPrice > 0 ? rawEdPrice : (Number(track?.license_price) || Number(track?.price) || 1.0));
        return {
          id: e.id,
          contractEditionId: Number(e.contract_edition_id) || 1,
          editionType: e.edition_type,
          mintPriceUsdc: edPrice,
          maxSupply: e.max_supply !== null && e.max_supply !== undefined ? Number(e.max_supply) : null,
          mintedSupply: Number(e.minted_supply) || 0,
          active: e.active !== false,
        };
      });
    }

    const fallbackPrice = isExplicitlyFree ? 0 : (parseFloat(track?.license_price || track?.price || '1.00') || 1.0);
    return [
      {
        id: track?.id || 0,
        contractEditionId: 1,
        editionType: 'fan',
        mintPriceUsdc: fallbackPrice,
        maxSupply: 1000,
        mintedSupply: 0,
        active: true,
      }
    ];
  }, [trackData, track]);

  // Map backend fields to UI
  const displayTrack = React.useMemo(() => {
    if (!track || !creator) return null;
    const isExplicitlyFree = track.payment_model === 'none';
    const startingPriceVal = isExplicitlyFree ? 0 : (
      editionsList.length > 0
        ? Math.min(...editionsList.map(e => e.mintPriceUsdc))
        : (parseFloat(track.license_price || track.price || '1.00') || 1.0)
    );
    const finalPrice = isExplicitlyFree || startingPriceVal === 0 ? '0.00' : startingPriceVal.toFixed(2);

    return {
      ...track,
      creator: creator.name || 'Unknown',
      handle: creator.username ? `@${creator.username}` : '@unknown',
      image: resolveIpfsUrl(track.cover_url) || 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      audio_url: resolveIpfsUrl(track.audio_url),
      description: track.description || 'No description provided.',
      price: finalPrice,
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

  const isPurchased = isTrackPurchased(id);
  const currentUserId = typeof window !== 'undefined'
    ? (Number(localStorage.getItem('grooveli_user_id')) || Number(localStorage.getItem('groovely_user_id')) || null)
    : null;
  const isUploader = currentUserId !== null && Number(track.user_id || creator.id) === currentUserId;
  const isFree = track.payment_model === 'none' || (editionsList.length > 0 && editionsList.every(e => e.mintPriceUsdc === 0));

  return (
    <CartProvider>
      <div className="flex min-h-screen bg-[#050510] text-white font-sans selection:bg-accent-cyan selection:text-black">
        <Sidebar activePage="market" />

        <div className="flex-1 flex flex-col min-w-0">
          <MarketTopBar />

          <main className="flex-1 overflow-y-auto flex flex-col justify-between min-h-[calc(100vh-140px)]">
            <div>
              {/* ── Mobile View: Full-Bleed Edge-to-Edge Cinematic Banner (< md) ── */}
              <div className="md:hidden relative w-full h-[340px] sm:h-[400px] overflow-hidden bg-[#070a14]">
                {/* Full-width Cover Image */}
                <img 
                  src={displayTrack.image} 
                  alt={displayTrack.title} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Bottom & Top Gradient Overlays for Cinematic Contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-[#050510]/75 to-black/20" />

                {/* Bottom-Aligned Track Metadata & Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 flex flex-col items-start z-10">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-accent-purple/30 border border-accent-purple/50 rounded-full text-[9px] font-black uppercase tracking-wider text-accent-cyan backdrop-blur-md">
                      {displayTrack.fileType || 'WAV'} Track
                    </span>
                    {isFree && (
                      <span className="px-2.5 py-0.5 bg-emerald-500/30 border border-emerald-500/50 rounded-full text-[9px] font-black uppercase tracking-wider text-emerald-400 backdrop-blur-md">
                        Free Track
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1.5 leading-tight line-clamp-2 drop-shadow-md">
                    {displayTrack.title}
                  </h1>

                  <p className="text-xs font-medium text-zinc-300 mb-4 drop-shadow">
                    by <Link href={`/creator/${creator.username}`} className="text-white hover:text-accent-cyan transition-colors font-bold underline">{displayTrack.creator}</Link>
                  </p>

                  {/* Mobile Actions Row */}
                  <div className="flex items-center gap-3 w-full">
                    <button 
                      onClick={() => playTrack({
                         id: displayTrack.id,
                         title: displayTrack.title,
                         artist: displayTrack.creator,
                         image: displayTrack.image,
                         audioUrl: displayTrack.audio_url,
                         uploaderId: track.user_id || creator.id,
                         price: displayTrack.price,
                         payment_model: track.payment_model,
                         licenseTypes: displayTrack.licenses
                      })}
                      className="flex-1 py-3 px-5 bg-accent-purple hover:bg-accent-purple/90 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(139,92,246,0.5)] active:scale-98 transition-all cursor-pointer text-white font-black text-xs uppercase tracking-wider"
                    >
                      {currentTrack?.id === displayTrack.id && isPlaying ? (
                        <>
                          <Pause size={16} fill="white" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play size={16} fill="white" className="ml-0.5" />
                          <span>Play Track</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleToggleSave}
                      className={`w-11 h-11 rounded-2xl border backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        isSaved 
                          ? 'bg-red-500/25 border-red-500/50 text-red-400' 
                          : 'bg-black/50 border-white/20 text-white hover:bg-black/70'
                      }`}
                      title={isSaved ? "Saved" : "Save to favorites"}
                    >
                      <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
                    </button>

                    <button
                      onClick={() => setShareModalOpen(true)}
                      className="w-11 h-11 rounded-2xl bg-black/50 border border-white/20 backdrop-blur-md text-white hover:bg-black/70 flex items-center justify-center transition-all cursor-pointer shrink-0"
                      title="Share track"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Desktop View: 1:1 HD Square Card with Ambient Blur (md+) ── */}
              <div className="hidden md:flex relative w-full overflow-hidden p-8 md:p-10 border-b border-white/5 bg-[#070a14]">
                {/* Ambient Blur Backdrop */}
                <img 
                  src={displayTrack.image} 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-25 scale-110 pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070a14] via-[#070a14]/80 to-transparent" />

                <div className="relative z-10 w-full max-w-7xl mx-auto flex items-end gap-8">
                  {/* Album Cover Art */}
                  <div className="w-56 h-56 lg:w-64 lg:h-64 rounded-3xl overflow-hidden border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] shrink-0 bg-[#0F0F1A] relative group">
                    <img 
                      src={displayTrack.image} 
                      alt={displayTrack.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                  </div>

                  {/* Title & Metadata */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-0.5 bg-accent-purple/20 border border-accent-purple/40 rounded-full text-[10px] font-black uppercase tracking-wider text-accent-cyan">
                        {displayTrack.fileType || 'WAV'} Track
                      </span>
                      {isFree && (
                        <span className="px-3 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-[10px] font-black uppercase tracking-wider text-emerald-400">
                          Free Track
                        </span>
                      )}
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-white mb-2 truncate leading-tight">
                      {displayTrack.title}
                    </h1>

                    <p className="text-base font-medium text-zinc-400 mb-6">
                      by <Link href={`/creator/${creator.username}`} className="text-white hover:text-accent-cyan transition-colors font-bold underline">{displayTrack.creator}</Link>
                    </p>

                    {/* Action Buttons Row */}
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => playTrack({
                           id: displayTrack.id,
                           title: displayTrack.title,
                           artist: displayTrack.creator,
                           image: displayTrack.image,
                           audioUrl: displayTrack.audio_url,
                           uploaderId: track.user_id || creator.id,
                           price: displayTrack.price,
                           payment_model: track.payment_model,
                           licenseTypes: displayTrack.licenses
                        })}
                        className="px-7 py-3.5 bg-accent-purple hover:bg-accent-purple/90 rounded-full flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer text-white font-black text-sm uppercase tracking-wider"
                      >
                        {currentTrack?.id === displayTrack.id && isPlaying ? (
                          <>
                            <Pause size={18} fill="white" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play size={18} fill="white" className="ml-0.5" />
                            <span>Play Audio</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleToggleSave}
                        className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                          isSaved 
                            ? 'bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                        }`}
                        title={isSaved ? "Saved" : "Save to favorites"}
                      >
                        <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
                      </button>

                      <button
                        onClick={() => setShareModalOpen(true)}
                        className="w-11 h-11 rounded-full bg-white/5 border border-white/10 hover:border-white/20 text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
                        title="Share track"
                      >
                        <Share2 size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="px-4 sm:px-8 md:px-10 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 sm:gap-10">
                <div className="space-y-10">
                  <section>
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-zinc-500 mb-4">Description</h3>
                    <p className="text-zinc-400 leading-relaxed text-sm max-w-3xl">
                      {displayTrack.description}
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-zinc-500 mb-4">Technical Data</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'BPM', value: displayTrack.bpm },
                        { label: 'Key', value: displayTrack.key },
                        { label: 'Duration', value: displayTrack.duration },
                        { label: 'Format', value: displayTrack.fileType },
                      ].map((item, i) => (
                        <div key={i} className="flex flex-col gap-1 bg-[#0F0F1A] border border-white/5 rounded-xl p-3 text-center">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{item.label}</span>
                          <span className="text-xs sm:text-sm font-black text-white">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="bg-[#0F0F1A]/60 border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-7 max-w-2xl">
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-zinc-500 mb-6">Creator Info</h3>
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-800 overflow-hidden border-2 border-white/10 shrink-0">
                        <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-2xl sm:text-3xl font-black text-white/40">
                          {displayTrack.creator[0]}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-lg sm:text-xl font-black text-white mb-0.5 truncate">{displayTrack.creator}</h4>
                        <p className="text-xs text-zinc-500 font-bold mb-3">{displayTrack.handle}</p>
                        <Link href={`/creator/${creator.username}`}>
                          <Button variant="secondary" className="px-4 py-1.5 text-xs rounded-xl">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-zinc-500 mb-6">More from this Creator</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <p className="text-zinc-500 italic text-xs">No other tracks found from this creator.</p>
                      )}
                    </div>
                  </section>
                </div>

                <aside className="space-y-6">
                  <PurchaseSidebar
                    track={displayTrack}
                    isPurchased={isPurchased}
                    isUploader={isUploader}
                    isFree={isFree}
                    editionsList={editionsList}
                    onBuy={() => setMintModalOpen(true)}
                    onShare={() => setShareModalOpen(true)}
                    onExport={() => {
                      if (isPurchased || isUploader || isFree) {
                        const url = displayTrack.audio_url;
                        if (url) {
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${displayTrack.title}.mp3`;
                          a.target = '_blank';
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          toast.success('Downloading lossless master audio...');
                        }
                      } else {
                        setMintModalOpen(true);
                      }
                    }}
                  />
                </aside>
              </div>
            </div>

            <footer className="mt-auto px-4 sm:px-10 pt-8 pb-28 sm:pb-32 border-t border-white/5 opacity-60 hover:opacity-100 transition-opacity flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
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
    </CartProvider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Purchase Sidebar Component
// ─────────────────────────────────────────────────────────────────────────────

interface PurchaseSidebarProps {
  track: any;
  isPurchased: boolean;
  isUploader: boolean;
  isFree: boolean;
  editionsList: EditionInfo[];
  onBuy: () => void;
  onShare: () => void;
  onExport: () => void;
}

const PurchaseSidebar: React.FC<PurchaseSidebarProps> = ({
  track,
  isPurchased,
  isUploader,
  isFree,
  editionsList,
  onBuy,
  onShare,
  onExport,
}) => {
  return (
    <div className="bg-[#0b0e17] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl sticky top-24">
      {/* Price Header */}
      <div className="mb-6 pb-5 border-b border-white/5">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block mb-1">
          {isFree ? 'License Tier' : 'Starting Price'}
        </span>
        <div className="flex items-baseline gap-2">
          {isFree ? (
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">Free Full Access</span>
          ) : (
            <span className="text-3xl font-black text-white font-mono">${track.price} USDC</span>
          )}
        </div>
      </div>

      {isUploader ? (
        /* ── Uploader state ── */
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 py-3.5 bg-accent-cyan/10 border border-accent-cyan/20 rounded-2xl mb-2">
            <span className="text-xs sm:text-sm font-black text-accent-cyan">You Uploaded This Track</span>
          </div>
          <p className="text-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            Owner Access Enabled
          </p>
        </div>
      ) : isPurchased ? (
        /* ── Owned state ── */
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 py-3.5 bg-accent-purple/10 border border-accent-purple/20 rounded-2xl mb-2">
            <Check size={18} className="text-accent-purple" strokeWidth={2.5} />
            <span className="text-xs sm:text-sm font-black text-accent-purple">You Own This Track</span>
          </div>
          <p className="text-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            Unlimited listening · Full license active
          </p>
        </div>
      ) : isFree ? (
        /* ── Free Track State ── */
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 py-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-2">
            <span className="text-xs sm:text-sm font-black text-emerald-400">Free Full Stream</span>
          </div>
          <p className="text-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            No license fee required · Stream in Full
          </p>
        </div>
      ) : (
        /* ── Buy CTA ── */
        <Button
          fullWidth
          onClick={onBuy}
          className="mb-6 py-3.5 flex items-center justify-center gap-2 text-xs font-black shadow-[0_8px_30px_rgba(139,92,246,0.4)] cursor-pointer"
        >
          <ShoppingCart size={16} />
          Mint / Purchase
        </Button>
      )}

      {/* Share and Export Action Row */}
      <div className="grid grid-cols-2 gap-2.5 mb-6">
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

      <div className="space-y-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block mb-2.5">
            Editions Available
          </span>
          <div className="space-y-2">
            {editionsList.map((ed) => (
              <div key={ed.editionType} className="flex items-center justify-between bg-[#050510] border border-white/5 rounded-xl py-2 px-3 text-xs">
                <span className="font-bold text-zinc-400 capitalize text-[11px]">{ed.editionType} Edition</span>
                <div className="flex items-center gap-2.5">
                  <span className="text-zinc-500 text-[10px]">
                    {ed.editionType === 'open' || ed.maxSupply === null || ed.maxSupply === 0 || ed.maxSupply >= 1000000 ? 'Unlimited' : `${ed.maxSupply - ed.mintedSupply} left`}
                  </span>
                  <span className="font-black text-white text-xs">
                    {ed.mintPriceUsdc === 0 ? 'Free' : `$${ed.mintPriceUsdc.toFixed(2)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block mb-2">
            Royalty Split
          </span>
          <div className="bg-[#050510] border border-white/5 rounded-xl py-2.5 px-4 text-lg font-black text-accent-purple text-center">
            {track.royalty || '10%'}
          </div>
        </div>
      </div>
    </div>
  );
};
