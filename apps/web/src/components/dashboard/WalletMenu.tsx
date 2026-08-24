'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Copy,
  LogOut,
  User,
  Settings,
  CheckCheck,
  ExternalLink,
  Wallet
} from 'lucide-react';
import { handleLogout, apiFetch } from '@/lib/api';
import { usePrivy, useLogout } from '@privy-io/react-auth';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { USDC_ADDRESS } from '@/lib/contracts';
import { formatUnits } from 'viem';

interface WalletMenuProps {
  className?: string;
  compact?: boolean;
}

export const WalletMenu: React.FC<WalletMenuProps> = ({ className = '', compact = false }) => {
  const { user } = usePrivy();
  const { logout } = useLogout();
  const { address: wagmiAddress } = useAccount();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedWallet = localStorage.getItem('groovely_wallet') || localStorage.getItem('grooveli_wallet');
      if (storedWallet) {
        setWalletAddress(storedWallet);
      } else if (user?.wallet?.address) {
        setWalletAddress(user.wallet.address);
      }

      try {
        const token = localStorage.getItem('groovely_token') || localStorage.getItem('grooveli_token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setRole(payload.role ?? null);
          if (payload.wallet && !storedWallet) {
            setWalletAddress(payload.wallet);
          }
        }
      } catch {}
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
    : '0x00...000';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeAddress) {
      navigator.clipboard.writeText(activeAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = async () => {
    await logout();
    handleLogout();
  };

  return (
    <div className={`relative z-40 ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setDropdownOpen((o) => !o)}
        className="flex items-center gap-2 bg-[#0F172A] border border-[#2D3548] rounded-xl px-3 py-1.5 hover:bg-white/5 cursor-pointer transition-all select-none"
      >
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
            alt="Wallet"
            className="w-full h-full object-contain"
          />
        </div>
        {!compact && (
          <span className="font-['Space_Grotesk',sans-serif] font-bold text-xs sm:text-sm text-white truncate max-w-[100px] sm:max-w-none">
            {abbrev}
          </span>
        )}
        <ChevronDown
          size={14}
          className={`text-zinc-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Panel */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#0F172A] border border-[#232B3E] rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-5 py-4 border-b border-[#232B3E] bg-[#192134]/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-[#1A1A2E] flex items-center justify-center">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                  alt="Wallet"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#8A2BE2] mb-0.5">
                  {role ?? 'Connected'}
                </p>
                <p className="text-sm font-bold text-white font-mono truncate">{abbrev}</p>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
              </div>
            </div>

            {/* Address Copy Bar */}
            <div className="mt-3 bg-[#0F172A] rounded-xl px-3 py-2 flex items-center justify-between gap-2 border border-[#232B3E]">
              <p className="text-[11px] text-zinc-400 font-mono truncate flex-1">
                {activeAddress ?? 'Not connected'}
              </p>
              <button
                type="button"
                onClick={handleCopy}
                className="text-zinc-400 hover:text-white transition-colors shrink-0 p-1 cursor-pointer"
                title="Copy address"
              >
                {copied ? <CheckCheck size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>

            {/* Balances */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-left">
              <div className="bg-[#0F172A] rounded-xl p-2.5 border border-[#232B3E]">
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Gas Token (POL)</p>
                <p className="text-xs sm:text-sm font-black text-white font-mono truncate">
                  {nativeBalance ? `${parseFloat(formatUnits(nativeBalance.value, nativeBalance.decimals)).toFixed(4)} POL` : '0.0000 POL'}
                </p>
              </div>
              <div className="bg-[#0F172A] rounded-xl p-2.5 border border-[#232B3E]">
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">USDC Balance</p>
                <p className="text-xs sm:text-sm font-black text-[#00FF88] font-mono">
                  {usdcBalance !== undefined ? `$${(Number(usdcBalance) / 1e6).toFixed(2)}` : '$0.00'}
                </p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="py-2">
            <Link
              href="/dashboard/profile"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-3 px-5 py-2.5 text-xs sm:text-sm font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <User size={15} />
              <span>View Profile</span>
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-3 px-5 py-2.5 text-xs sm:text-sm font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <Settings size={15} />
              <span>Settings</span>
            </Link>
            <button
              type="button"
              onClick={handleDisconnect}
              className="w-full flex items-center gap-3 px-5 py-2.5 text-xs sm:text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all text-left cursor-pointer"
            >
              <LogOut size={15} />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
