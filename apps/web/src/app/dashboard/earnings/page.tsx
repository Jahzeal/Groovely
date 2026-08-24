'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { 
  Search, 
  Bell, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown,
  Wallet, 
  MoreVertical, 
  Menu,
  X,
  Disc,
  Send,
  Loader2
} from 'lucide-react';
import { Twitter, Instagram } from '@/components/ui/SocialIcons';
import { apiFetch, resolveIpfsUrl } from '@/lib/api';
import { MusicPlayer } from '@/components/marketplace/MusicPlayer';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';

interface TransactionItem {
  id: string | number;
  type: string;
  content: string;
  amount: number | string;
  date: string;
  status: 'Live' | 'Draft' | 'Failed' | 'Completed' | 'Pending';
  image?: string;
}

export default function EarningsPage() {
  const router = useRouter();
  const { user } = usePrivy();
  const { address } = useAccount();

  const [activeChartTab, setActiveChartTab] = useState<'Licenses' | 'Sales'>('Licenses');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [loading, setLoading] = useState(true);

  const [earningsTotal, setEarningsTotal] = useState<number>(1032.60);
  const [earningsChange, setEarningsChange] = useState<number>(10.5);

  const [transactions, setTransactions] = useState<TransactionItem[]>([
    {
      id: 1,
      type: 'License Purchase for “Slow Lights on Third Street”',
      content: 'Music',
      amount: 994,
      date: '15 May 2020 8:30 am',
      status: 'Live',
      image: 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?auto=format&fit=crop&w=150&q=80',
    },
    {
      id: 2,
      type: 'NFT Sale of “Midnight Bounce”',
      content: 'Beat',
      amount: 426,
      date: '15 May 2020 9:00 am',
      status: 'Draft',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=150&q=80',
    },
    {
      id: 3,
      type: 'Withdrawal of $500',
      content: 'Podcast',
      amount: 877,
      date: '15 May 2020 9:30 am',
      status: 'Live',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=150&q=80',
    },
    {
      id: 4,
      type: 'NFT Sale of “After the Noise”',
      content: 'Music',
      amount: 883,
      date: '15 May 2020 8:00 am',
      status: 'Failed',
      image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=150&q=80',
    },
    {
      id: 5,
      type: 'License Purchase for “No Wahala, Just Vibes”',
      content: 'Skit',
      amount: 740,
      date: '15 May 2020 8:30 am',
      status: 'Live',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=150&q=80',
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
        const [statsRes, txRes] = await Promise.all([
          apiFetch('/api/creator/dashboard/stats'),
          apiFetch('/api/creator/dashboard/transactions'),
        ]);

        if (statsRes?.ok) {
          const statsJson = await statsRes.json();
          const s = statsJson.data || statsJson;
          if (s.earnings?.total !== undefined) {
            setEarningsTotal(Number(s.earnings.total));
          }
          if (s.earnings?.change !== undefined) {
            setEarningsChange(Number(s.earnings.change));
          }
        }

        if (txRes?.ok) {
          const txJson = await txRes.json();
          const list = txJson.data?.transactions || txJson.transactions || [];
          if (Array.isArray(list) && list.length > 0) {
            const mapped: TransactionItem[] = list.map((item: any, idx: number) => ({
              id: item.id || idx,
              type: item.title ? `${item.type || 'NFT Sale of'} “${item.title}”` : (item.type || 'Transaction'),
              content: item.content || 'Music',
              amount: item.amount || 0,
              date: item.date ? new Date(item.date).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }) : 'Recent',
              status: (item.status === 'Completed' || item.status === 'Live') ? 'Live' : (item.status === 'Pending' ? 'Draft' : 'Failed'),
              image: resolveIpfsUrl(item.image) || 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?auto=format&fit=crop&w=150&q=80'
            }));
            setTransactions(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to load earnings data:', err);
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
      case 'Completed':
        return (
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-['Space_Grotesk',sans-serif] font-normal bg-[rgba(0,255,136,0.1)] text-[#00FF88]">
            Live
          </span>
        );
      case 'Draft':
      case 'Pending':
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
      default:
        return (
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-['Space_Grotesk',sans-serif] bg-white/5 text-zinc-400">
            {status}
          </span>
        );
    }
  };

  const filteredTransactions = transactions.filter(t =>
    t.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#192134] text-white font-sans selection:bg-[#8A2BE2] selection:text-white">
      {/* Universal Drawer Sidebar */}
      <Sidebar activePage="earnings" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#192134]">
        
        {/* ========================================================================= */}
        {/* MOBILE TOP BAR (Figma Frame 315) - Visible on < md                         */}
        {/* ========================================================================= */}
        <div className="md:hidden flex flex-col bg-white/[0.01] border-b border-[#2D3548] backdrop-blur-[50px] sticky top-0 z-30 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left (Frame 304): Hamburger + "Earnings" Title */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMobileSidebar}
                className="p-1 text-white hover:opacity-80 transition-opacity cursor-pointer"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-bold font-['Clash_Display',sans-serif] text-white tracking-tight">
                Earnings
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
                placeholder="Search transactions..."
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
              Earnings
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
            {/* TOP METRIC CARD (Mobile: 408x204px / Desktop: 1192x228px)             */}
            {/* ===================================================================== */}
            <div className="bg-[#0F172A] rounded-xl p-4 sm:p-6 flex flex-col justify-between min-h-[204px] sm:h-[228px] border border-[#232B3E]/40 hover:border-[#8A2BE2]/40 transition-colors">
              
              {/* Card Top: Icon + More button */}
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#192134] flex items-center justify-center text-[#697184]">
                  <Wallet size={28} className="sm:w-8 sm:h-8" />
                </div>
                <button className="text-[#CACACA] hover:text-white transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>

              {/* Card Content & Action Row (Frame 203) */}
              <div>
                <p className="text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-[#CACACA] mb-1">
                  Earnings
                </p>

                <div className="flex items-center justify-between gap-3 sm:gap-4">
                  {/* Big Amount + Badge (Frame 202) */}
                  <div>
                    <p className="text-2xl sm:text-4xl font-bold font-['Clash_Display',sans-serif] text-white">
                      ${earningsTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                      <span className="text-[11px] sm:text-xs font-bold font-['Space_Grotesk',sans-serif] text-[#CACACA]">This Month</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-['Space_Grotesk',sans-serif] bg-[rgba(0,255,136,0.1)] text-[#40FFA6]">
                        +{earningsChange}%
                      </span>
                    </div>
                  </div>

                  {/* Action CTA: Withdraw (Mobile Frame 201: 138x56px) */}
                  <button
                    onClick={() => router.push('/dashboard/settings')}
                    className="inline-flex items-center justify-center bg-[#8A2BE2] hover:bg-[#7823c9] text-white px-5 sm:px-8 py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] shadow-[0_0_15px_rgba(138,43,226,0.3)] transition-all cursor-pointer"
                  >
                    Withdraw
                  </button>
                </div>
              </div>

            </div>

            {/* ===================================================================== */}
            {/* PERFORMANCE CHART SECTION (Mobile: 408x474px / Desktop: 1192x428px)   */}
            {/* ===================================================================== */}
            <div className="bg-[#0F172A] rounded-xl p-4 sm:p-6 border border-[#232B3E]/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-lg sm:text-xl font-bold font-['Clash_Display',sans-serif] text-white">
                  Performance Chart
                </h2>

                <div className="flex items-center gap-3">
                  {(['Licenses', 'Sales'] as const).map((tab) => {
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

              {/* Line Chart Canvas (Frame 195) */}
              <div className="bg-[#192134] rounded-xl p-3 sm:p-6 h-[260px] sm:h-[332px] flex flex-col justify-between relative overflow-hidden">
                <div className="relative flex-1 w-full flex items-end">
                  <svg className="w-full h-[85%] overflow-visible" viewBox="0 0 1000 200" preserveAspectRatio="none">
                    <line x1="0" y1="0" x2="1000" y2="0" stroke="#2D3548" strokeDasharray="3 3" strokeWidth="1" />
                    <line x1="0" y1="50" x2="1000" y2="50" stroke="#2D3548" strokeDasharray="3 3" strokeWidth="1" />
                    <line x1="0" y1="100" x2="1000" y2="100" stroke="#2D3548" strokeDasharray="3 3" strokeWidth="1" />
                    <line x1="0" y1="150" x2="1000" y2="150" stroke="#2D3548" strokeDasharray="3 3" strokeWidth="1" />
                    <line x1="0" y1="200" x2="1000" y2="200" stroke="#2D3548" strokeWidth="1" />

                    <defs>
                      <linearGradient id="earningsChartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8A2BE2" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#8A2BE2" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    <path
                      d="M 0 160 Q 80 120, 160 140 T 320 80 T 480 50 T 640 100 T 800 30 T 1000 70 L 1000 200 L 0 200 Z"
                      fill="url(#earningsChartGrad)"
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

                {/* X-Axis labels with slight rotation on mobile */}
                <div className="flex justify-between pl-6 sm:pl-8 pr-1 sm:pr-2 pt-2 border-t border-[#232B3E] text-[8px] sm:text-[10px] font-['Inter',sans-serif] text-[#A3A3A3]">
                  {chartPointsMobile.map(p => (
                    <span key={p.label}>{p.label}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* TRACKS SUMMARY / TRANSACTIONS TABLE (Mobile Frame 308)                */}
            {/* ===================================================================== */}
            <div className="bg-[#0F172A] rounded-xl p-4 sm:p-6 border border-[#232B3E]/40">
              
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#232B3E]">
                <h2 className="text-lg sm:text-xl font-bold font-['Clash_Display',sans-serif] text-white">
                  Tracks Summary
                </h2>
              </div>

              {/* Responsive Scrollable Container (Figma Frame 308) */}
              <div className="overflow-x-auto mt-4 no-scrollbar">
                <table className="w-full text-left border-collapse min-w-[650px] sm:min-w-[750px]">
                  <thead>
                    <tr className="bg-[#192134] border-b border-[#232B3E] text-[#CACACA] text-xs sm:text-sm font-bold font-['Space_Grotesk',sans-serif]">
                      <th className="py-3 px-3 sm:px-4 rounded-l-lg">Type</th>
                      <th className="py-3 px-3 sm:px-4">Content</th>
                      <th className="py-3 px-3 sm:px-4 text-right">Amount</th>
                      <th className="py-3 px-3 sm:px-4 text-right">Date</th>
                      <th className="py-3 px-3 sm:px-4 text-center rounded-r-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#192134]">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="bg-[#232B3E] hover:bg-[#2c364e] transition-colors">
                        
                        {/* Type Column: Thumbnail + Description */}
                        <td className="py-3 px-3 sm:px-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-[#192134] shadow-sm">
                            <img
                              src={tx.image || 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?auto=format&fit=crop&w=150&q=80'}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-xs sm:text-sm font-normal font-['Space_Grotesk',sans-serif] text-white truncate max-w-[220px] sm:max-w-md">
                            {tx.type}
                          </span>
                        </td>

                        {/* Content Column: Pill */}
                        <td className="py-3 px-3 sm:px-4">
                          <span className="bg-[rgba(15,23,42,0.5)] text-[#CACACA] text-[11px] sm:text-xs font-['Space_Grotesk',sans-serif] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">
                            {tx.content}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-3 sm:px-4 text-right text-xs sm:text-sm font-normal font-['Space_Grotesk',sans-serif] text-white">
                          ${typeof tx.amount === 'number' ? tx.amount.toLocaleString() : tx.amount}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-3 sm:px-4 text-right text-[11px] sm:text-sm font-normal font-['Space_Grotesk',sans-serif] text-[#CACACA] whitespace-nowrap">
                          {tx.date}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 sm:px-4 text-center">
                          {getStatusBadge(tx.status)}
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
