'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Radio, 
  Users, 
  Headphones, 
  Play, 
  Pause, 
  Menu, 
  X, 
  Disc, 
  Send, 
  Loader2, 
  Upload, 
  User as UserIcon,
  Music
} from 'lucide-react';
import { Twitter, Instagram, YouTube, OpenSea } from '@/components/ui/SocialIcons';
import { WalletMenu } from '@/components/dashboard/WalletMenu';
import { apiFetch, resolveIpfsUrl } from '@/lib/api';
import { useMusicPlayer } from '@/components/marketplace/MusicPlayerContext';
import { MusicPlayer } from '@/components/marketplace/MusicPlayer';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import Link from 'next/link';

interface DiscographyItem {
  id: number | string;
  title: string;
  artist: string;
  plays: string | number;
  cover_url?: string | null;
  audio_url?: string | null;
}

function formatNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '0';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0';
  if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (n >= 1_000) {
    return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return n.toLocaleString();
}

export default function ProfilePage() {
  const router = useRouter();
  const { user } = usePrivy();
  const { address } = useAccount();
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();

  const [profile, setProfile] = useState<any>(null);
  const [role, setRole] = useState<string>('creator');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [discography, setDiscography] = useState<DiscographyItem[]>([]);

  const activeAddress = address || user?.wallet?.address;
  const abbrev = activeAddress
    ? `${activeAddress.slice(0, 5)}...${activeAddress.slice(-3)}`
    : '0x00...000';

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const storedRole = localStorage.getItem('grooveli_role') || 'creator';
        setRole(storedRole);

        const endpoint = storedRole === 'fan' ? '/api/fan/profile' : '/api/creator/profile';
        const res = await apiFetch(endpoint);
        let currentDisplayName = '';

        if (res?.ok) {
          const json = await res.json();
          const p = json.data ?? json;
          setProfile(p);
          if (p?.display_name) currentDisplayName = p.display_name;
        }

        const tracksEndpoint = storedRole === 'fan' ? '/api/library?filter=saved&limit=50' : '/api/creator/dashboard/tracks';
        const tracksRes = await apiFetch(tracksEndpoint);
        if (tracksRes?.ok) {
          const trkJson = await tracksRes.json();
          const list = trkJson.data?.tracks || trkJson.tracks || (Array.isArray(trkJson.data) ? trkJson.data : []);
          if (Array.isArray(list)) {
            const mapped: DiscographyItem[] = list.map((item: any, idx: number) => ({
              id: item.id || idx + 1,
              title: item.title || 'Untitled Track',
              artist: item.artist_name || currentDisplayName || 'You',
              plays: item.streams ? Number(item.streams).toLocaleString() : '0',
              cover_url: item.cover_url ? resolveIpfsUrl(item.cover_url) : null,
              audio_url: item.audio_url ? resolveIpfsUrl(item.audio_url) : null
            }));
            setDiscography(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const toggleMobileSidebar = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toggle_mobile_sidebar'));
    }
  };

  const displayName = profile?.display_name || user?.email?.address?.split('@')[0] || (activeAddress ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}` : 'Groovely Member');
  
  const username = profile?.username 
    ? `@${profile.username.replace(/^@/, '')}` 
    : (user?.email?.address ? `@${user.email.address.split('@')[0]}` : (activeAddress ? `@${activeAddress.slice(2, 8).toLowerCase()}` : '@groovely'));
  
  const creatorType = Array.isArray(profile?.creator_type) && profile.creator_type.length > 0 
    ? profile.creator_type[0] 
    : (typeof profile?.creator_type === 'string' ? profile.creator_type : (role === 'fan' ? 'Music Fan' : 'Creator'));
  
  const bio = profile?.bio;

  const rawAvatar = profile?.avatar_url ? resolveIpfsUrl(profile.avatar_url) : null;

  const stats = {
    allTimePlays: formatNumber(profile?.stats?.all_time_plays ?? profile?.stats?.total_plays ?? 0),
    followers: formatNumber(profile?.stats?.followers ?? 0),
    monthlyListeners: formatNumber(profile?.stats?.monthly_listeners ?? 0),
  };

  const filteredDiscography = discography.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#192134] text-white font-sans selection:bg-[#8A2BE2] selection:text-white">
      {/* Universal Drawer Sidebar */}
      <Sidebar activePage="profile" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#192134]">
        
        {/* ========================================================================= */}
        {/* MOBILE TOP BAR (Figma Frame 315) - Visible on < md                         */}
        {/* ========================================================================= */}
        <div className="md:hidden flex flex-col bg-white/[0.01] border-b border-[#2D3548] backdrop-blur-[50px] sticky top-0 z-40 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left (Frame 304): Hamburger + "Profile" Title */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMobileSidebar}
                className="p-1 text-white hover:opacity-80 transition-opacity cursor-pointer"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-bold font-['Clash_Display',sans-serif] text-white tracking-tight">
                Profile
              </h1>
            </div>

            {/* Right (Frame 51 & 49): Search + Notification + Wallet Symbol & Arrow */}
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
                placeholder="Search discography..."
                autoFocus
                className="w-full bg-[#0F172A] border border-[#2D3548] rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-[#8A2BE2]"
              />
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP TOP BAR (Figma Frame 25) - Visible on md+                         */}
        {/* ========================================================================= */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 h-20 bg-[#0F172A]/10 border-b border-[#232B3E] backdrop-blur-[25px] sticky top-0 z-40">
          <div className="flex items-center gap-6 flex-1">
            <h1 className="text-2xl font-bold font-['Clash_Display',sans-serif] text-white tracking-tight shrink-0">
              Profile
            </h1>

            <div className="relative w-72 lg:w-[300px]">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[#CACACA]">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full h-12 bg-transparent border-2 border-[#232B3E] focus:border-[#8A2BE2] rounded-lg pl-11 pr-4 text-sm font-['Space_Grotesk',sans-serif] text-white placeholder-[#CACACA] focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="text-white hover:opacity-80 transition-opacity p-2 relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#8A2BE2] rounded-full shadow-[0_0_6px_rgba(138,43,226,0.8)]" />
            </button>

            <div className="w-px h-8 bg-[#232B3E] mx-1" />

            <WalletMenu />
          </div>
        </header>

        {/* ========================================================================= */}
        {/* MAIN SCROLLABLE CONTENT                                                   */}
        {/* ========================================================================= */}
        <main className="flex-1 overflow-y-auto pb-28 px-4 sm:px-8 md:px-10 pt-4 md:pt-8 bg-[#192134]">
          <div className="max-w-[1200px] mx-auto space-y-6">

            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-[#8A2BE2]" size={36} />
                <p className="text-sm font-['Space_Grotesk',sans-serif] text-[#CACACA]">Loading profile...</p>
              </div>
            ) : (
              <>
                {/* ===================================================================== */}
                {/* PROFILE HEADER (Desktop: Avatar + Info + Edit Button)                 */}
                {/* ===================================================================== */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 sm:gap-6">
                    {/* Ellipse 9: 100x100 Avatar */}
                    <div className="w-[100px] h-[100px] rounded-full overflow-hidden shrink-0 border-2 border-[#2D3548] shadow-lg bg-[#0F172A] flex items-center justify-center">
                      {rawAvatar ? (
                        <img
                          src={rawAvatar}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#8A2BE2] to-[#232B3E] flex items-center justify-center text-white">
                          <span className="text-3xl font-bold font-['Clash_Display',sans-serif] uppercase">
                            {displayName.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Frame 205: Info */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <h2 className="text-2xl sm:text-3xl font-bold font-['Clash_Display',sans-serif] text-white">
                          {displayName}
                        </h2>
                        <span className="text-sm sm:text-base font-normal font-['Space_Grotesk',sans-serif] text-[#CACACA]">
                          {username}
                        </span>
                      </div>

                      {/* Frame 2: Creator Type Pill */}
                      <div className="inline-flex items-center px-3 py-1 bg-[#2D3548] rounded-lg text-xs sm:text-sm font-normal font-['Space_Grotesk',sans-serif] text-white capitalize">
                        {creatorType}
                      </div>
                    </div>
                  </div>

                  {/* Frame 18: Edit Profile CTA */}
                  <Link
                    href="/dashboard/settings"
                    className="hidden sm:inline-flex items-center justify-center bg-[#8A2BE2] hover:bg-[#7823c9] text-white px-8 py-3.5 sm:py-4 rounded-lg text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] shadow-[0_0_20px_rgba(138,43,226,0.3)] transition-all cursor-pointer shrink-0"
                  >
                    Edit Profile
                  </Link>
                </div>

                {/* Line 13 Divider */}
                <hr className="border-t border-[#2D3548] my-4 sm:my-6" />

                {/* ===================================================================== */}
                {/* ABOUT SECTION (Dynamic User Bio)                                     */}
                {/* ===================================================================== */}
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-lg sm:text-xl font-bold font-['Clash_Display',sans-serif] text-white">
                    About
                  </h3>
                  {bio ? (
                    <p className="text-sm sm:text-base font-normal font-['Space_Grotesk',sans-serif] text-white leading-relaxed max-w-4xl whitespace-pre-line">
                      {bio}
                    </p>
                  ) : (
                    <p className="text-sm sm:text-base font-normal font-['Space_Grotesk',sans-serif] text-[#CACACA]/70 italic max-w-4xl">
                      No bio added yet. Click &quot;Edit Profile&quot; in Settings to add your bio.
                    </p>
                  )}
                </div>

                {/* Line 14 Divider */}
                <hr className="border-t border-[#2D3548] my-4 sm:my-6" />

                {/* ===================================================================== */}
                {/* SOCIALS SECTION (Dynamic Social Handles)                             */}
                {/* ===================================================================== */}
                <div className="space-y-3">
                  <h3 className="text-lg sm:text-xl font-bold font-['Clash_Display',sans-serif] text-white">
                    Socials
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    {/* Twitter / X */}
                    <a
                      href={profile?.twitter ? (profile.twitter.startsWith('http') ? profile.twitter : `https://x.com/${profile.twitter.replace(/^@/, '')}`) : '#'}
                      target={profile?.twitter ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className={`inline-flex items-center justify-center px-6 h-14 bg-[#232B3E] hover:bg-[#2c364e] border border-transparent rounded-lg transition-all ${profile?.twitter ? 'text-white cursor-pointer' : 'text-[#697184] cursor-default'}`}
                      aria-label="Twitter X"
                    >
                      <Twitter size={24} />
                    </a>

                    {/* Instagram */}
                    <a
                      href={profile?.instagram ? (profile.instagram.startsWith('http') ? profile.instagram : `https://instagram.com/${profile.instagram.replace(/^@/, '')}`) : '#'}
                      target={profile?.instagram ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className={`inline-flex items-center justify-center px-6 h-14 bg-[#232B3E] hover:bg-[#2c364e] border border-transparent rounded-lg transition-all ${profile?.instagram ? 'text-white cursor-pointer' : 'text-[#697184] cursor-default'}`}
                      aria-label="Instagram"
                    >
                      <Instagram size={24} />
                    </a>

                    {/* YouTube Connect */}
                    <a
                      href={profile?.youtube || '#'}
                      target={profile?.youtube ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2.5 px-6 h-14 bg-[#232B3E] hover:bg-[#2c364e] border border-transparent rounded-lg text-white transition-all cursor-pointer"
                    >
                      <span className="text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                        Connect
                      </span>
                      <YouTube size={24} className="text-[#CACACA]" />
                    </a>

                    {/* OpenSea */}
                    <a
                      href={activeAddress ? `https://opensea.io/${activeAddress}` : '#'}
                      target={activeAddress ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 h-14 bg-[#232B3E] hover:bg-[#2c364e] border border-transparent rounded-lg text-[#CACACA] hover:text-white transition-all cursor-pointer"
                      aria-label="OpenSea"
                    >
                      <OpenSea size={24} />
                    </a>
                  </div>
                </div>

                {/* Line 15 Divider */}
                <hr className="border-t border-[#2D3548] my-4 sm:my-6" />

                {/* ===================================================================== */}
                {/* STATS SECTION (Live DB Stats: Plays, Followers, Listeners)            */}
                {/* ===================================================================== */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Metric 1: All-Time Plays */}
                  <div className="bg-[#0F172A] rounded-xl p-4 sm:p-6 flex flex-col justify-between min-h-[172px] sm:h-[196px] border border-[#232B3E]/40 hover:border-[#8A2BE2]/40 transition-colors">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#192134] flex items-center justify-center text-[#697184]">
                      <Radio size={28} className="sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-[#CACACA]">
                        All-Time Plays
                      </p>
                      <p className="text-2xl sm:text-4xl font-bold font-['Clash_Display',sans-serif] text-white mt-1">
                        {stats.allTimePlays}
                      </p>
                    </div>
                  </div>

                  {/* Metric 2: Followers */}
                  <div className="bg-[#0F172A] rounded-xl p-4 sm:p-6 flex flex-col justify-between min-h-[172px] sm:h-[196px] border border-[#232B3E]/40 hover:border-[#8A2BE2]/40 transition-colors">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#192134] flex items-center justify-center text-[#697184]">
                      <Users size={28} className="sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-[#CACACA]">
                        Followers
                      </p>
                      <p className="text-2xl sm:text-4xl font-bold font-['Clash_Display',sans-serif] text-white mt-1">
                        {stats.followers}
                      </p>
                    </div>
                  </div>

                  {/* Metric 3: Monthly Listeners */}
                  <div className="bg-[#0F172A] rounded-xl p-4 sm:p-6 flex flex-col justify-between min-h-[172px] sm:h-[196px] border border-[#232B3E]/40 hover:border-[#8A2BE2]/40 transition-colors">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#192134] flex items-center justify-center text-[#697184]">
                      <Headphones size={28} className="sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-[#CACACA]">
                        Monthly Listeners
                      </p>
                      <p className="text-2xl sm:text-4xl font-bold font-['Clash_Display',sans-serif] text-white mt-1">
                        {stats.monthlyListeners}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Line 16 Divider */}
                <hr className="border-t border-[#2D3548] my-4 sm:my-6" />

                {/* ===================================================================== */}
                {/* DISCOGRAPHY SECTION (Live DB Tracks)                                 */}
                {/* ===================================================================== */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg sm:text-xl font-bold font-['Clash_Display',sans-serif] text-white">
                      Discography
                    </h3>
                    {role === 'creator' && (
                      <Link
                        href="/dashboard/upload/mint"
                        className="text-xs sm:text-sm font-bold font-['Space_Grotesk',sans-serif] text-[#8A2BE2] hover:text-[#a855f7] transition-colors"
                      >
                        + Upload Track
                      </Link>
                    )}
                  </div>

                  {filteredDiscography.length === 0 ? (
                    <div className="bg-[#0F172A] border border-[#2D3548] rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4">
                      <div className="w-14 h-14 rounded-full bg-[#192134] flex items-center justify-center text-[#8A2BE2]">
                        <Radio size={28} />
                      </div>
                      <div className="space-y-1 max-w-sm">
                        <p className="text-lg font-bold font-['Clash_Display',sans-serif] text-white">
                          No tracks in discography yet
                        </p>
                        <p className="text-xs sm:text-sm font-['Space_Grotesk',sans-serif] text-[#CACACA]">
                          {role === 'creator'
                            ? 'Upload your first track to start sharing and earning on Groovely.'
                            : 'Saved tracks in your library will appear here.'}
                        </p>
                      </div>
                      {role === 'creator' && (
                        <Link
                          href="/dashboard/upload/mint"
                          className="inline-flex items-center gap-2 bg-[#8A2BE2] hover:bg-[#7823c9] text-white px-6 py-3 rounded-lg text-sm font-bold font-['Space_Grotesk',sans-serif] shadow-[0_0_20px_rgba(138,43,226,0.3)] transition-all cursor-pointer"
                        >
                          <Upload size={16} />
                          Upload &amp; Mint Track
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {filteredDiscography.map((item) => {
                        const isCurrent = currentTrack?.id === item.id;
                        return (
                          <div
                            key={item.id}
                            className="group relative bg-[#0F172A] rounded-xl overflow-hidden h-[250px] border border-[#232B3E]/40 hover:border-[#8A2BE2]/50 transition-all duration-300 shadow-md"
                          >
                            {/* Artwork or fallback gradient card */}
                            {item.cover_url ? (
                              <img
                                src={item.cover_url}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#192134] via-[#0F172A] to-[#232B3E] flex items-center justify-center text-[#697184]">
                                <Music size={48} className="text-[#8A2BE2]/50" />
                              </div>
                            )}
                            
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/90 pointer-events-none" />

                            {/* Play Overlay Button */}
                            <button
                              onClick={() =>
                                playTrack({
                                  id: item.id,
                                  title: item.title,
                                  artist: item.artist,
                                  image: item.cover_url || '',
                                  audioUrl: item.audio_url || '',
                                })
                              }
                              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px] cursor-pointer"
                              aria-label="Play track"
                            >
                              <div className="w-14 h-14 rounded-full bg-[#8A2BE2] text-white flex items-center justify-center shadow-[0_0_20px_rgba(138,43,226,0.6)] transform scale-90 group-hover:scale-100 transition-transform">
                                {isCurrent && isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                              </div>
                            </button>

                            {/* Bottom Info: Title, Artist, and Plays */}
                            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 flex flex-col justify-end pointer-events-none">
                              <h4 className="text-lg sm:text-xl font-semibold font-['Clash_Display',sans-serif] text-white line-clamp-1 leading-snug">
                                {item.title}
                              </h4>

                              <div className="flex items-center justify-between mt-1 text-xs sm:text-sm font-bold font-['Space_Grotesk',sans-serif] text-[#CACACA]">
                                <span>{item.artist}</span>
                                <span>{item.plays} Plays</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ===================================================================== */}
                {/* FOOTER (Mobile Frame 310 & 309 / Desktop Text Container)              */}
                {/* ===================================================================== */}
                <footer className="mt-10 sm:mt-14 pt-6 border-t border-[#2D3548] flex flex-col md:flex-row justify-between items-center gap-4 text-[#CACACA]">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-y-1.5 gap-x-2 text-[10px] sm:text-sm font-['Space_Grotesk',sans-serif]">
                    <div className="flex items-center gap-2">
                      <a href="#" className="hover:text-white transition-colors">About Groovely</a>
                      <span className="w-1 h-1 bg-[#CACACA] rounded-full" />
                      <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                      <span className="w-1 h-1 bg-[#CACACA] rounded-full" />
                      <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline-block w-1 h-1 bg-[#CACACA] rounded-full" />
                      <a href="#" className="hover:text-white transition-colors">Docs/Developer API</a>
                      <span className="w-1 h-1 bg-[#CACACA] rounded-full" />
                      <a href="#" className="hover:text-white transition-colors">Feedback</a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[#CACACA]">
                    <a href="#" className="hover:text-white transition-colors" aria-label="Twitter"><Twitter size={16} /></a>
                    <a href="#" className="hover:text-white transition-colors" aria-label="Disc"><Disc size={16} /></a>
                    <a href="#" className="hover:text-white transition-colors" aria-label="Telegram"><Send size={16} /></a>
                    <a href="#" className="hover:text-white transition-colors" aria-label="Instagram"><Instagram size={16} /></a>
                  </div>
                </footer>
              </>
            )}

          </div>
        </main>
      </div>

      <MusicPlayer />
    </div>
  );
}
