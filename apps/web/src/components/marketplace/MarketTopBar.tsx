import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Bell, ShoppingCart, Copy, LogOut, User, Settings, CheckCheck, ExternalLink } from 'lucide-react';
import { useCart } from './CartContext';
import { handleLogout } from '@/lib/api';
import Link from 'next/link';

export const MarketTopBar = () => {
  const [sortOpen, setSortOpen] = useState(false);
  const [sortLabel, setSortLabel] = useState('Sort By');
  const { openCart } = useCart();
  
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWalletAddress(localStorage.getItem('groovely_wallet'));
    try {
      const token = localStorage.getItem('groovely_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setRole(payload.role ?? null);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const abbrev = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : '0x...';

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sortOptions = ['Most Popular', 'Newest', 'Price: Low to High', 'Price: High to Low', 'Trending'];

  return (
    <header className="flex items-center justify-between px-10 py-5 bg-[#050510]/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
      {/* Search + Sort */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-accent-purple transition-colors">
            <Search size={17} />
          </div>
          <input
            type="text"
            placeholder="Search beats, podcasts, samples..."
            className="w-full bg-[#0F0F1A] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-accent-purple/50 transition-all placeholder-zinc-600"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 bg-[#0F0F1A] border border-white/5 rounded-xl px-5 py-3 text-sm font-bold text-zinc-400 hover:text-white hover:border-white/10 transition-all whitespace-nowrap"
          >
            {sortLabel}
            <ChevronDown size={14} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
          </button>
          {sortOpen && (
            <div className="absolute top-full mt-2 right-0 w-52 bg-[#0F0F1A] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
              {sortOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setSortLabel(opt); setSortOpen(false); }}
                  className="w-full text-left px-5 py-3 text-sm font-medium text-zinc-400 hover:bg-accent-purple/10 hover:text-white transition-all"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-5 ml-8">
        <button className="text-zinc-500 hover:text-white transition-colors relative">
          <Bell size={21} strokeWidth={2} />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent-purple rounded-full shadow-[0_0_8px_rgba(157,0,255,0.7)]" />
        </button>

        <button 
          onClick={openCart}
          className="text-zinc-500 hover:text-white transition-colors relative"
        >
          <ShoppingCart size={21} strokeWidth={2} />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent-purple rounded-full shadow-[0_0_8px_rgba(157,0,255,0.7)]" />
        </button>

        {/* Wallet Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-3 bg-[#0F0F1A] border border-white/5 rounded-xl px-4 py-2 hover:bg-white/5 cursor-pointer transition-all"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="Wallet" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col items-start leading-none text-left">
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">
                {role ?? 'wallet'}
              </span>
              <span className="text-sm font-black tracking-tight text-white/90">{abbrev}</span>
            </div>
            <ChevronDown
              size={13}
              className={`text-zinc-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Panel */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-[#0F0F1A] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-[#1A1A2E]">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="Wallet" className="w-full h-full object-contain p-1" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-accent-purple mb-0.5">{role ?? 'Connected'}</p>
                    <p className="text-sm font-bold text-white font-mono">{abbrev}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
                  </div>
                </div>

                <div className="mt-3 bg-black/30 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                  <p className="text-[10px] text-zinc-500 font-mono truncate flex-1">
                    {walletAddress ?? 'Not connected'}
                  </p>
                  <button
                    onClick={handleCopy}
                    className="text-zinc-500 hover:text-white transition-colors shrink-0"
                  >
                    {copied ? <CheckCheck size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2 text-left">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <User size={16} />
                  View Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Settings size={16} />
                  Settings
                </Link>
                <a
                  href={walletAddress ? `https://polygonscan.com/address/${walletAddress}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <ExternalLink size={16} />
                  View on Explorer
                </a>

                <div className="h-px bg-white/5 mx-5 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={16} />
                  Disconnect Wallet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
