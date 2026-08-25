'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { 
  Search, 
  Play, 
  MoreVertical, 
  Music, 
  Loader2, 
  Heart, 
  Pause, 
  Menu, 
  Bell, 
  ChevronDown, 
  X,
  Disc,
  Send
} from 'lucide-react';
import { WalletMenu } from '@/components/dashboard/WalletMenu';
import { Twitter, Instagram } from '@/components/ui/SocialIcons';
import { apiFetch, resolveIpfsUrl, handleLogout } from '@/lib/api';
import { useMusicPlayer } from '@/components/marketplace/MusicPlayerContext';
import { MusicPlayer } from '@/components/marketplace/MusicPlayer';
import toast from 'react-hot-toast';
import { usePrivy, useLogout } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import Link from 'next/link';

interface Track {
  id: number;
  title: string;
  artist_name?: string;
  artist_username?: string;
  cover_url?: string;
  audio_url?: string;
  status?: string;
  type?: 'played' | 'saved' | 'purchased' | 'uploaded' | string;
  category?: string;
  uploader_id?: number;
  purchased?: boolean;
  played?: boolean;
  saved?: boolean;
}

const TABS = ['All', 'Played', 'Saved', 'Purchased'];
const SORT_OPTIONS = ['Recently Added', 'Newest', 'Oldest', 'Title A-Z'];

export default function LibraryPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [sortBy, setSortBy] = useState('Recently Added');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();
  const { user } = usePrivy();
  const { logout } = useLogout();
  const { address } = useAccount();

  const activeAddress = address || user?.wallet?.address;
  const abbrev = activeAddress
    ? `${activeAddress.slice(0, 5)}...${activeAddress.slice(-3)}`
    : '0xc...y69';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('grooveli_token') || localStorage.getItem('groovely_token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setRole(payload.role);
        } catch (_) {}
      }
    }
  }, []);

  const fetchLibrary = async (filter: string) => {
    setLoading(true);
    try {
      const apiFilter = filter.toLowerCase();
      const res = await apiFetch(`/api/library?filter=${apiFilter}&limit=50`);
      if (res && res.ok) {
        const json = await res.json();
        const tracksData = json.data?.tracks || (Array.isArray(json.data) ? json.data : json.tracks || json);
        setTracks(Array.isArray(tracksData) ? tracksData : []);
      }
    } catch (error) {
      console.error('Failed to fetch library', error);
      toast.error('Failed to load tracks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary(activeTab);
  }, [activeTab]);

  const handleSaveTrack = async (trackId: number, isCurrentlySaved: boolean): Promise<boolean> => {
    try {
      const method = isCurrentlySaved ? 'DELETE' : 'POST';
      const res = await apiFetch(`/api/library/save/${trackId}`, {
        method
      });
      if (res && res.ok) {
        toast.success(isCurrentlySaved ? 'Removed from library' : 'Saved to library');
        return true;
      } else {
        const errorData = await res?.json();
        throw new Error(errorData?.error || 'Action failed');
      }
    } catch (error: any) {
      console.error('Library action error:', error);
      toast.error(error.message || 'Action failed');
      return false;
    }
  };

  const toggleMobileSidebar = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toggle_mobile_sidebar'));
    }
  };

  const filteredTracks = tracks
    .filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.artist_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'Title A-Z') return a.title.localeCompare(b.title);
      if (sortBy === 'Oldest') return a.id - b.id;
      return b.id - a.id; // Recently Added / Newest
    });

  const mapTracksToQueue = (trackList: Track[]) =>
    trackList.map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist_name || t.artist_username || 'Unknown Artist',
      image: resolveIpfsUrl(t.cover_url) || '',
      audioUrl: resolveIpfsUrl(t.audio_url),
      uploaderId: t.uploader_id,
    }));

  const getStatusBadge = (track: Track) => {
    if (activeTab === 'Purchased') return 'Purchased';
    if (activeTab === 'Played') return 'Played';
    if (activeTab === 'Saved') return 'Saved';
    if (track.type) {
      if (track.type === 'purchased') return 'Purchased';
      if (track.type === 'saved') return 'Saved';
      if (track.type === 'played') return 'Played';
      if (track.type === 'uploaded') return 'Uploaded';
    }
    if (track.purchased) return 'Purchased';
    if (track.saved) return 'Saved';
    if (track.played) return 'Played';
    return track.status || 'Active';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#192134] text-white font-sans selection:bg-[#8A2BE2] selection:text-white">
      {/* Universal Responsive Left Sidebar (256px, #0F172A, border-r #232B3E) */}
      <Sidebar activePage="library" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#192134]">
        
        {/* ========================================================================= */}
        {/* MOBILE TOP BAR (Figma Frame 315) - Visible only on mobile (< md)           */}
        {/* ========================================================================= */}
        <div className="md:hidden flex flex-col bg-white/[0.01] border-b border-[#2D3548] backdrop-blur-[50px] sticky top-0 z-40 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <button
                onClick={toggleMobileSidebar}
                className="p-1 text-white hover:opacity-80 transition-opacity cursor-pointer"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-bold font-['Clash_Display',sans-serif] text-white tracking-tight">
                My Library
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileSearch(prev => !prev)}
                className="text-white hover:opacity-80 transition-opacity p-1"
                aria-label="Search"
              >
                {showMobileSearch ? <X size={20} /> : <Search size={20} />}
              </button>

              <button className="text-white hover:opacity-80 transition-opacity p-1 relative">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-[#8A2BE2] rounded-full shadow-[0_0_6px_rgba(138,43,226,0.8)]" />
              </button>

              <WalletMenu compact />
            </div>
          </div>

          {showMobileSearch && (
            <div className="mt-3 relative animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-400">
                <Search size={14} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your library..."
                autoFocus
                className="w-full bg-[#0F172A] border border-[#2D3548] rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-[#8A2BE2]"
              />
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP TOP BAR (Figma Frame 25) - Visible on md+                         */}
        {/* Height: 80px, background: rgba(15, 23, 42, 0.1), border-b: #232B3E        */}
        {/* ========================================================================= */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 h-20 bg-[#0F172A]/10 border-b border-[#232B3E] backdrop-blur-[25px] sticky top-0 z-40">
          {/* Left: "My Library" Heading (24px Clash Display) + Search Bar (300x48px, border: 2px solid #232B3E) */}
          <div className="flex items-center gap-6 flex-1">
            <h1 className="text-2xl font-bold font-['Clash_Display',sans-serif] text-white tracking-tight shrink-0">
              My Library
            </h1>

            <div className="relative w-72 lg:w-[300px]">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[#CACACA]">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your library..."
                className="w-full h-12 bg-transparent border-2 border-[#232B3E] focus:border-[#8A2BE2] rounded-lg pl-11 pr-4 text-sm font-['Space_Grotesk',sans-serif] text-white placeholder-[#CACACA] focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Right (Frame 192): Notification icon, Vertical line, Wallet Pill */}
          <div className="flex items-center gap-3">
            <button className="text-white hover:opacity-80 transition-opacity p-2 relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#8A2BE2] rounded-full shadow-[0_0_6px_rgba(138,43,226,0.8)]" />
            </button>

            {/* 32px Vertical Line Divider (Frame 192 Line 6) */}
            <div className="w-px h-8 bg-[#232B3E] mx-1" />

            {/* Interactive Wallet Dropdown */}
            <WalletMenu />
          </div>
        </header>

        {/* ========================================================================= */}
        {/* MAIN SCROLLABLE CONTENT AREA                                              */}
        {/* ========================================================================= */}
        <main className="flex-1 overflow-y-auto pb-28 sm:pb-24 px-4 sm:px-8 md:px-10 pt-6 md:pt-8 bg-[#192134]">
          <div className="max-w-[1200px]">

            {/* ===================================================================== */}
            {/* TABS (Frame 222) & SORT BUTTON (Frame 223) ROW                        */}
            {/* ===================================================================== */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              
              {/* Tab Filters (Frame 222) */}
              <div className="flex items-center gap-4 sm:gap-6 border-b border-[#2D3548] pb-1 overflow-x-auto no-scrollbar">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className="relative pb-2 px-1 text-base font-['Space_Grotesk',sans-serif] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <span className={isActive ? 'font-bold text-white' : 'font-normal text-[#CACACA] hover:text-white'}>
                        {tab}
                      </span>
                      {isActive && (
                        <span className="absolute left-0 bottom-0 w-full h-[4px] bg-[#8A2BE2] rounded-t-full shadow-[0_0_10px_rgba(138,43,226,0.6)]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Sort Pill Selector (Frame 223: Recently Added) */}
              <div className="relative inline-block self-start sm:self-auto">
                <button
                  onClick={() => setSortDropdownOpen(prev => !prev)}
                  className="flex items-center gap-2 bg-[#232B3E] hover:bg-[#2c364e] text-[#CACACA] hover:text-white px-3 py-1.5 rounded text-sm font-['Space_Grotesk',sans-serif] transition-all cursor-pointer"
                >
                  <span>{sortBy}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${sortDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {sortDropdownOpen && (
                  <div className="absolute left-0 sm:right-0 sm:left-auto mt-1.5 w-44 bg-[#0F172A] border border-[#2D3548] rounded-lg shadow-2xl z-40 py-1 overflow-hidden animate-in fade-in duration-150">
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => {
                          setSortBy(opt);
                          setSortDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-['Space_Grotesk',sans-serif] transition-colors ${
                          sortBy === opt ? 'bg-[#8A2BE2]/20 text-white font-bold' : 'text-[#CACACA] hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ===================================================================== */}
            {/* TRACKS 3-COLUMN GRID (Frame 230, 231, 232, 233, etc.) - Width: 386px  */}
            {/* ===================================================================== */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 size={36} className="text-[#8A2BE2] animate-spin" />
                <p className="text-[#CACACA] font-['Space_Grotesk',sans-serif] text-xs uppercase tracking-widest font-bold">
                  Loading library…
                </p>
              </div>
            ) : filteredTracks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTracks.map((track) => {
                  const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;
                  const statusBadge = getStatusBadge(track);

                  return (
                    <div
                      key={track.id}
                      className="bg-[#0F172A] hover:bg-[#121c33] border border-[#2D3548]/30 hover:border-[#8A2BE2]/50 rounded-lg p-4 h-24 flex items-center gap-4 group transition-all duration-200"
                    >
                      {/* 64x64 Cover Image (Rectangle 22) */}
                      <div className="relative w-16 h-16 rounded overflow-hidden shrink-0 bg-[#192134] shadow-md">
                        <img
                          src={resolveIpfsUrl(track.cover_url) || "https://images.unsplash.com/photo-1514525253361-bee8d48800d5?auto=format&fit=crop&w=300&q=80"}
                          alt={track.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          onClick={() =>
                            playTrack({
                              id: track.id,
                              title: track.title,
                              artist: track.artist_name || track.artist_username || 'Unknown Artist',
                              image: resolveIpfsUrl(track.cover_url) || '',
                              audioUrl: resolveIpfsUrl(track.audio_url),
                              uploaderId: track.uploader_id,
                            }, mapTracksToQueue(filteredTracks))
                          }
                          className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity cursor-pointer opacity-90 group-hover:opacity-100"
                          aria-label="Play track"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#8A2BE2] flex items-center justify-center text-white shadow-lg">
                            {isThisTrackPlaying ? (
                              <Pause size={14} fill="white" />
                            ) : (
                              <Play size={14} fill="white" className="ml-0.5" />
                            )}
                          </div>
                        </button>
                      </div>

                      {/* Details (Frame 225 & Frame 238) */}
                      <div className="flex-1 min-w-0">
                        {/* Title: Clash Display 20px Bold (Headings/H-6/Bold) */}
                        <h3 className="text-lg font-bold font-['Clash_Display',sans-serif] text-white truncate group-hover:text-[#8A2BE2] transition-colors leading-tight">
                          {track.title}
                        </h3>

                        {/* Meta row: Artist (Space Grotesk 16px) + Status Badge (Frame 237: 12px Bold, #192134 bg) */}
                        <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                          <span className="text-sm font-normal font-['Space_Grotesk',sans-serif] text-[#CACACA] truncate max-w-[130px]">
                            {track.artist_name || (track.artist_username ? `@${track.artist_username}` : 'Unknown Artist')}
                          </span>

                          <span className="bg-[#192134] text-white text-xs font-bold font-['Space_Grotesk',sans-serif] px-3 py-0.5 rounded">
                            {statusBadge}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleSaveTrack(track.id, !!track.saved)}
                          className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors"
                          title="Save"
                        >
                          <Heart size={16} fill={track.saved ? '#EF4444' : 'none'} className={track.saved ? 'text-red-500' : ''} />
                        </button>
                        <button className="p-1.5 text-zinc-400 hover:text-white transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-[#0F172A]/50 border border-dashed border-[#2D3548] rounded-2xl p-6">
                <div className="w-16 h-16 bg-[#192134] rounded-full flex items-center justify-center text-zinc-500">
                  <Music size={28} />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-white font-['Clash_Display',sans-serif]">No tracks in {activeTab}</p>
                  <p className="text-[#CACACA] text-xs font-['Space_Grotesk',sans-serif] max-w-xs">
                    Browse the marketplace or discover new sounds in explore.
                  </p>
                </div>
                <Link
                  href="/marketplace"
                  className="bg-[#8A2BE2] hover:bg-[#7823c9] text-white text-xs font-bold font-['Space_Grotesk',sans-serif] py-2.5 px-6 rounded-lg transition-all shadow-[0_0_12px_rgba(138,43,226,0.4)]"
                >
                  Explore Marketplace
                </Link>
              </div>
            )}

            {/* ===================================================================== */}
            {/* DESKTOP FOOTER (Figma Text input container: 1256x56px, border-t #232B3E)*/}
            {/* ===================================================================== */}
            <footer className="mt-16 pt-6 border-t border-[#232B3E] flex flex-col md:flex-row justify-between items-center gap-4 text-[#CACACA]">
              <div className="flex flex-wrap items-center justify-center gap-x-2.5 text-sm font-['Space_Grotesk',sans-serif]">
                <a href="#" className="hover:text-white transition-colors">About Groovely</a>
                <span className="w-1 h-1 bg-[#CACACA] rounded-full" />
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <span className="w-1 h-1 bg-[#CACACA] rounded-full" />
                <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
                <span className="w-1 h-1 bg-[#CACACA] rounded-full" />
                <a href="#" className="hover:text-white transition-colors">Docs/Developer API</a>
                <span className="w-1 h-1 bg-[#CACACA] rounded-full" />
                <a href="#" className="hover:text-white transition-colors">Feedback</a>
              </div>

              <div className="flex items-center gap-4 text-[#CACACA]">
                <a href="#" className="hover:text-white transition-colors" aria-label="Twitter"><Twitter size={16} /></a>
                <a href="#" className="hover:text-white transition-colors" aria-label="Disc"><Disc size={16} /></a>
                <a href="#" className="hover:text-white transition-colors" aria-label="Telegram"><Send size={16} /></a>
                <a href="#" className="hover:text-white transition-colors" aria-label="Instagram"><Instagram size={16} /></a>
              </div>
            </footer>

          </div>
        </main>
      </div>

      {/* Global Music Player Bar */}
      <MusicPlayer />
    </div>
  );
}
