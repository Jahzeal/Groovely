'use client';

import React from 'react';
import { Ethereum } from '@/components/ui/SocialIcons';
import { Button } from '@/components/ui/Button';
import { X, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';

interface MintConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  loadingLabel?: string;
  errorMessage?: string | null;
  errorTitle?: string | null;
  actionUrl?: string;
  actionLabel?: string;
  data?: {
    fee?: string;
    from?: string;
    to?: string;
    network?: string;
    gasFee?: string;
    totalEth?: string;
    totalUsd?: string;
  };
}

export function MintConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  isLoading = false,
  loadingLabel,
  errorMessage,
  errorTitle,
  actionUrl,
  actionLabel,
  data = {
    fee: '2.50 USDC',
    from: '0x...',
    to: '0x...',
    network: 'Polygon Amoy',
    gasFee: '~0.02 POL',
    totalEth: '2.50 USDC',
    totalUsd: '2.50'
  }
}: MintConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#0A0A1B] border border-white/10 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden text-left">
        {/* Glow Effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-purple/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent-cyan/5 blur-[80px] rounded-full pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
              Review and Confirm Minting
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed">
              You're about to publish this audio track as a blockchain asset on Polygon Amoy.
            </p>
          </div>

          {/* Error Banner if error occurred */}
          {errorMessage && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl space-y-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle size={18} className="shrink-0" />
                <h4 className="text-xs font-bold uppercase tracking-wider">{errorTitle || 'Transaction Failed'}</h4>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {errorMessage}
              </p>
              {actionUrl && (
                <div className="pt-1">
                  <a
                    href={actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-cyan hover:underline"
                  >
                    <span>{actionLabel || 'Learn More ↗'}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Minting Fee Block */}
          <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-5 flex items-center justify-between group hover:bg-white/[0.05] transition-all">
            <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Minting Fee</span>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 transition-colors group-hover:border-white/20">
                  <Ethereum size={16} className="text-white" />
                  <span className="text-[10px] font-black tracking-widest text-white uppercase">{data.network}</span>
               </div>
               <div className="text-right">
                  <p className="text-xl font-black text-white">{data.fee}</p>
                  <p className="text-[10px] font-bold text-zinc-600">({data.fee})</p>
               </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="border border-white/10 rounded-3xl p-6 space-y-5 bg-white/[0.01]">
             <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">From</span>
                <span className="text-sm font-black text-white tracking-widest">{data.from}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">To</span>
                <span className="text-sm font-black text-white tracking-widest">{data.to}</span>
             </div>
             <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Network</span>
                <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-md border border-white/5">
                   <Ethereum size={12} className="text-white" />
                   <span className="text-[9px] font-black tracking-widest text-white uppercase">{data.network}</span>
                </div>
             </div>

             <div className="bg-white/[0.03] rounded-2xl p-4 mt-2 space-y-3">
                <div className="flex justify-between items-center">
                   <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Gas Fee (est.)</span>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-zinc-600">(${data.totalUsd})</span>
                      <span className="text-sm font-black text-white tracking-widest">{data.gasFee}</span>
                   </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                   <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Total</span>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-zinc-600">(${data.totalUsd})</span>
                      <span className="text-sm font-black text-white tracking-widest">{data.totalEth}</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <Button 
              variant="secondary" 
              fullWidth 
              onClick={onClose}
              disabled={isLoading}
              className="py-4 bg-white/5 hover:bg-white/10 border-none rounded-2xl text-xs uppercase tracking-[0.2em] font-black disabled:opacity-50"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              fullWidth 
              onClick={onConfirm}
              disabled={isLoading}
              className="py-4 bg-accent-purple shadow-[0_0_20px_rgba(157,0,255,0.3)] hover:shadow-[0_0_30px_rgba(157,0,255,0.5)] rounded-2xl text-xs uppercase tracking-[0.2em] font-black flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{loadingLabel || 'Processing...'}</span>
                </>
              ) : (
                <span>{errorMessage ? 'Try Again' : 'Mint Track'}</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
