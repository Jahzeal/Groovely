import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Bell, ShoppingCart, Copy, LogOut, User, Settings, CheckCheck, ExternalLink, Menu } from 'lucide-react';
import { useCart } from './CartContext';
import { handleLogout } from '@/lib/api';
import { useLogout, usePrivy } from '@privy-io/react-auth';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { USDC_ADDRESS } from '@/lib/contracts';
import { formatUnits } from 'viem';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const MarketTopBar = () => {
  const [sortOpen, setSortOpen] = useState(false);
  const [sortLabel, setSortLabel] = useState('Sort By');
  const { openCart } = useCart();
  const router = useRouter();
  const { logout } = useLogout();
  const { user, authenticated: privyAuthenticated, login } = usePrivy();
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount();
  const [searchQuery, setSearchQuery] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('groovely_token') || localStorage.getItem('grooveli_token');
      if (token) {
        setIsAuthenticated(true);
        const storedWallet = localStorage.getItem('groovely_wallet') || localStorage.getItem('grooveli_wallet');
        if (storedWallet) setWalletAddress(storedWallet);
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setRole(payload.role ?? null);
          if (payload.wallet && !storedWallet) {
            setWalletAddress(payload.wallet);
          }
        } catch {}
      } else if (privyAuthenticated && user?.wallet?.address) {
        setWalletAddress(user.wallet.address);
      } else {
        setIsAuthenticated(false);
        setWalletAddress(null);
      }
    }
  }, [user, privyAuthenticated]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isUserLoggedIn = isAuthenticated || privyAuthenticated || (wagmiConnected && !!wagmiAddress);
  const activeAddress = isUserLoggedIn ? (wagmiAddress || user?.wallet?.address || walletAddress) : null;
  const hasAuth = isUserLoggedIn && !!activeAddress;
  const isValidAddress = Boolean(activeAddress && activeAddress.startsWith('0x') && activeAddress.length === 42);

  const { data: nativeBalance } = useBalance({
    address: isValidAddress ? (activeAddress as `0x${string}`) : undefined,
    query: {
      enabled: isValidAddress,
    },
  });

  const { data: usdcBalance } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: [
      {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'owner', type: 'address' }],
        outputs: [{ name: 'balance', type: 'uint256' }],
      },
    ] as const,
    functionName: 'balanceOf',
    args: isValidAddress ? [activeAddress as `0x${string}`] : undefined,
    query: {
      enabled: isValidAddress,
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

  const sortOptions = ['Most Popular', 'Newest', 'Price: Low to High', 'Price: High to Low', 'Trending'];

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleMobileSidebar = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toggle_mobile_sidebar'));
    }
  };

  return (
    <header className="flex flex-col md:flex-row items-stretch md:items-center justify-between px-4 sm:px-6 md:px-10 py-3 sm:py-5 bg-[#192134]/80 backdrop-blur-md border-b border-[#2D3548] sticky top-0 z-40 gap-3 md:gap-4">
      {/* Top row on mobile / Left side on desktop: Hamburger + Search + Right Icons */}
      <div className="flex items-center justify-between gap-3 w-full md:w-auto md:flex-1 md:max-w-2xl">
        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden p-2 rounded-xl bg-[#0F0F1A] border border-white/10 text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Search Bar */}
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-accent-purple transition-colors">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search beats, podcasts, samples..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full bg-[#0F0F1A] border border-white/5 rounded-xl py-2.5 sm:py-3 pl-10 pr-4 text-xs sm:text-sm font-medium focus:outline-none focus:border-accent-purple/50 transition-all placeholder-zinc-600 text-white"
          />
        </div>

        {/* Sort Dropdown (hidden on small mobile or compact) */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 bg-[#0F0F1A] border border-white/5 rounded-xl px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-zinc-400 hover:text-white hover:border-white/10 transition-all whitespace-nowrap"
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

      {/* Right side: Auth / Notifications / Cart / Wallet */}
      <div className="flex items-center justify-end gap-3 sm:gap-4 md:ml-6 shrink-0">
        {!hasAuth ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => login()}
              className="text-zinc-400 hover:text-white font-black text-[10px] uppercase tracking-widest px-3 sm:px-5 py-2 sm:py-3 transition-all cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={() => login()}
              className="bg-accent-purple hover:bg-opacity-90 text-white font-black text-[10px] uppercase tracking-widest px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(157,0,255,0.3)] cursor-pointer"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <>
            <button className="text-zinc-500 hover:text-white transition-colors relative p-1">
              <Bell size={20} strokeWidth={2} />
              <div className="absolute top-0 right-0 w-2 h-2 bg-accent-purple rounded-full shadow-[0_0_8px_rgba(157,0,255,0.7)]" />
            </button>

            <button 
              onClick={openCart}
              className="text-zinc-500 hover:text-white transition-colors relative p-1 cursor-pointer"
            >
              <ShoppingCart size={20} strokeWidth={2} />
              <div className="absolute top-0 right-0 w-2 h-2 bg-accent-purple rounded-full shadow-[0_0_8px_rgba(157,0,255,0.7)]" />
            </button>

            {/* Wallet Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen((o) => !o);
                }}
                className="flex items-center gap-2 sm:gap-3 bg-[#0F0F1A] border border-white/5 rounded-xl px-3 sm:px-4 py-2 hover:bg-white/5 cursor-pointer transition-all"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden border border-white/10 shrink-0">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="Wallet" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col items-start leading-none text-left max-w-[90px] sm:max-w-none">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">
                    {role ?? 'wallet'}
                  </span>
                  <span className="text-xs sm:text-sm font-black tracking-tight text-white/90 truncate">{abbrev}</span>
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
                        {activeAddress ?? 'Not connected'}
                      </p>
                      <button
                        onClick={handleCopy}
                        className="text-zinc-500 hover:text-white transition-colors shrink-0"
                      >
                        {copied ? <CheckCheck size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>

                    {/* Balances */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-left">
                      <div className="bg-black/30 rounded-xl p-2.5 border border-white/5">
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">Gas Token (POL)</p>
                        <p className="text-sm font-black text-white font-mono">
                          {nativeBalance ? `${parseFloat(formatUnits(nativeBalance.value, nativeBalance.decimals)).toFixed(4)} POL` : '0.0000 POL'}
                        </p>
                      </div>
                      <div className="bg-black/30 rounded-xl p-2.5 border border-white/5">
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">USDC Balance</p>
                        <p className="text-sm font-black text-accent-cyan font-mono">
                          {usdcBalance !== undefined ? `$${(Number(usdcBalance) / 1e6).toFixed(2)}` : '$0.00'}
                        </p>
                      </div>
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
                      onClick={async () => { await logout(); handleLogout(); }}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut size={16} />
                      Disconnect Wallet
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};
