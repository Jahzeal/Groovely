'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  ArrowUpRight, 
  Menu, 
  X,
  Play,
  Pause,
  Upload,
  Radio,
  Disc,
  Send,
  Loader2,
  Music
} from 'lucide-react';
import { Twitter, Instagram } from '@/components/ui/SocialIcons';
import { WalletMenu } from '@/components/dashboard/WalletMenu';
import { apiFetch, resolveIpfsUrl } from '@/lib/api';
import { useMusicPlayer } from '@/components/marketplace/MusicPlayerContext';
import { MusicPlayer } from '@/components/marketplace/MusicPlayer';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import Link from 'next/link';

interface TrackItem {
  id: number | string;
  title: string;
  artist_name?: string;
  cover_url?: string | null;
  audio_url?: string | null;
  category: string;
  streams: number;
  earnings: number;
  status: 'Live' | 'Draft' | 'Failed' | 'Minting';
}

export default function AnalyticsPage() {
  const { user } = usePrivy();
  const { address } = useAccount();
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();

  const [activeChartTab, setActiveChartTab] = useState<'Plays' | '$ Earnings' | 'Listeners'>('Plays');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    streams: 0,
    streamsChange: 0,
    earnings: 0,
    earningsChange: 0,
    uploads: 0,
    uploadsChange: 0,
  });

  const [tracks, setTracks] = useState<TrackItem[]>([]);

  const activeAddress = address || user?.wallet?.address;
  const abbrev = activeAddress
    ? `${activeAddress.slice(0, 5)}...${activeAddress.slice(-3)}`
    : '0x00...000';

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [statsRes, tracksRes] = await Promise.all([
          apiFetch('/api/creator/dashboard/stats'),
          apiFetch('/api/creator/dashboard/tracks'),
        ]);

        if (statsRes?.ok) {
          const statsJson = await statsRes.json();
          const s = statsJson.data || statsJson;
          setStats({
            streams: s.streams?.total ?? s.total_streams ?? 0,
            streamsChange: s.streams?.change ?? 0,
            earnings: s.earnings?.total ?? s.total_earnings ?? 0,
            earningsChange: s.earnings?.change ?? 0,
            uploads: s.uploads?.total ?? s.total_uploads ?? 0,
            uploadsChange: s.uploads?.change ?? 0,
          });
        }

        if (tracksRes?.ok) {
          const trkJson = await tracksRes.json();
          const list = trkJson.data?.tracks || trkJson.tracks || (Array.isArray(trkJson.data) ? trkJson.data : []);
          if (Array.isArray(list)) {
            const mapped: TrackItem[] = list.map((item: any, idx: number) => ({
              id: item.id || idx,
              title: item.title || 'Untitled Track',
              artist_name: item.artist_name || 'You',
              cover_url: item.cover_url ? resolveIpfsUrl(item.cover_url) : null,
              audio_url: item.audio_url ? resolveIpfsUrl(item.audio_url) : null,
              category: item.category || 'Music',
              streams: Number(item.streams || item.play_count || 0),
              earnings: Number(item.earnings || item.total_sales || 0),
              status: (item.status === 'Published' || item.status === 'Live') ? 'Live' : (item.status === 'Draft' ? 'Draft' : 'Live')
            }));
            setTracks(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to load analytics data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleMobileSidebar = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toggle_mobile_sidebar'));
    }
  };

  const chartPointsMobile = [
    { label: '512' },
    { label: '513' },
    { label: '514' },
    { label: '515' },
    { label: '516' },
    { label: '517' },
    { label: '522' },
    { label: '518' },
    { label: '519' },
    { label: '520' },
    { label: '521' },
    { label: '523' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Live':
        return (
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-['Space_Grotesk',sans-serif] font-normal bg-[rgba(0,255,136,0.1)] text-[#00FF88]">
            Live
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-['Space_Grotesk',sans-serif] font-normal bg-[rgba(255,230,0,0.1)] text-[#FFE600]">
            Draft
          </span>
        );
      case 'Minting':
        return (
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-['Space_Grotesk',sans-serif] font-normal bg-[rgba(0,217,255,0.1)] text-[#00D9FF]">
            Minting
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-['Space_Grotesk',sans-serif] font-normal bg-[rgba(255,0,68,0.1)] text-[#FF0044]">
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-['Space_Grotesk',sans-serif] bg-white/5 text-zinc-400">
            {status}
          </span>
        );
    }
  };

  const filteredTracks = tracks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topTracks = [...tracks].sort((a, b) => b.streams - a.streams).slice(0, 3);

  return (
    <div className="flex h-screen overflow-hidden bg-[#192134] text-white font-sans selection:bg-[#8A2BE2] selection:text-white">
      {/* Universal Drawer Sidebar */}
      <Sidebar activePage="analytics" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#192134]">
        
        {/* ========================================================================= */}
        {/* MOBILE TOP BAR (Figma Frame 315) - Visible on < md                         */}
        {/* ========================================================================= */}
        <div className="md:hidden flex flex-col bg-white/[0.01] border-b border-[#2D3548] backdrop-blur-[50px] sticky top-0 z-40 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left (Frame 304): Hamburger + "Analytics" Title */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMobileSidebar}
                className="p-1 text-white hover:opacity-80 transition-opacity cursor-pointer"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-bold font-['Clash_Display',sans-serif] text-white tracking-tight">
                Analytics
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
                placeholder="Search tracks..."
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
              Analytics
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

            {/* ===================================================================== */}
            {/* 3 METRIC CARDS (Streams, Earnings, Uploads)                           */}
            {/* ===================================================================== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Metric 1: Streams */}
              <div className="bg-[#0F172A] rounded-xl p-4 sm:p-6 border border-[#232B3E]/40 flex flex-col justify-between min-h-[172px] sm:h-[196px]">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#192134] flex items-center justify-center text-[#697184]">
                    <Radio size={28} className="sm:w-8 sm:h-8" />
                  </div>
                  {stats.streamsChange !== 0 && (
                    <span className="text-xs sm:text-sm font-bold font-['Space_Grotesk',sans-serif] text-[#00FF88]">
                      +{stats.streamsChange}%
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-[#CACACA]">
                    Streams
                  </p>
                  <h3 className="text-2xl sm:text-4xl font-bold font-['Clash_Display',sans-serif] text-white mt-1">
                    {stats.streams.toLocaleString()}
                  </h3>
                </div>
              </div>

              {/* Metric 2: Earnings */}
              <div className="bg-[#0F172A] rounded-xl p-4 sm:p-6 border border-[#232B3E]/40 flex flex-col justify-between min-h-[172px] sm:h-[196px]">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#192134] flex items-center justify-center text-white">
                    <span className="text-2xl sm:text-3xl font-bold font-['Clash_Display',sans-serif]">$</span>
                  </div>
                  {stats.earningsChange !== 0 && (
                    <span className="text-xs sm:text-sm font-bold font-['Space_Grotesk',sans-serif] text-[#00FF88]">
                      +{stats.earningsChange}%
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-[#CACACA]">
                    Earnings
                  </p>
                  <h3 className="text-2xl sm:text-4xl font-bold font-['Clash_Display',sans-serif] text-white mt-1">
                    ${stats.earnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                </div>
              </div>

              {/* Metric 3: Uploads */}
              <div className="bg-[#0F172A] rounded-xl p-4 sm:p-6 border border-[#232B3E]/40 flex flex-col justify-between min-h-[172px] sm:h-[196px]">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#192134] flex items-center justify-center text-[#697184]">
                    <Upload size={28} className="sm:w-8 sm:h-8" />
                  </div>
                  {stats.uploadsChange !== 0 && (
                    <span className="text-xs sm:text-sm font-bold font-['Space_Grotesk',sans-serif] text-[#FF0044]">
                      {stats.uploadsChange}%
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-[#CACACA]">
                    Uploads
                  </p>
                  <h3 className="text-2xl sm:text-4xl font-bold font-['Clash_Display',sans-serif] text-white mt-1">
                    {stats.uploads.toLocaleString()}
                  </h3>
                </div>
              </div>

            </div>

            {/* ===================================================================== */}
            {/* PERFORMANCE CHART SECTION                                             */}
            {/* ===================================================================== */}
            <div className="bg-[#0F172A] rounded-xl p-4 sm:p-6 border border-[#232B3E]/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-lg sm:text-xl font-bold font-['Clash_Display',sans-serif] text-white">
                  Performance Chart
                </h2>

                <div className="flex items-center gap-3">
                  {(['Plays', '$ Earnings', 'Listeners'] as const).map((tab) => {
                    const isActive = activeChartTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveChartTab(tab)}
                        className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold font-['Space_Grotesk',sans-serif] transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[rgba(138,43,226,0.1)] border-2 border-[#4E0AA6] text-[#CACACA] shadow-[0_0_12px_rgba(138,43,226,0.3)]'
                            : 'bg-[#192134] text-[#CACACA] hover:text-white border-2 border-transparent'
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Line Chart Canvas */}
              <div className="bg-[#192134] rounded-xl p-3 sm:p-6 h-[260px] sm:h-[332px] flex flex-col justify-between relative overflow-hidden">
                <div className="relative flex-1 w-full flex items-end">
                  <svg className="w-full h-[85%] overflow-visible" viewBox="0 0 1000 200" preserveAspectRatio="none">
                    <line x1="0" y1="0" x2="1000" y2="0" stroke="#2D3548" strokeDasharray="3 3" strokeWidth="1" />
                    <line x1="0" y1="50" x2="1000" y2="50" stroke="#2D3548" strokeDasharray="3 3" strokeWidth="1" />
                    <line x1="0" y1="100" x2="1000" y2="100" stroke="#2D3548" strokeDasharray="3 3" strokeWidth="1" />
                    <line x1="0" y1="150" x2="1000" y2="150" stroke="#2D3548" strokeDasharray="3 3" strokeWidth="1" />
                    <line x1="0" y1="200" x2="1000" y2="200" stroke="#2D3548" strokeWidth="1" />

                    <defs>
                      <linearGradient id="analyticsChartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8A2BE2" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#8A2BE2" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    <path
                      d="M 0 160 Q 80 120, 160 140 T 320 80 T 480 50 T 640 100 T 800 30 T 1000 70 L 1000 200 L 0 200 Z"
                      fill="url(#analyticsChartGrad)"
                    />

                    <path
                      d="M 0 160 Q 80 120, 160 140 T 320 80 T 480 50 T 640 100 T 800 30 T 1000 70"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    <circle cx="800" cy="30" r="5" fill="#8A2BE2" stroke="#FFFFFF" strokeWidth="2" />
                  </svg>

                  <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[9px] sm:text-[10px] font-['Inter',sans-serif] text-[#A3A3A3] pointer-events-none">
                    <span>1 500</span>
                    <span>1 000</span>
                    <span>500</span>
                    <span>0</span>
                  </div>
                </div>

                {/* X-Axis labels */}
                <div className="flex justify-between pl-6 sm:pl-8 pr-1 sm:pr-2 pt-2 border-t border-[#232B3E] text-[8px] sm:text-[10px] font-['Inter',sans-serif] text-[#A3A3A3]">
                  {chartPointsMobile.map(p => (
                    <span key={p.label}>{p.label}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* TRACKS SUMMARY TABLE + TOP TRACKS SIDEBAR                             */}
            {/* ===================================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Tracks Performance Table (2 Columns on Desktop) */}
              <div className="lg:col-span-2 bg-[#0F172A] rounded-xl p-4 sm:p-6 border border-[#232B3E]/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#232B3E]">
                    <h2 className="text-lg sm:text-xl font-bold font-['Clash_Display',sans-serif] text-white">
                      Tracks Performance
                    </h2>
                    <Link
                      href="/dashboard/upload/mint"
                      className="text-xs sm:text-sm font-bold font-['Space_Grotesk',sans-serif] text-[#8A2BE2] hover:text-[#a855f7] transition-colors"
                    >
                      + Upload Track
                    </Link>
                  </div>

                  <div className="overflow-x-auto mt-4 no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="bg-[#192134] border-b border-[#232B3E] text-[#CACACA] text-xs sm:text-sm font-bold font-['Space_Grotesk',sans-serif]">
                          <th className="py-3 px-3 sm:px-4 rounded-l-lg">Track</th>
                          <th className="py-3 px-3 sm:px-4">Category</th>
                          <th className="py-3 px-3 sm:px-4 text-right">Streams</th>
                          <th className="py-3 px-3 sm:px-4 text-right">Earnings</th>
                          <th className="py-3 px-3 sm:px-4 text-center rounded-r-lg">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#192134]">
                        {filteredTracks.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-sm font-['Space_Grotesk',sans-serif] text-[#CACACA]/70">
                              No tracks uploaded yet.
                            </td>
                          </tr>
                        ) : (
                          filteredTracks.map((track) => (
                            <tr key={track.id} className="bg-[#232B3E] hover:bg-[#2c364e] transition-colors">
                              
                              {/* Track Title + Cover */}
                              <td className="py-3 px-3 sm:px-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-[#192134] flex items-center justify-center shadow-sm">
                                  {track.cover_url ? (
                                    <img
                                      src={track.cover_url}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Music size={18} className="text-[#8A2BE2]/60" />
                                  )}
                                </div>
                                <span className="text-xs sm:text-sm font-normal font-['Space_Grotesk',sans-serif] text-white truncate max-w-[150px] sm:max-w-[200px]">
                                  {track.title}
                                </span>
                              </td>

                              {/* Category */}
                              <td className="py-3 px-3 sm:px-4">
                                <span className="bg-[rgba(15,23,42,0.5)] text-[#CACACA] text-[11px] sm:text-xs font-['Space_Grotesk',sans-serif] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">
                                  {track.category}
                                </span>
                              </td>

                              {/* Streams */}
                              <td className="py-3 px-3 sm:px-4 text-right text-xs sm:text-sm font-normal font-['Space_Grotesk',sans-serif] text-white">
                                {track.streams.toLocaleString()}
                              </td>

                              {/* Earnings */}
                              <td className="py-3 px-3 sm:px-4 text-right text-xs sm:text-sm font-normal font-['Space_Grotesk',sans-serif] text-white">
                                ${track.earnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>

                              {/* Status */}
                              <td className="py-3 px-3 sm:px-4 text-center">
                                {getStatusBadge(track.status)}
                              </td>

                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Top Tracks Widget (1 Column on Desktop) */}
              <div className="bg-[#0F172A] rounded-xl p-4 sm:p-6 border border-[#232B3E]/40 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold font-['Clash_Display',sans-serif] text-white pb-3 sm:pb-4 border-b border-[#232B3E]">
                    Top Tracks
                  </h2>

                  <div className="space-y-4 mt-4">
                    {topTracks.length === 0 ? (
                      <div className="py-8 text-center text-xs sm:text-sm font-['Space_Grotesk',sans-serif] text-[#CACACA]/70">
                        No track streaming data yet.
                      </div>
                    ) : (
                      topTracks.map((trk, idx) => (
                        <div key={trk.id} className="flex items-center justify-between p-3 bg-[#192134] rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold font-['Clash_Display',sans-serif] text-[#CACACA] w-4">
                              #{idx + 1}
                            </span>
                            <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-[#0F172A] flex items-center justify-center">
                              {trk.cover_url ? (
                                <img src={trk.cover_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Music size={16} className="text-[#8A2BE2]/60" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-bold font-['Space_Grotesk',sans-serif] text-white truncate max-w-[120px]">
                                {trk.title}
                              </p>
                              <p className="text-[10px] text-[#CACACA]">
                                {trk.category}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold font-['Space_Grotesk',sans-serif] text-white">
                              {trk.streams.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-[#00FF88]">Plays</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <Link
                  href="/dashboard/upload/mint"
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-[#8A2BE2] hover:bg-[#7823c9] text-white py-3 rounded-lg text-xs sm:text-sm font-bold font-['Space_Grotesk',sans-serif] shadow-[0_0_20px_rgba(138,43,226,0.3)] transition-all cursor-pointer"
                >
                  <Upload size={16} />
                  Upload &amp; Mint Track
                </Link>
              </div>

            </div>

            {/* ===================================================================== */}
            {/* FOOTER                                                                */}
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

          </div>
        </main>
      </div>

      <MusicPlayer />
    </div>
  );
}
