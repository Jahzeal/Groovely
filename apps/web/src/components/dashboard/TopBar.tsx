'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, Search, ShoppingCart, ChevronDown,
  Copy, LogOut, User, Settings, CheckCheck, ExternalLink
} from 'lucide-react';
import { handleLogout } from '@/lib/api';

export const TopBar = () => {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWalletAddress(localStorage.getItem('groovely_wallet'));
      // Decode role from JWT token
      try {
        const token = localStorage.getItem('groovely_token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setRole(payload.role ?? null);
        }
      } catch { }
    }
  }, []);

  // Close dropdown on outside click
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

  const handleDisconnect = () => {
    handleLogout();
  };

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="flex items-center justify-between px-10 py-6 bg-[#050510] border-b border-white/5">
      <div className="flex items-center gap-8 flex-1">
        <button className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
          <ChevronLeft size={18} strokeWidth={3} />
          <span>Back</span>
        </button>

        <div className="relative w-full max-w-md group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-white transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full bg-[#0F0F1A] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-accent-purple/50 transition-all placeholder-zinc-600"
          />
        </div>

        <nav className="hidden md:flex items-center gap-6 ml-4">
          <Link href="/dashboard/rooms" className="text-sm font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
            Listening Room
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-zinc-500 hover:text-white transition-colors relative">
          <ShoppingCart size={22} strokeWidth={2.5} />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent-purple rounded-full shadow-[0_0_8px_rgba(157,0,255,0.6)]" />
        </button>

        {/* Wallet Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="wallet-dropdown-trigger"
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-3 bg-[#0F0F1A] border border-white/5 rounded-xl px-4 py-2 hover:bg-white/5 cursor-pointer transition-all"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="Wallet" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">
                {role ?? 'wallet'}
              </span>
              <span className="text-sm font-black tracking-tight text-white/90">{abbrev}</span>
            </div>
            <ChevronDown
              size={14}
              className={`text-zinc-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Panel */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-[#0F0F1A] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-[#1A1A2E]">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="Wallet" className="w-full h-full object-contain p-1" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-accent-purple mb-0.5">{role ?? 'Connected'}</p>
                    <p className="text-sm font-bold text-white font-mono">{abbrev}</p>
                  </div>
                  {/* Connected badge */}
                  <div className="ml-auto flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
                  </div>
                </div>

                {/* Full address */}
                <div className="mt-3 bg-black/30 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                  <p className="text-[10px] text-zinc-500 font-mono truncate flex-1">
                    {walletAddress ?? 'Not connected'}
                  </p>
                  <button
                    onClick={handleCopy}
                    className="text-zinc-500 hover:text-white transition-colors shrink-0"
                    title="Copy address"
                  >
                    {copied ? <CheckCheck size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
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
                  onClick={handleDisconnect}
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

