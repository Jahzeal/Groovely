'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, Search, ShoppingCart, ChevronDown,
  Copy, LogOut, User, Settings, CheckCheck, ExternalLink, Menu, Bell
} from 'lucide-react';
import { handleLogout, apiFetch } from '@/lib/api';
import { usePrivy, useLogout } from '@privy-io/react-auth';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { USDC_ADDRESS } from '@/lib/contracts';
import { formatUnits } from 'viem';

export const TopBar = ({ displayName = 'Creator' }: { displayName?: string }) => {
  const router = useRouter();
  const { user } = usePrivy();
  const { logout } = useLogout();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedWallet = localStorage.getItem('groovely_wallet') || localStorage.getItem('grooveli_wallet');
      if (storedWallet) {
        setWalletAddress(storedWallet);
      } else if (user?.wallet?.address) {
        setWalletAddress(user.wallet.address);
        localStorage.setItem('groovely_wallet', user.wallet.address);
        localStorage.setItem('grooveli_wallet', user.wallet.address);
      }

      // Decode role and wallet from JWT token
      try {
        const token = localStorage.getItem('groovely_token') || localStorage.getItem('grooveli_token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setRole(payload.role ?? null);
          if (payload.wallet && !storedWallet) {
            setWalletAddress(payload.wallet);
            localStorage.setItem('groovely_wallet', payload.wallet);
            localStorage.setItem('grooveli_wallet', payload.wallet);
          }
        }

        if (token && !storedWallet && !user?.wallet?.address) {
          apiFetch('/api/users/me', { skipAuthRedirect: true })
            .then(res => res && res.ok ? res.json() : null)
            .then(data => {
              const fetchedUser = data?.data ?? data;
              if (fetchedUser?.wallet) {
                setWalletAddress(fetchedUser.wallet);
                localStorage.setItem('groovely_wallet', fetchedUser.wallet);
                localStorage.setItem('grooveli_wallet', fetchedUser.wallet);
              }
            })
            .catch(() => {});
        }
      } catch { }
    }
  }, [user]);

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

  const { address: wagmiAddress } = useAccount();
  const activeAddress = wagmiAddress || user?.wallet?.address || walletAddress;

  const { data: nativeBalance } = useBalance({
    address: activeAddress as `0x${string}`,
  });

  const { data: usdcBalance } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: [
      {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
      },
    ] as const,
    functionName: 'balanceOf',
    args: activeAddress ? [activeAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!activeAddress,
    },
  });

  const abbrev = activeAddress
    ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}`
    : '0x...';

  const handleCopy = () => {
    if (activeAddress) {
      navigator.clipboard.writeText(activeAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = async () => {
    await logout();   // Clear Privy session so wallet doesn't auto-reconnect
    handleLogout();   // Clear app tokens and redirect to /login
  };

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-[#192134] lg:bg-[#050510] border-b border-[#232B3E] lg:border-white/5 transition-all">
      {/* Mobile Header: 2-Tier Figma Layout (Frame 25 / Frame 305 & Frame 76) */}
      <div className="lg:hidden flex flex-col p-4 gap-3 bg-[rgba(15,23,42,0.6)] backdrop-blur-md">
        {/* Row 1: Menu + Greeting on Left, Notification + Divider + Wallet on Right */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('toggle_mobile_sidebar'))}
              className="p-1 text-white hover:text-accent-purple transition-colors cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu size={24} />
            </button>
            <h2 className="font-['Clash_Display',sans-serif] font-bold text-[18px] sm:text-[20px] text-white tracking-tight leading-none truncate max-w-[150px] sm:max-w-[200px]">
              Hello, {displayName}! 👋
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="p-1 text-white hover:text-accent-purple transition-colors relative cursor-pointer">
              <Bell size={22} />
              <div className="absolute top-1 right-1 w-2 h-2 bg-[#8A2BE2] rounded-full" />
            </button>

            {/* Vertical Divider */}
            <div className="w-[1px] h-6 bg-[#232B3E]" />

            {/* Mobile Wallet Trigger */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o: boolean) => !o)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="Wallet" className="w-6 h-6 object-contain" />
                </div>
                <span className="font-['Space_Grotesk',sans-serif] font-bold text-[14px] text-white">
                  {abbrev}
                </span>
              </button>

              {/* Mobile Wallet Dropdown Panel */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-[#0F172A] border border-[#232B3E] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-5 py-4 border-b border-[#232B3E] bg-[#192134]/50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 bg-[#1A1A2E] flex items-center justify-center">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="Wallet" className="w-6 h-6 object-contain" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#8A2BE2]">{role ?? 'Connected'}</p>
                        <p className="text-sm font-bold text-white font-mono">{abbrev}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
                      </div>
                    </div>

                    <div className="mt-3 bg-[#0F172A] rounded-xl px-3 py-2 flex items-center justify-between gap-2 border border-[#232B3E]">
                      <p className="text-[10px] text-zinc-400 font-mono truncate flex-1">{activeAddress ?? 'Not connected'}</p>
                      <button onClick={handleCopy} className="text-zinc-400 hover:text-white transition-colors shrink-0">
                        {copied ? <CheckCheck size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-left">
                      <div className="bg-[#0F172A] rounded-xl p-2.5 border border-[#232B3E]">
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">POL (Gas)</p>
                        <p className="text-xs font-black text-white font-mono truncate">
                          {nativeBalance ? `${parseFloat(formatUnits(nativeBalance.value, nativeBalance.decimals)).toFixed(3)} POL` : '0.000 POL'}
                        </p>
                      </div>
                      <div className="bg-[#0F172A] rounded-xl p-2.5 border border-[#232B3E]">
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">USDC</p>
                        <p className="text-xs font-black text-[#40FFA6] font-mono">
                          {usdcBalance !== undefined ? `$${(Number(usdcBalance) / 1e6).toFixed(2)}` : '$0.00'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <User size={14} />
                      View Profile
                    </Link>
                    <button
                      onClick={handleDisconnect}
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all text-left cursor-pointer"
                    >
                      <LogOut size={14} />
                      Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Full-Width Dedicated Search Bar (Frame 76 / Frame 7: height 48px, border 2px solid #232B3E, radius 8px) */}
        <div className="relative w-full h-[48px] border-2 border-[#232B3E] rounded-[8px] bg-transparent flex items-center px-3 gap-3 focus-within:border-[#8A2BE2] transition-colors">
          <Search size={20} className="text-white shrink-0" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full bg-transparent font-['Space_Grotesk',sans-serif] text-[16px] text-white placeholder-[#CACACA] focus:outline-none"
          />
        </div>
      </div>

      {/* Desktop Header: Single Row */}
      <div className="hidden lg:flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-8 flex-1">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest cursor-pointer"
          >
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
              className="w-full bg-[#0F172A] border border-[#232B3E] rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-[#8A2BE2]/50 transition-all placeholder-zinc-500 text-white"
            />
          </div>

          <nav className="flex items-center gap-6 ml-4">
            <Link href="/dashboard/rooms" className="text-sm font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
              Listening Room
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <button className="text-zinc-500 hover:text-white transition-colors relative cursor-pointer">
            <ShoppingCart size={22} strokeWidth={2.5} />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#8A2BE2] rounded-full shadow-[0_0_8px_rgba(138,43,226,0.6)]" />
          </button>

          {/* Desktop Wallet Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-3 bg-[#0F172A] border border-[#232B3E] rounded-xl px-4 py-2 hover:bg-white/5 cursor-pointer transition-all"
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

            {/* Desktop Dropdown Panel */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-[#0F172A] border border-[#232B3E] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-5 py-4 border-b border-[#232B3E] bg-[#192134]/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-[#1A1A2E]">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="Wallet" className="w-full h-full object-contain p-1" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#8A2BE2] mb-0.5">{role ?? 'Connected'}</p>
                      <p className="text-sm font-bold text-white font-mono">{abbrev}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
                    </div>
                  </div>

                  <div className="mt-3 bg-[#0F172A] rounded-xl px-3 py-2 flex items-center justify-between gap-2 border border-[#232B3E]">
                    <p className="text-[10px] text-zinc-400 font-mono truncate flex-1">{activeAddress ?? 'Not connected'}</p>
                    <button onClick={handleCopy} className="text-zinc-400 hover:text-white transition-colors shrink-0" title="Copy address">
                      {copied ? <CheckCheck size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-left">
                    <div className="bg-[#0F172A] rounded-xl p-2.5 border border-[#232B3E]">
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Gas Token (POL)</p>
                      <p className="text-sm font-black text-white font-mono">
                        {nativeBalance ? `${parseFloat(formatUnits(nativeBalance.value, nativeBalance.decimals)).toFixed(4)} POL` : '0.0000 POL'}
                      </p>
                    </div>
                    <div className="bg-[#0F172A] rounded-xl p-2.5 border border-[#232B3E]">
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">USDC Balance</p>
                      <p className="text-sm font-black text-[#40FFA6] font-mono">
                        {usdcBalance !== undefined ? `$${(Number(usdcBalance) / 1e6).toFixed(2)}` : '$0.00'}
                      </p>
                    </div>
                  </div>
                </div>

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
                  <button
                    onClick={handleDisconnect}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all text-left cursor-pointer"
                  >
                    <LogOut size={16} />
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

