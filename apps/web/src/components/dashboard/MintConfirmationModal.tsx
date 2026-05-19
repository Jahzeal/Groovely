'use client';

import React from 'react';
import { Ethereum } from '@/components/ui/SocialIcons';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';

interface MintConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
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
  data = {
    fee: '0.002',
    from: '0.002',
    to: '0.002',
    network: 'ETH',
    gasFee: '2.5',
    totalEth: '2.5',
    totalUsd: '3.26'
  }
}: MintConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#0A0A1B] border border-white/10 rounded-[40px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-purple/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent-cyan/5 blur-[80px] rounded-full pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 space-y-8 text-center">
          <div className="space-y-3">
            <h2 className="text-2xl font-black tracking-tight text-white leading-tight">
              Review and Confirm Minting
            </h2>
            <p className="text-sm text-zinc-400 font-medium leading-relaxed px-4">
              You're about to mint this audio as a blockchain asset. 
              Once confirmed in your wallet, this action will create an on-chain record of ownership and licensing.
            </p>
          </div>

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
              className="py-4 bg-white/5 hover:bg-white/10 border-none rounded-2xl text-xs uppercase tracking-[0.2em] font-black"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              fullWidth 
              onClick={onConfirm}
              className="py-4 bg-accent-purple shadow-[0_0_20px_rgba(157,0,255,0.3)] hover:shadow-[0_0_30px_rgba(157,0,255,0.5)] rounded-2xl text-xs uppercase tracking-[0.2em] font-black"
            >
              Mint Track
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
