'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Menu, 
  X,
  Disc,
  Send,
  Loader2,
  AlertCircle,
  Check,
  User as UserIcon,
  ArrowUpRight,
  Wallet
} from 'lucide-react';
import { Twitter, Instagram, Polygon } from '@/components/ui/SocialIcons';
import { WalletMenu } from '@/components/dashboard/WalletMenu';
import { apiFetch, resolveIpfsUrl } from '@/lib/api';
import { useAccount, useDisconnect, useBalance, useSendTransaction, useWriteContract, useReadContract } from 'wagmi';
import { parseEther, parseUnits, formatUnits } from 'viem';
import { USDC_ADDRESS, ERC20_ABI } from '@/lib/contracts';
import { usePrivy, useLogout } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = usePrivy();
  const { logout } = useLogout();
  const { address: activeAddress } = useAccount();
  const { disconnect } = useDisconnect();

  // Balances & On-Chain Transfers
  const { data: polBalanceData, refetch: refetchPolBalance } = useBalance({
    address: activeAddress,
  });
  const { data: rawUsdcBalance, refetch: refetchUsdcBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: activeAddress ? [activeAddress] : undefined,
    query: {
      enabled: !!activeAddress,
    },
  });

  const { sendTransactionAsync, isPending: isSendingTx } = useSendTransaction();
  const { writeContractAsync, isPending: isWritingContract } = useWriteContract();

  // Withdraw & Transfer state
  const [withdrawToken, setWithdrawToken] = useState<'USDC' | 'POL'>('USDC');
  const [recipient, setRecipient] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // Form State
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [creatorTypes, setCreatorTypes] = useState<string[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification Preferences State
  const [notifyUploads, setNotifyUploads] = useState(true);
  const [notifyReleases, setNotifyReleases] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [notifyPush, setNotifyPush] = useState(true);

  // UI State
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [role, setRole] = useState<string>('creator');

  const currentWallet = activeAddress || user?.wallet?.address || (typeof window !== 'undefined' ? localStorage.getItem('grooveli_wallet') : null);
  const abbrevWallet = currentWallet
    ? `${currentWallet.slice(0, 5)}...${currentWallet.slice(-3)}`
    : '0x00...000';

  useEffect(() => {
    async function loadSettings() {
      setLoadingProfile(true);
      try {
        const storedRole = localStorage.getItem('grooveli_role') || 'creator';
        setRole(storedRole);

        const endpoint = storedRole === 'fan' ? '/api/fan/profile' : '/api/creator/profile';
        const res = await apiFetch(endpoint);
        if (res?.ok) {
          const json = await res.json();
          const p = json.data ?? json;
          setDisplayName(p.display_name ?? '');
          setUsername(p.username ? p.username.replace(/^@/, '') : '');
          setBio(p.bio ?? '');
          setCreatorTypes(p.creator_types ?? p.creator_type ?? []);
          if (p.avatar_url) {
            setAvatarPreview(resolveIpfsUrl(p.avatar_url));
          }
        }
      } catch (err) {
        console.error('Failed to load profile for settings:', err);
      } finally {
        setLoadingProfile(false);
      }
    }

    loadSettings();
  }, []);

  const toggleMobileSidebar = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toggle_mobile_sidebar'));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const endpoint = role === 'fan' ? '/api/fan/profile' : '/api/creator/profile';
      const formData = new FormData();
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      formData.append('displayName', displayName || '');
      formData.append('username', username ? username.replace(/^@/, '') : '');
      if (role !== 'fan') {
        formData.append('bio', bio || '');
        formData.append('creatorTypes', JSON.stringify(creatorTypes));
      }

      const res = await apiFetch(endpoint, {
        method: 'PATCH',
        body: formData,
      });

      if (!res?.ok) {
        const errJson = await res?.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to save profile');
      }

      const data = await res.json();
      const updated = data.data || data;
      if (updated?.avatar_url) {
        setAvatarPreview(resolveIpfsUrl(updated.avatar_url));
      }

      toast.success('Profile changes saved!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleTransferFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAddress) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!recipient || !recipient.startsWith('0x') || recipient.length !== 42) {
      toast.error('Please enter a valid recipient address (0x...)');
      return;
    }
    const numAmount = parseFloat(withdrawAmount);
    if (!numAmount || numAmount <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    setIsTransferring(true);
    const loadId = toast.loading(`Sending ${withdrawAmount} ${withdrawToken}...`);
    try {
      if (withdrawToken === 'USDC') {
        const amountRaw = parseUnits(withdrawAmount.trim(), 6);
        await writeContractAsync({
          address: USDC_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [recipient as `0x${string}`, amountRaw],
        });
      } else {
        const amountRaw = parseEther(withdrawAmount.trim());
        await sendTransactionAsync({
          to: recipient as `0x${string}`,
          value: amountRaw,
        });
      }

      toast.success(`Successfully sent ${withdrawAmount} ${withdrawToken}!`, { id: loadId });
      setWithdrawAmount('');
      setRecipient('');
      refetchPolBalance();
      refetchUsdcBalance();
    } catch (err: any) {
      console.error('Transfer error:', err);
      toast.error(err.message || 'Transfer failed. Check balance and gas fees.', { id: loadId });
    } finally {
      setIsTransferring(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      disconnect?.();
      await logout?.();
      localStorage.removeItem('grooveli_token');
      localStorage.removeItem('grooveli_user_id');
      localStorage.removeItem('grooveli_wallet');
      localStorage.removeItem('grooveli_role');
      toast.success('Wallet disconnected');
      router.push('/login');
    } catch (err) {
      router.push('/login');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#192134] text-white font-sans selection:bg-[#8A2BE2] selection:text-white">
      {/* Universal Drawer Sidebar */}
      <Sidebar activePage="settings" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#192134]">
        
        {/* ========================================================================= */}
        {/* MOBILE TOP BAR (Figma Frame 315) - Visible on < md                         */}
        {/* ========================================================================= */}
        <div className="md:hidden flex flex-col bg-white/[0.01] border-b border-[#2D3548] backdrop-blur-[50px] sticky top-0 z-40 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left (Frame 304): Hamburger + "Settings" Title */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMobileSidebar}
                className="p-1 text-white hover:opacity-80 transition-opacity cursor-pointer"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-bold font-['Clash_Display',sans-serif] text-white tracking-tight">
                Settings
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
                placeholder="Search settings..."
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
              Settings
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
          <div className="max-w-[720px] space-y-8">

            {loadingProfile ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-[#8A2BE2]" size={36} />
                <p className="text-sm font-['Space_Grotesk',sans-serif] text-[#CACACA]">Loading settings...</p>
              </div>
            ) : (
              <>
                {/* ===================================================================== */}
                {/* 1. PROFILE SECTION (Figma Mobile top: 142px - 588px)                  */}
                {/* ===================================================================== */}
                <section className="space-y-6">
                  <h2 className="text-lg sm:text-xl font-bold font-['Clash_Display',sans-serif] text-[#CACACA]">
                    Profile
                  </h2>

                  {/* Avatar + Change Photo */}
                  <div className="flex items-center gap-6">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    {/* Ellipse 9: 100x100 Avatar */}
                    <div className="w-[100px] h-[100px] rounded-full overflow-hidden shrink-0 border-2 border-[#2D3548] shadow-lg bg-[#0F172A] flex items-center justify-center">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt={displayName || 'Avatar'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#8A2BE2] to-[#232B3E] flex items-center justify-center text-white">
                          <span className="text-3xl font-bold font-['Clash_Display',sans-serif] uppercase">
                            {displayName ? displayName.charAt(0) : 'U'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Frame 201: Change Photo Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-14 px-8 bg-[#232B3E] hover:bg-[#2d374f] text-white rounded-lg text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] transition-all cursor-pointer shadow-sm"
                    >
                      Change Photo
                    </button>
                  </div>

                  {/* Frame 79: Display Name */}
                  <div className="space-y-2">
                    <label className="block text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full h-14 bg-transparent border border-[#959595] focus:border-[#8A2BE2] rounded-lg px-4 text-sm sm:text-base font-['Space_Grotesk',sans-serif] text-white placeholder-[#959595] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Frame 153: Username with @ */}
                  <div className="space-y-2">
                    <label className="block text-sm sm:text-base font-medium font-['Space_Grotesk',sans-serif] text-white">
                      Username
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-sm sm:text-base font-['Space_Grotesk',sans-serif] text-white pointer-events-none">
                        @
                      </span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.replace(/^@/, ''))}
                        placeholder="Username"
                        className="w-full h-14 bg-transparent border-2 border-[#606060] focus:border-[#8A2BE2] rounded-lg pl-9 pr-4 text-sm sm:text-base font-['Space_Grotesk',sans-serif] text-white placeholder-[#606060] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Bio input for creators */}
                  {role === 'creator' && (
                    <div className="space-y-2">
                      <label className="block text-sm sm:text-base font-medium font-['Space_Grotesk',sans-serif] text-white">
                        Bio
                      </label>
                      <textarea
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell the world about your music..."
                        className="w-full bg-transparent border border-[#959595] focus:border-[#8A2BE2] rounded-lg p-4 text-sm sm:text-base font-['Space_Grotesk',sans-serif] text-white placeholder-[#959595] focus:outline-none transition-colors"
                      />
                    </div>
                  )}

                  {/* Frame 211: Save Changes Button */}
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="h-14 px-8 bg-[#8A2BE2] hover:bg-[#7823c9] disabled:opacity-50 text-white rounded-lg text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] shadow-[0_0_20px_rgba(138,43,226,0.3)] transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 size={18} className="animate-spin" />}
                    <span>Save Changes</span>
                  </button>
                </section>

                {/* Line 14 Divider */}
                <hr className="border-t border-[#2D3548] my-8" />

                {/* ===================================================================== */}
                {/* 2. WALLET SETTINGS SECTION (Figma Mobile top: 604px - 914px)          */}
                {/* ===================================================================== */}
                <section className="space-y-6">
                  <h2 className="text-lg sm:text-xl font-bold font-['Clash_Display',sans-serif] text-[#CACACA]">
                    Wallet Settings
                  </h2>

                  {/* Frame 49: MetaMask Logo + Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#0F172A] border border-[#232B3E] flex items-center justify-center p-2 shrink-0">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                        alt="MetaMask"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg sm:text-xl font-bold font-['Clash_Display',sans-serif] text-white">
                        MetaMask
                      </h3>
                      <p className="text-xs sm:text-sm font-bold font-['JetBrains_Mono',monospace] text-[#CACACA] break-all">
                        {currentWallet || '0xf3f0e35b4efd0b6c76c54e3cc02c2bb4f41de21d'}
                      </p>
                    </div>
                  </div>

                  {/* Frame 213: Network Section */}
                  <div className="space-y-2">
                    <p className="text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                      Network
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#232B3E] rounded-lg border border-[#2D3548]">
                      <Polygon size={20} className="text-[#8A2BE2]" />
                      <span className="text-sm font-bold font-['Space_Grotesk',sans-serif] text-white">
                        Polygon PoS
                      </span>
                    </div>
                  </div>

                  {/* Disconnect Wallet Button */}
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="h-14 px-8 bg-[#FF0044] hover:bg-[#e0003c] text-white rounded-lg text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] shadow-[0_0_20px_rgba(255,0,68,0.3)] transition-all cursor-pointer inline-flex items-center justify-center"
                  >
                    Disconnect Wallet
                  </button>

                  {/* =================================================================== */}
                  {/* ON-CHAIN WITHDRAW / TRANSFER FUNDS CARD                             */}
                  {/* =================================================================== */}
                  <div className="bg-[#0F172A] border border-[#2D3548] rounded-xl p-6 space-y-5 mt-6">
                    <div className="flex items-center justify-between pb-3 border-b border-[#232B3E]">
                      <div className="flex items-center gap-2">
                        <Wallet size={20} className="text-[#8A2BE2]" />
                        <h3 className="text-lg font-bold font-['Clash_Display',sans-serif] text-white">
                          Withdraw / Transfer Funds
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setWithdrawToken('USDC')}
                          className={`px-3 py-1 rounded-md text-xs font-bold font-['Space_Grotesk',sans-serif] transition-colors ${
                            withdrawToken === 'USDC' ? 'bg-[#8A2BE2] text-white' : 'bg-[#192134] text-[#CACACA] hover:text-white'
                          }`}
                        >
                          USDC
                        </button>
                        <button
                          type="button"
                          onClick={() => setWithdrawToken('POL')}
                          className={`px-3 py-1 rounded-md text-xs font-bold font-['Space_Grotesk',sans-serif] transition-colors ${
                            withdrawToken === 'POL' ? 'bg-[#8A2BE2] text-white' : 'bg-[#192134] text-[#CACACA] hover:text-white'
                          }`}
                        >
                          POL
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs sm:text-sm font-['Space_Grotesk',sans-serif]">
                      <span className="text-[#CACACA]">Available Balance</span>
                      <span className="text-[#00FF88] font-bold font-['JetBrains_Mono',monospace]">
                        {withdrawToken === 'USDC'
                          ? (rawUsdcBalance !== undefined ? `${parseFloat(formatUnits(rawUsdcBalance, 6)).toFixed(2)} USDC` : '0.00 USDC')
                          : (polBalanceData ? `${parseFloat(formatUnits(polBalanceData.value, polBalanceData.decimals)).toFixed(4)} POL` : '0.0000 POL')}
                      </span>
                    </div>

                    <form onSubmit={handleTransferFunds} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs sm:text-sm font-bold font-['Space_Grotesk',sans-serif] text-[#CACACA]">
                          Recipient Wallet Address
                        </label>
                        <input
                          type="text"
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                          placeholder="0x..."
                          className="w-full h-12 bg-[#192134] border border-[#232B3E] focus:border-[#8A2BE2] rounded-lg px-4 text-xs sm:text-sm font-['JetBrains_Mono',monospace] text-white placeholder-zinc-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs sm:text-sm font-bold font-['Space_Grotesk',sans-serif] text-[#CACACA]">
                          Amount ({withdrawToken})
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type="number"
                            step="any"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full h-12 bg-[#192134] border border-[#232B3E] focus:border-[#8A2BE2] rounded-lg pl-4 pr-16 text-sm font-['Space_Grotesk',sans-serif] text-white placeholder-zinc-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (withdrawToken === 'USDC' && rawUsdcBalance !== undefined) {
                                setWithdrawAmount(formatUnits(rawUsdcBalance, 6));
                              } else if (withdrawToken === 'POL' && polBalanceData) {
                                const maxVal = Math.max(0, Number(formatUnits(polBalanceData.value, polBalanceData.decimals)) - 0.01);
                                setWithdrawAmount(maxVal.toString());
                              }
                            }}
                            className="absolute right-2 text-xs font-bold font-['Space_Grotesk',sans-serif] text-[#8A2BE2] hover:text-[#a855f7] px-2 py-1 bg-[#232B3E] rounded"
                          >
                            MAX
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isTransferring || isSendingTx || isWritingContract}
                        className="w-full h-12 bg-[#8A2BE2] hover:bg-[#7823c9] disabled:opacity-50 text-white rounded-lg text-sm font-bold font-['Space_Grotesk',sans-serif] shadow-[0_0_20px_rgba(138,43,226,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {(isTransferring || isSendingTx || isWritingContract) ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Processing on-chain...</span>
                          </>
                        ) : (
                          <>
                            <ArrowUpRight size={16} />
                            <span>Transfer / Withdraw {withdrawToken}</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </section>

                {/* Line 15 Divider */}
                <hr className="border-t border-[#2D3548] my-8" />

                {/* ===================================================================== */}
                {/* 3. NOTIFICATION PREFERENCE SECTION (Figma Mobile top: 930px - 1100px) */}
                {/* ===================================================================== */}
                <section className="space-y-5">
                  <h2 className="text-lg sm:text-xl font-bold font-['Clash_Display',sans-serif] text-[#CACACA]">
                    Notification Preference
                  </h2>

                  {/* Frame 316: Toggle 1 */}
                  <div className="flex items-center justify-between gap-4 py-1">
                    <span className="text-xs sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-[#CACACA]">
                      Receive notifications for new uploads
                    </span>
                    <button
                      type="button"
                      onClick={() => setNotifyUploads(prev => !prev)}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${notifyUploads ? 'bg-[#8A2BE2]' : 'bg-[#959595]'}`}
                      aria-label="Toggle notifications for uploads"
                    >
                      <div className={`w-6 h-6 rounded-full bg-white transition-transform shadow-md ${notifyUploads ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Frame 214: Toggle 2 */}
                  <div className="flex items-center justify-between gap-4 py-1">
                    <span className="text-xs sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-[#CACACA]">
                      Receive notifications for new releases
                    </span>
                    <button
                      type="button"
                      onClick={() => setNotifyReleases(prev => !prev)}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${notifyReleases ? 'bg-[#8A2BE2]' : 'bg-[#959595]'}`}
                      aria-label="Toggle notifications for releases"
                    >
                      <div className={`w-6 h-6 rounded-full bg-white transition-transform shadow-md ${notifyReleases ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Frame 215: Toggle 3 */}
                  <div className="flex items-center justify-between gap-4 py-1">
                    <span className="text-xs sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-[#CACACA]">
                      Email Notifications
                    </span>
                    <button
                      type="button"
                      onClick={() => setNotifyEmail(prev => !prev)}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${notifyEmail ? 'bg-[#8A2BE2]' : 'bg-[#959595]'}`}
                      aria-label="Toggle email notifications"
                    >
                      <div className={`w-6 h-6 rounded-full bg-white transition-transform shadow-md ${notifyEmail ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Frame 216: Toggle 4 */}
                  <div className="flex items-center justify-between gap-4 py-1">
                    <span className="text-xs sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-[#CACACA]">
                      Push Notifications
                    </span>
                    <button
                      type="button"
                      onClick={() => setNotifyPush(prev => !prev)}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${notifyPush ? 'bg-[#8A2BE2]' : 'bg-[#959595]'}`}
                      aria-label="Toggle push notifications"
                    >
                      <div className={`w-6 h-6 rounded-full bg-white transition-transform shadow-md ${notifyPush ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </section>

                {/* ===================================================================== */}
                {/* FOOTER (Mobile Frame 310 & 309 / Desktop Text Container)              */}
                {/* ===================================================================== */}
                <footer className="mt-14 pt-6 border-t border-[#2D3548] flex flex-col md:flex-row justify-between items-center gap-4 text-[#CACACA]">
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
    </div>
  );
}
