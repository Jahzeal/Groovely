'use client';

import React, { useState, useEffect } from 'react';
import {
  X, Check, Loader2, ExternalLink, ShoppingCart,
  Library, AlertCircle, Wallet, ChevronRight, Zap,
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useMint, MintStep } from '@/hooks/useMint';
import { useMusicPlayer } from './MusicPlayerContext';
import { POLYGONSCAN_BASE } from '@/lib/contracts';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface EditionInfo {
  id: number;                  // DB edition ID
  contractEditionId: number;   // on-chain token ID
  editionType: string;         // "open" | "fan" | "collector" | "founder"
  mintPriceUsdc: number;
  maxSupply: number | null;    // null = unlimited
  mintedSupply: number;
  active: boolean;
}

interface MintModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackId: number;
  trackTitle: string;
  trackImage: string;
  creatorName: string;
  editions: EditionInfo[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Edition type styling
// ─────────────────────────────────────────────────────────────────────────────

const EDITION_STYLES: Record<string, { label: string; color: string; glow: string; badge: string }> = {
  open:      { label: 'Open Edition',          color: 'border-zinc-600 bg-zinc-900/50',        glow: 'rgba(255,255,255,0.05)', badge: 'bg-zinc-700 text-zinc-300'       },
  single:    { label: 'Single Edition (1/1)',  color: 'border-emerald-500/40 bg-emerald-900/10', glow: 'rgba(16,185,129,0.15)', badge: 'bg-emerald-900/50 text-emerald-400' },
  fan:       { label: 'Fan Edition',           color: 'border-accent-cyan/40 bg-cyan-900/10',  glow: 'rgba(45,212,191,0.15)',  badge: 'bg-cyan-900/50 text-accent-cyan' },
  collector: { label: 'Collector Edition',     color: 'border-accent-purple/40 bg-purple-900/10', glow: 'rgba(139,92,246,0.2)', badge: 'bg-purple-900/50 text-accent-purple' },
  founder:   { label: 'Founder Edition',       color: 'border-yellow-500/40 bg-yellow-900/10', glow: 'rgba(234,179,8,0.15)',   badge: 'bg-yellow-900/50 text-yellow-400' },
};

const getStyle = (type: string) =>
  EDITION_STYLES[type?.toLowerCase()] ?? EDITION_STYLES.open;

// ─────────────────────────────────────────────────────────────────────────────
// Step indicator
// ─────────────────────────────────────────────────────────────────────────────

const STEP_LABELS: Partial<Record<MintStep, string>> = {
  checking:   'Checking balance…',
  approving:  'Approving USDC…',
  approved:   'Approved ✓',
  minting:    'Minting on-chain…',
  confirming: 'Waiting for confirmation…',
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const MintModal: React.FC<MintModalProps> = ({
  isOpen,
  onClose,
  trackId,
  trackTitle,
  trackImage,
  creatorName,
  editions,
}) => {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { authenticated } = usePrivy();
  const { addPurchasedTrack } = useMusicPlayer();
  const [selectedEdition, setSelectedEdition] = useState<EditionInfo | null>(null);
  const [uiStep, setUiStep] = useState<'choose' | 'pay' | 'success'>('choose');

  // Pick first active edition by default
  useEffect(() => {
    const first = editions.find(e => e.active);
    if (first) setSelectedEdition(first);
  }, [editions]);

  const { step, txHash, tokenId, errorMessage, executeMint, reset, isLoading } = useMint({
    editionId:          selectedEdition?.id ?? 0,
    contractEditionId:  selectedEdition?.contractEditionId ?? 0,
    mintPriceUsdc:      selectedEdition?.mintPriceUsdc ?? 0,
    trackId,
    onSuccess: ({ txHash }) => {
      addPurchasedTrack(trackId);
      setUiStep('success');
    },
  });

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    setUiStep('choose');
    onClose();
  };

  const handleProceedToPay = () => {
    if (selectedEdition) setUiStep('pay');
  };

  const isSoldOut = (ed: EditionInfo) =>
    !ed.active || (ed.maxSupply !== null && ed.maxSupply > 0 && ed.mintedSupply >= ed.maxSupply);

  const remainingSupply = (ed: EditionInfo) => {
    if (ed.editionType === 'open' || ed.maxSupply === null || ed.maxSupply === 0 || ed.maxSupply >= 1000000) {
      return 'Unlimited';
    }
    const remaining = Math.max(0, ed.maxSupply - ed.mintedSupply);
    return `${remaining.toLocaleString()} left`;
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={uiStep !== 'pay' || !isLoading ? handleClose : undefined}
      />

      {/* Card */}
      <div className="relative w-full max-w-lg animate-in fade-in zoom-in-95 duration-300">
        <div className="absolute -inset-px bg-gradient-to-b from-accent-purple/30 to-transparent rounded-[36px] pointer-events-none" />

        <div className="relative bg-[#080814] border border-white/10 rounded-[34px] overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,0.9)]">
          {/* Top bar */}
          <div className="h-[3px] w-full bg-gradient-to-r from-accent-purple via-accent-cyan to-accent-purple" />

          {/* Header */}
          <div className="flex items-center justify-between px-8 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10">
                <img src={trackImage} alt={trackTitle} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-xs font-black text-white truncate max-w-[200px]">{trackTitle}</p>
                <p className="text-[10px] text-zinc-500 font-medium">by {creatorName}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all disabled:opacity-30"
            >
              <X size={16} />
            </button>
          </div>

          {/* ── Step: Choose Edition ──────────────────────────────────────── */}
          {uiStep === 'choose' && (
            <div className="px-8 pb-8">
              <h2 className="text-xl font-black text-white mb-1">Choose an Edition</h2>
              <p className="text-xs text-zinc-500 mb-6">Each edition grants different rights and supply levels.</p>

              <div className="space-y-3 mb-6">
                {editions.map((ed) => {
                  const style = getStyle(ed.editionType);
                  const sold = isSoldOut(ed);
                  const selected = selectedEdition?.id === ed.id;

                  return (
                    <button
                      key={ed.id}
                      onClick={() => !sold && setSelectedEdition(ed)}
                      disabled={sold}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden
                        ${sold ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.01]'}
                        ${selected ? `${style.color} ring-2 ring-accent-purple/50` : 'border-white/5 bg-white/[0.02] hover:border-white/10'}`}
                      style={selected ? { boxShadow: `0 0 24px ${style.glow}` } : undefined}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Radio */}
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                            selected ? 'border-accent-purple bg-accent-purple/20' : 'border-zinc-600'
                          }`}>
                            {selected && <div className="w-1.5 h-1.5 rounded-full bg-accent-purple" />}
                          </div>
                          <div>
                            <p className="text-sm font-black text-white">{style.label}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${style.badge}`}>
                                {sold ? 'Sold Out' : remainingSupply(ed)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-white">${ed.mintPriceUsdc.toFixed(2)}</p>
                          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">USDC</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleProceedToPay}
                disabled={!selectedEdition || isSoldOut(selectedEdition)}
                className="w-full py-4 bg-accent-purple hover:bg-accent-purple/90 text-white font-black text-sm rounded-2xl transition-all shadow-[0_8px_30px_rgba(139,92,246,0.4)] hover:shadow-[0_12px_40px_rgba(139,92,246,0.5)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── Step: Pay ─────────────────────────────────────────────────── */}
          {uiStep === 'pay' && selectedEdition && (
            <div className="px-8 pb-8">
              <h2 className="text-xl font-black text-white mb-1">Confirm & Pay</h2>
              <p className="text-xs text-zinc-500 mb-6">Review your purchase before minting.</p>

              {/* Summary card */}
              <div className="bg-[#0F0F1A] border border-white/5 rounded-2xl p-5 mb-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400 font-bold">{getStyle(selectedEdition.editionType).label}</span>
                  <span className="text-white font-black">${selectedEdition.mintPriceUsdc.toFixed(2)} USDC</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400 font-bold">Platform fee</span>
                  <span className="text-zinc-500 font-bold">5% (included)</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400 font-bold">Network Gas Fee</span>
                  <span className="text-accent-cyan/90 font-bold">~0.01 POL (Polygon)</span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between items-center">
                  <span className="text-white font-black">Total Price</span>
                  <span className="text-xl font-black text-accent-cyan">${selectedEdition.mintPriceUsdc.toFixed(2)} USDC</span>
                </div>
              </div>

              {/* Wallet status */}
              {isConnected && address ? (
                <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 mb-6">
                  <Wallet size={16} className="text-accent-purple shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Wallet</p>
                    <p className="text-xs font-black text-white font-mono truncate">
                      {address.slice(0, 6)}…{address.slice(-4)}
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={login}
                  className="w-full flex items-center justify-between bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 rounded-xl px-4 py-3 mb-6 text-left transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-yellow-500 text-xs font-bold">
                    <AlertCircle size={14} />
                    <span>Connect your wallet to continue</span>
                  </span>
                  <span className="text-[10px] font-black uppercase text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded-md">Connect</span>
                </button>
              )}

              {/* Live step indicator */}
              {isLoading && (
                <div className="flex items-center gap-3 bg-accent-purple/10 border border-accent-purple/20 rounded-xl px-4 py-3 mb-4">
                  <Loader2 size={16} className="text-accent-purple animate-spin shrink-0" />
                  <span className="text-sm font-bold text-accent-purple">
                    {STEP_LABELS[step] || 'Processing…'}
                  </span>
                </div>
              )}

              {/* Error */}
              {errorMessage && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                  <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-red-400">{errorMessage}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { reset(); setUiStep('choose'); }}
                  disabled={isLoading}
                  className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white font-bold text-sm rounded-2xl transition-all disabled:opacity-30"
                >
                  Back
                </button>
                {!isConnected ? (
                  <button
                    onClick={() => {
                      if (!authenticated) {
                        const returnUrl = `/marketplace/${trackId}?action=mint`;
                        router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`);
                      } else {
                        login();
                      }
                    }}
                    className="flex-[2] py-3.5 bg-accent-purple hover:bg-accent-purple/90 text-white font-black text-sm rounded-2xl transition-all shadow-[0_8px_30px_rgba(139,92,246,0.4)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <Wallet size={16} />
                    {!authenticated ? 'Log In / Sign Up to Mint' : 'Connect Wallet to Mint'}
                  </button>
                ) : (
                  <button
                    onClick={executeMint}
                    disabled={isLoading}
                    className="flex-[2] py-3.5 bg-accent-purple hover:bg-accent-purple/90 text-white font-black text-sm rounded-2xl transition-all shadow-[0_8px_30px_rgba(139,92,246,0.4)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <><Loader2 size={16} className="animate-spin" /> Working…</>
                    ) : errorMessage ? (
                      <><Zap size={16} /> Try Again</>
                    ) : (
                      <><ShoppingCart size={16} /> Confirm Mint</>
                    )}
                  </button>
                )}
              </div>

              <p className="mt-4 text-[10px] text-zinc-700 text-center leading-relaxed">
                Your wallet will prompt twice: once to approve USDC, once to mint.
                <br />Revenue is split instantly between all contributors.
              </p>
            </div>
          )}

          {/* ── Step: Success ─────────────────────────────────────────────── */}
          {uiStep === 'success' && (
            <div className="px-8 pb-8 flex flex-col items-center text-center">
              {/* Animated checkmark */}
              <div className="relative mb-6 mt-2">
                <div className="absolute inset-0 rounded-full border-2 border-accent-purple/30 animate-ping" />
                <div className="w-20 h-20 bg-accent-purple/10 border border-accent-purple/30 rounded-full flex items-center justify-center">
                  <Check size={36} className="text-accent-purple" strokeWidth={3} />
                </div>
              </div>

              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-accent-purple mb-2 flex items-center gap-1">
                <Zap size={10} fill="currentColor" /> Minted Successfully
              </span>
              <h2 className="text-2xl font-black tracking-tight text-white mb-1">
                You own it now.
              </h2>
              <p className="text-sm text-zinc-500 mb-2">
                <span className="text-white font-black">{trackTitle}</span> — {selectedEdition ? getStyle(selectedEdition.editionType).label : 'Edition'}
              </p>

              {tokenId !== null && (
                <span className="text-[10px] font-bold text-zinc-600 mb-6">
                  Token ID #{tokenId}
                </span>
              )}

              {txHash && (
                <a
                  href={`${POLYGONSCAN_BASE}${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors mb-8 bg-white/5 px-4 py-2 rounded-xl hover:bg-white/10"
                >
                  <ExternalLink size={12} />
                  View on PolygonScan
                </a>
              )}

              <div className="flex gap-3 w-full">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white font-bold text-sm rounded-2xl transition-all"
                >
                  Continue Browsing
                </button>
                <a
                  href="/library"
                  className="flex-[2] py-3.5 bg-accent-purple hover:bg-accent-purple/90 text-white font-black text-sm rounded-2xl transition-all shadow-[0_8px_30px_rgba(139,92,246,0.4)] flex items-center justify-center gap-2 hover:scale-[1.01]"
                  onClick={handleClose}
                >
                  <Library size={16} />
                  Go to Library
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
