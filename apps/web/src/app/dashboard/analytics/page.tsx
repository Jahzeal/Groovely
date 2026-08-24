'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { 
  Search, 
  Bell, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown,
  Radio, 
  Wallet, 
  UploadCloud, 
  Play, 
  Pause, 
  MoreVertical, 
  Plus, 
  Menu,
  X,
  Disc,
  Send,
  Loader2
} from 'lucide-react';
import { Twitter, Instagram } from '@/components/ui/SocialIcons';
import { apiFetch, resolveIpfsUrl } from '@/lib/api';
import { useMusicPlayer } from '@/components/marketplace/MusicPlayerContext';
import { MusicPlayer } from '@/components/marketplace/MusicPlayer';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import Link from 'next/link';

interface TrackItem {
  id: number;
  title: string;
  cover_url?: string;
  audio_url?: string;
  category: string;
  streams: number;
  earnings: number;
  status: 'Live' | 'Draft' | 'Failed' | 'Minting';
}

export default function AnalyticsPage() {
  const { user } = usePrivy();
  const { address } = useAccount();
  const { playTrack } = useMusicPlayer();

  const [activeChartTab, setActiveChartTab] = useState<'Plays' | '$ Earnings' | 'Listeners'>('Plays');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    streams: 1230,
    streamsChange: 15,
    earnings: 1032.60,
    earningsChange: 10.5,
    uploads: 10,
    uploadsChange: -0.5,
  });

  const [tracks, setTracks] = useState<TrackItem[]>([
    {
      id: 1,
      title: 'Slow Lights on Third Street',
      cover_url: 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?auto=format&fit=crop&w=150&q=80',
      category: 'Music',
      streams: 5000,
      earnings: 234.01,
      status: 'Live',
    },
    {
      id: 2,
      title: 'Midnight Bounce',
      cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=150&q=80',
      category: 'Beat',
      streams: 0,
      earnings: 0,
      status: 'Draft',
    },
    {
      id: 3,
      title: 'Late Nights, Loose Thoughts — Ep. 01',
      cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80',
      category: 'Podcast',
      streams: 40000,
      earnings: 1000.01,
      status: 'Live',
    },
    {
      id: 4,
      title: 'After the Noise',
      cover_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=150&q=80',
      category: 'Music',
      streams: 0,
      earnings: 0,
      status: 'Failed',
    },
    {
      id: 5,
      title: 'No Wahala, Just Vibes',
      cover_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=150&q=80',
      category: 'Skit',
      streams: 0,
      earnings: 0,
      status: 'Minting',
    },
  ]);

  const activeAddress = address || user?.wallet?.address;
  const abbrev = activeAddress
    ? `${activeAddress.slice(0, 5)}...${activeAddress.slice(-3)}`
    : '0xc...y69';

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
          setStats((prev) => ({
            ...prev,
            streams: s.streams?.total ?? prev.streams,
            streamsChange: s.streams?.change ?? prev.streamsChange,
            earnings: s.earnings?.total ?? prev.earnings,
            earningsChange: s.earnings?.change ?? prev.earningsChange,
            uploads: s.uploads?.total ?? prev.uploads,
            uploadsChange: s.uploads?.change ?? prev.uploadsChange,
          }));
        }

        if (tracksRes?.ok) {
          const trkJson = await tracksRes.json();
          const list = trkJson.data?.tracks || trkJson.tracks || [];
          if (Array.isArray(list) && list.length > 0) {
            setTracks(list);
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
      case 'Failed':
        return (
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-['Space_Grotesk',sans-serif] font-normal bg-[rgba(255,0,68,0.1)] text-[#FF0044]">
            Failed
          </span>
        );
      case 'Minting':
        return (
          <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-['Space_Grotesk',sans-serif] bg-[#697184] text-[#0F172A] font-bold">
            <Loader2 size={12} className="animate-spin" />
            Minting
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

  return (
    <div className="flex h-screen overflow-hidden bg-[#192134] text-white font-sans selection:bg-[#8A2BE2] selection:text-white">
      {/* Universal Drawer Sidebar */}
      <Sidebar activePage="analytics" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#192134]">
        
        {/* ========================================================================= */}
        {/* MOBILE TOP BAR (Figma Frame 315) - Visible on < md                         */}
        {/* ========================================================================= */}
        <div className="md:hidden flex flex-col bg-white/[0.01] border-b border-[#2D3548] backdrop-blur-[50px] sticky top-0 z-30 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Hamburger + "Analytics" Title */}
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

            {/* Right: Search + Notification + Wallet Symbol & Arrow */}
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

              <div className="flex items-center gap-1 bg-[#0F172A] border border-[#2D3548] rounded-full px-2 py-1">
                <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-[#FF5C16]/10 p-0.5">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                    alt="Wallet"
                    className="w-full h-full object-contain"
                  />
                </div>
                <ChevronDown size={14} className="text-white/70" />
              </div>
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
                placeholder="Search tracks or content..."
                autoFocus
                className="w-full bg-[#0F172A] border border-[#2D3548] rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-[#8A2BE2]"
              />
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP TOP BAR (Figma Frame 25) - Visible on md+                         */}
        {/* ========================================================================= */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 h-20 bg-[#0F172A]/10 border-b border-[#232B3E] backdrop-blur-[25px] sticky top-0 z-30">
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

            <div className="flex items-center gap-2 bg-transparent px-2 py-1 rounded-lg">
              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-[#FF5C16]/10 p-0.5">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                  alt="Wallet"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                {abbrev}
              </span>
            </div>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* MAIN SCROLLABLE CONTENT                                                   */}
        {/* ========================================================================= */}
        <main className="flex-1 overflow-y-auto pb-28 px-4 sm:px-8 md:px-10 pt-4 md:pt-8 bg-[#192134]">
          <div className="max-w-[1200px] mx-auto space-y-4 sm:space-y-6">

            {/* ===================================================================== */}
            {/* TOP 3 METRIC CARDS ROW (Figma Frame 200: Streams, Earnings, Uploads)   */}
            {/* ===================================================================== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Streams Card */}
              <div className="bg-[#0F172A] rounded-xl p-4 sm:p-6 flex flex-col justify-between min-h-[204px] sm:h-[228px] border border-[#232B3E]/40 hover:border-[#8A2BE2]/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#192134] flex items-center justify-center text-[#697184]">
                    <Radio size={28} className="sm:w-8 sm:h-8" />
                  </div>
                  <button className="text-[#CACACA] hover:text-white transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div>
                  <p className="text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-[#CACACA]">Streams</p>
                  <p className="text-2xl sm:text-4xl font-bold font-['Clash_Display',sans-serif] text-white my-1">
                    {Number(stats.streams).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] sm:text-xs font-bold font-['Space_Grotesk',sans-serif] text-[#CACACA]">This Month</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-['Space_Grotesk',sans-serif] bg-[rgba(0,255,136,0.1)] text-[#40FFA6]">
                      +{stats.streamsChange}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Earnings Card */}
              <div className="bg-[#0F172A] rounded-xl p-4 sm:p-6 flex flex-col justify-between min-h-[204px] sm:h-[228px] border border-[#232B3E]/40 hover:border-[#8A2BE2]/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#192134] flex items-center justify-center text-[#697184]">
                    <Wallet size={28} className="sm:w-8 sm:h-8" />
                  </div>
                  <button className="text-[#CACACA] hover:text-white transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div>
                  <p className="text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-[#CACACA]">Earnings</p>
                  <p className="text-2xl sm:text-4xl font-bold font-['Clash_Display',sans-serif] text-white my-1">
                    ${Number(stats.earnings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] sm:text-xs font-bold font-['Space_Grotesk',sans-serif] text-[#CACACA]">This Month</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-['Space_Grotesk',sans-serif] bg-[rgba(0,255,136,0.1)] text-[#40FFA6]">
                      +{stats.earningsChange}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Uploads Card */}
              <div className="bg-[#0F172A] rounded-xl p-4 sm:p-6 flex flex-col justify-between min-h-[204px] sm:h-[228px] border border-[#232B3E]/40 hover:border-[#8A2BE2]/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#192134] flex items-center justify-center text-[#697184]">
                    <UploadCloud size={28} className="sm:w-8 sm:h-8" />
                  </div>
                  <button className="text-[#CACACA] hover:text-white transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div>
                  <p className="text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-[#CACACA]">Uploads</p>
                  <p className="text-2xl sm:text-4xl font-bold font-['Clash_Display',sans-serif] text-white my-1">
                    {stats.uploads}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] sm:text-xs font-bold font-['Space_Grotesk',sans-serif] text-[#CACACA]">This Month</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-['Space_Grotesk',sans-serif] bg-[rgba(255,51,102,0.1)] text-[#FA003E]">
                      {stats.uploadsChange}%
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* ===================================================================== */}
            {/* PERFORMANCE CHART SECTION (Figma Frame 195)                           */}
            {/* ===================================================================== */}
            <div className="bg-[#0F172A] rounded-xl p-4 sm:p-6 border border-[#232B3E]/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-lg sm:text-xl font-bold font-['Clash_Display',sans-serif] text-white">
                  Performance Chart
                </h2>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {(['Plays', '$ Earnings', 'Listeners'] as const).map((tab) => {
                    const isActive = activeChartTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveChartTab(tab)}
                        className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold font-['Space_Grotesk',sans-serif] transition-all cursor-pointer ${
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

              {/* Chart Canvas Box */}
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

                <div className="flex justify-between pl-6 sm:pl-8 pr-1 sm:pr-2 pt-2 border-t border-[#232B3E] text-[8px] sm:text-[10px] font-['Inter',sans-serif] text-[#A3A3A3]">
                  {chartPointsMobile.map(p => (
                    <span key={p.label}>{p.label}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* TRACKS PERFORMANCE TABLE SECTION (Figma Table top: 816px)            */}
            {/* ===================================================================== */}
            <div className="bg-[#0F172A] rounded-xl p-4 sm:p-6 border border-[#232B3E]/40">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-[#232B3E]">
                <h2 className="text-lg sm:text-xl font-bold font-['Clash_Display',sans-serif] text-white">
                  Tracks Performance
                </h2>

                <Link
                  href="/dashboard/upload"
                  className="inline-flex items-center justify-center gap-2 bg-[#8A2BE2] hover:bg-[#7823c9] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold font-['Space_Grotesk',sans-serif] shadow-[0_0_15px_rgba(138,43,226,0.3)] transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Plus size={16} />
                  <span>Upload & Mint</span>
                </Link>
              </div>

              <div className="overflow-x-auto mt-4 no-scrollbar">
                <table className="w-full text-left border-collapse min-w-[650px] sm:min-w-[750px]">
                  <thead>
                    <tr className="bg-[#192134] border-b border-[#232B3E] text-[#CACACA] text-xs sm:text-sm font-bold font-['Space_Grotesk',sans-serif]">
                      <th className="py-3 px-3 sm:px-4 rounded-l-lg">Track</th>
                      <th className="py-3 px-3 sm:px-4">Content</th>
                      <th className="py-3 px-3 sm:px-4 text-right">Streams</th>
                      <th className="py-3 px-3 sm:px-4 text-right">Earnings</th>
                      <th className="py-3 px-3 sm:px-4 text-center">Status</th>
                      <th className="py-3 px-3 sm:px-4 text-center rounded-r-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#192134]">
                    {filteredTracks.map((t) => (
                      <tr key={t.id} className="bg-[#232B3E] hover:bg-[#2c364e] transition-colors">
                        
                        {/* Track Thumbnail + Title */}
                        <td className="py-3 px-3 sm:px-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-[#192134] shadow-sm">
                            <img
                              src={resolveIpfsUrl(t.cover_url) || 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?auto=format&fit=crop&w=150&q=80'}
                              alt={t.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-xs sm:text-sm font-bold font-['Space_Grotesk',sans-serif] text-white truncate max-w-[180px] sm:max-w-xs">
                            {t.title}
                          </span>
                        </td>

                        {/* Content Pill */}
                        <td className="py-3 px-3 sm:px-4">
                          <span className="bg-[rgba(15,23,42,0.5)] text-[#CACACA] text-[11px] sm:text-xs font-['Space_Grotesk',sans-serif] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">
                            {t.category}
                          </span>
                        </td>

                        {/* Streams */}
                        <td className="py-3 px-3 sm:px-4 text-right text-xs sm:text-sm font-normal font-['Space_Grotesk',sans-serif] text-white">
                          {t.streams.toLocaleString()}
                        </td>

                        {/* Earnings */}
                        <td className="py-3 px-3 sm:px-4 text-right text-xs sm:text-sm font-normal font-['Space_Grotesk',sans-serif] text-white">
                          ${t.earnings === 0 ? '0' : t.earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-3 sm:px-4 text-center">
                          {getStatusBadge(t.status)}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 sm:px-4 text-center">
                          <div className="flex items-center justify-center gap-1 sm:gap-2">
                            <button
                              onClick={() =>
                                playTrack({
                                  id: t.id,
                                  title: t.title,
                                  artist: 'You',
                                  image: resolveIpfsUrl(t.cover_url) || '',
                                  audioUrl: resolveIpfsUrl(t.audio_url),
                                })
                              }
                              className="p-1 text-zinc-400 hover:text-white transition-colors"
                              title="Play"
                            >
                              <Play size={15} />
                            </button>
                            <button className="p-1 text-zinc-400 hover:text-white transition-colors">
                              <MoreVertical size={15} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination */}
              <div className="flex items-center justify-center gap-4 mt-4 pt-3 text-xs sm:text-sm font-['Space_Grotesk',sans-serif] text-[#CACACA]">
                <span>Page 1 of 2</span>
                <button className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>
                <button className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* TOP TRACKS SECTION (Figma Frame 196, 197, 198)                        */}
            {/* ===================================================================== */}
            <div className="bg-[#0F172A] rounded-xl p-4 sm:p-6 border border-[#232B3E]/40">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold font-['Clash_Display',sans-serif] text-white">
                  Top Tracks
                </h2>
              </div>

              <div className="bg-[#192134] rounded-xl p-3 sm:p-4 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                
                {/* Most Streams */}
                <div className="bg-[#0F172A] rounded-lg p-3 flex items-center gap-3 border border-[#232B3E]/40">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded overflow-hidden shrink-0 bg-[#192134]">
                    <img
                      src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80"
                      alt="Top stream"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold font-['Space_Grotesk',sans-serif] text-white truncate">
                      Late Nights, Loose Thoughts — Ep. 01
                    </p>
                    <span className="inline-block bg-[#192134] text-white text-[10px] sm:text-[11px] font-['Space_Grotesk',sans-serif] px-2.5 py-0.5 rounded-full mt-1">
                      Most Streams
                    </span>
                  </div>
                </div>

                {/* Most Earnings */}
                <div className="bg-[#0F172A] rounded-lg p-3 flex items-center gap-3 border border-[#232B3E]/40">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded overflow-hidden shrink-0 bg-[#192134]">
                    <img
                      src="https://images.unsplash.com/photo-1514525253361-bee8d48800d5?auto=format&fit=crop&w=150&q=80"
                      alt="Top earning"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold font-['Space_Grotesk',sans-serif] text-white truncate">
                      Late Nights, Loose Thoughts — Ep. 01
                    </p>
                    <span className="inline-block bg-[#192134] text-white text-[10px] sm:text-[11px] font-['Space_Grotesk',sans-serif] px-2.5 py-0.5 rounded-full mt-1">
                      Most Earnings
                    </span>
                  </div>
                </div>

                {/* Best Track */}
                <div className="bg-[#0F172A] rounded-lg p-3 flex items-center gap-3 border border-[#232B3E]/40">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded overflow-hidden shrink-0 bg-[#192134]">
                    <img
                      src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=150&q=80"
                      alt="Best track"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold font-['Space_Grotesk',sans-serif] text-white truncate">
                      Late Nights, Loose Thoughts — Ep. 01
                    </p>
                    <span className="inline-block bg-[#192134] text-white text-[10px] sm:text-[11px] font-['Space_Grotesk',sans-serif] px-2.5 py-0.5 rounded-full mt-1">
                      Best Track
                    </span>
                  </div>
                </div>

              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-4 mt-4 text-xs sm:text-sm font-['Space_Grotesk',sans-serif] text-[#CACACA]">
                <span>Page 1 of 2</span>
                <button className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>
                <button className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
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

          </div>
        </main>
      </div>

      <MusicPlayer />
    </div>
  );
}
