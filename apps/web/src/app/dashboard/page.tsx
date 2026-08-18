'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import {
  Radio,
  Wallet,
  UploadCloud,
  Info,
  TrendingUp,
  TrendingDown,
  Upload,
  Search,
  Bell,
  Menu,
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Loader2
} from 'lucide-react';
import { Twitter, Instagram } from '@/components/ui/SocialIcons';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

interface DashboardStats {
  streams: {
    total: string;
    change: string | null;
    changeType: 'up' | 'down' | null;
  };
  earnings: {
    total: string;
    change: string | null;
    changeType: 'up' | 'down' | null;
  };
  uploads: {
    total: string;
    change: string | null;
    changeType: 'up' | 'down' | null;
  };
}

interface TrackRow {
  id?: string;
  image?: string;
  cover_url?: string;
  coverImage?: string;
  name?: string;
  title?: string;
  artist?: string;
  artist_name?: string;
  content?: string;
  category?: string;
  streams?: string | number;
  earnings?: string | number;
  status?: string;
}

const ipfsToHttp = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('ipfs://')) {
    const cid = url.slice(7);
    if (cid.length < 40) return '';
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  }
  return url;
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tracks, setTracks] = useState<TrackRow[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);
  const [displayName, setDisplayName] = useState<string>('Uzor');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState({
    title: 'Raining in Summer',
    artist: 'John Scandaler',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80'
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWalletAddress(localStorage.getItem('groovely_wallet'));
    }

    let role = localStorage.getItem('groovely_role');
    if (!role) {
      const token = localStorage.getItem('groovely_token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userRole = payload.role ?? '';
          localStorage.setItem('groovely_role', userRole);
          role = userRole;
        } catch {}
      }
    }
    
    if (role === 'fan') {
      router.push('/explore');
      return;
    }

    async function fetchStats() {
      try {
        const res = await apiFetch('/api/creator/dashboard/stats');
        if (res && res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setStats(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setIsLoadingStats(false);
      }
    }

    async function fetchProfile() {
      try {
        const res = await apiFetch('/api/creator/profile');
        if (res && res.ok) {
          const data = await res.json();
          const profile = data.data ?? data;
          if (profile.display_name) {
            setDisplayName(profile.display_name);
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    }

    async function fetchTracks() {
      try {
        const res = await apiFetch('/api/creator/dashboard/tracks');
        if (res && res.ok) {
          const json = await res.json();
          let parsedTracks: TrackRow[] = [];
          if (Array.isArray(json)) parsedTracks = json;
          else if (json && json.success && json.data) {
            if (Array.isArray(json.data)) parsedTracks = json.data;
            else if (json.data.tracks && Array.isArray(json.data.tracks)) parsedTracks = json.data.tracks;
          } else if (json && json.tracks && Array.isArray(json.tracks)) {
            parsedTracks = json.tracks;
          }
          setTracks(parsedTracks);
        }
      } catch (error) {
        console.error('Failed to fetch tracks', error);
      } finally {
        setIsLoadingTracks(false);
      }
    }

    fetchStats();
    fetchProfile();
    fetchTracks();
  }, [router]);

  const walletAbbrev = walletAddress
    ? `${walletAddress.slice(0, 3)}...${walletAddress.slice(-4)}`
    : '0xc...y69';

  const defaultMockTracks: TrackRow[] = [
    { title: 'Slow Lights on Third Street', coverImage: 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?auto=format&fit=crop&w=120&q=80' },
    { title: 'Midnight Bounce', coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=120&q=80' },
    { title: 'Late Nights, Loose Thoughts — Ep. 01', coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=120&q=80' },
    { title: 'After the Noise', coverImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=120&q=80' },
    { title: 'No Wahala, Just Vibes', coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=120&q=80' },
  ];

  const displayTracksList = tracks.length > 0 ? tracks : defaultMockTracks;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0D18] text-white font-sans selection:bg-[#00FFC6] selection:text-black">
      
      {/* Sidebar for Desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Nav Overlay Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <div className="relative w-72 bg-[#0D1222] h-full shadow-2xl z-50 flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-white/5">
              <span className="font-bold text-white uppercase text-sm tracking-wider">Navigation</span>
              <button onClick={() => setMobileNavOpen(false)} className="p-2 text-zinc-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 custom-scrollbar">
        
        {/* Top Header Mobile / Desktop */}
        <header className="sticky top-0 z-30 px-4 sm:px-8 py-4 bg-[#0A0D18]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/5 text-zinc-300 hover:text-white border border-white/10"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Hello, {displayName}! 👋
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="relative w-10 h-10 rounded-xl bg-[#131A2E] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-accent-purple shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
            </button>

            {/* Wallet Address Badge */}
            <div className="flex items-center gap-2 bg-[#131A2E] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white shadow-sm">
              <div className="w-5 h-5 rounded-md overflow-hidden bg-white/10 p-0.5 shrink-0">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-full h-full object-contain" />
              </div>
              <span className="font-mono text-zinc-200">{walletAbbrev}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="px-4 sm:px-8 py-6 max-w-5xl mx-auto w-full flex-1">
          
          {/* Search Input Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  router.push(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="w-full bg-[#12182B] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-[#8B5CF6]/50 transition-all shadow-inner"
            />
          </div>

          {/* Metrics Section */}
          <div className="space-y-4 mb-8">
            
            {/* Full-Width Top Stat Card: Streams */}
            <div className="bg-[#12182B] border border-white/5 rounded-3xl p-5 relative overflow-hidden group shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-[#1C253F] flex items-center justify-center text-zinc-300">
                  <Radio size={20} className="text-[#8B5CF6]" />
                </div>
                <button className="text-zinc-600 hover:text-white transition-colors">
                  <Info size={16} />
                </button>
              </div>

              <div>
                <p className="text-xs font-bold text-zinc-400 mb-1">Streams</p>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-3xl font-black text-white tracking-tight">
                    {stats?.streams?.total || "1.2K"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-zinc-400">This Month</span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#00FF85]/10 text-[#00FF85] border border-[#00FF85]/20 flex items-center gap-1">
                      <TrendingUp size={11} /> +15%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2-Column Side-by-Side Cards: Earnings & Uploads */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Earnings Card */}
              <div className="bg-[#12182B] border border-white/5 rounded-3xl p-5 relative overflow-hidden group shadow-lg flex flex-col justify-between">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#1C253F] flex items-center justify-center text-zinc-300">
                    <Wallet size={20} className="text-[#00FFC6]" />
                  </div>
                  <button className="text-zinc-600 hover:text-white transition-colors">
                    <Info size={16} />
                  </button>
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-400 mb-1">Earnings</p>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                    {stats?.earnings?.total ? `$${parseFloat(stats.earnings.total).toFixed(2)}` : "$1,032.60"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-zinc-400">This Month</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00FF85]/10 text-[#00FF85] border border-[#00FF85]/20">
                      +10.5%
                    </span>
                  </div>
                </div>
              </div>

              {/* Uploads Card */}
              <div className="bg-[#12182B] border border-white/5 rounded-3xl p-5 relative overflow-hidden group shadow-lg flex flex-col justify-between">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#1C253F] flex items-center justify-center text-zinc-300">
                    <UploadCloud size={20} className="text-indigo-400" />
                  </div>
                  <button className="text-zinc-600 hover:text-white transition-colors">
                    <Info size={16} />
                  </button>
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-400 mb-1">Uploads</p>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                    {stats?.uploads?.total || "10"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-zinc-400">This Month</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                      -0.5%
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Tracks Summary Section */}
          <div className="bg-[#12182B] border border-white/5 rounded-3xl p-5 sm:p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                Tracks Summary
              </h2>
              <div className="flex items-center gap-3">
                <Link href="/library" className="text-xs font-bold text-[#8B5CF6] hover:underline uppercase tracking-wider">
                  View All
                </Link>
                <Link href="/dashboard/upload" className="w-9 h-9 rounded-xl bg-[#8B5CF6] hover:bg-[#7c4dff] flex items-center justify-center text-white shadow-md transition-all active:scale-95">
                  <Upload size={16} />
                </Link>
              </div>
            </div>

            {isLoadingTracks ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 text-[#8B5CF6] animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {displayTracksList.map((track, i) => {
                  const imgUrl = ipfsToHttp(track.image || track.cover_url || track.coverImage) || track.coverImage || "https://images.unsplash.com/photo-1514525253361-bee8d48800d5?auto=format&fit=crop&w=120&q=80";
                  const title = track.name || track.title || "Untitled Track";
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        setCurrentTrack({ title, artist: track.artist || 'Groovely Artist', image: imgUrl });
                        setIsPlaying(true);
                      }}
                      className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={imgUrl}
                          alt={title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10 group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#00FFC6] transition-colors">
                            {title}
                          </p>
                          <p className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">
                            {track.content || track.category || "Audio"}
                          </p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-[#8B5CF6] flex items-center justify-center text-zinc-400 group-hover:text-white transition-all shrink-0">
                        <Play size={12} className="translate-x-0.5 fill-current" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Educational / Promotional Banner Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {/* Card 1: Tips to Grow Your Audience */}
            <div className="relative h-44 rounded-3xl overflow-hidden group cursor-pointer border border-white/5 shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1551288049-bbbda50d879e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Tips to Grow Your Audience"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-6">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase leading-tight">
                  Tips to Grow Your Audience
                </h3>
              </div>
            </div>

            {/* Card 2: How "Web3" Works */}
            <div className="relative h-44 rounded-3xl overflow-hidden group cursor-pointer border border-white/5 shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="How Web3 Works"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white text-xs font-serif italic border border-white/20">ꞩ</div>
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white text-xs font-bold border border-white/20">Ð</div>
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white text-xs font-serif italic border border-white/20">₿</div>
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white text-xs font-bold border border-white/20">Ξ</div>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase leading-tight">
                  How “Web3” Works
                </h3>
              </div>
            </div>
          </div>

          {/* Footer & Links */}
          <footer className="py-8 border-t border-white/5 flex flex-col items-center gap-6 text-center">
            <div className="flex flex-wrap justify-center gap-4 text-[10px] font-medium text-zinc-500">
              <a href="#" className="hover:text-white transition-colors">About Groovely</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-[10px] font-medium text-zinc-500">
              <a href="#" className="hover:text-white transition-colors">Docs/Developer API</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">Feedback</a>
            </div>

            <div className="flex items-center justify-center gap-6 text-zinc-500 pt-2">
              <a href="#" className="hover:text-white transition-colors"><Twitter size={18} /></a>
              <a href="#" className="hover:text-white transition-colors"><span className="text-base font-bold">👾</span></a>
              <a href="#" className="hover:text-white transition-colors"><span className="text-base font-bold">✈️</span></a>
              <a href="#" className="hover:text-white transition-colors"><Instagram size={18} /></a>
            </div>
          </footer>

        </main>
      </div>

      {/* Sticky Bottom Audio Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#070A14]/95 backdrop-blur-xl border-t border-[#8B5CF6]/30 px-4 sm:px-8 py-3 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        {/* Top Purple Audio Progress Line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10">
          <div className="h-full w-[45%] bg-[#8B5CF6] shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
        </div>

        {/* Track Artwork & Info */}
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={currentTrack.image}
            alt={currentTrack.title}
            className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-white truncate">
              {currentTrack.title}
            </p>
            <p className="text-[10px] text-zinc-400 truncate">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-4 shrink-0">
          <button className="text-zinc-400 hover:text-white transition-colors">
            <SkipBack size={18} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 rounded-full bg-white text-black font-bold flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" className="translate-x-0.5" />}
          </button>
          <button className="text-zinc-400 hover:text-white transition-colors">
            <SkipForward size={18} />
          </button>
        </div>
      </div>

    </div>
  );
}

