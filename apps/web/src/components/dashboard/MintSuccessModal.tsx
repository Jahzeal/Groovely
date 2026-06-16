'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ChevronDown, ChevronUp, ExternalLink, Check } from 'lucide-react';
import { POLYGONSCAN_BASE } from '@/lib/contracts';

interface MintSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToLibrary: () => void;
  trackData?: {
    title?: string;
    coverUrl?: string;
    txHash?: string;
    tokenId?: string;
  };
}

export function MintSuccessModal({ 
  isOpen, 
  onClose, 
  onGoToLibrary,
  trackData = {
    title: 'ETH',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    txHash: '0x8a7...f92b',
    tokenId: '#4829'
  }
}: MintSuccessModalProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-sm bg-[#0A0A1B] border border-white/10 rounded-[40px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-purple/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent-cyan/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          
          {/* Success Graphic - Circular Track Cover */}
          <div className="relative">
             <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-[0_0_40px_rgba(157,0,255,0.3)] bg-zinc-800">
                <img 
                  src={trackData.coverUrl} 
                  alt="Track Cover" 
                  className="w-full h-full object-cover"
                />
             </div>
             <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-accent-purple rounded-full flex items-center justify-center border-4 border-[#0A0A1B] shadow-lg">
                <Check size={20} className="text-white font-bold" />
             </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-white leading-tight">
              Track Uploaded & Minted Successfully
            </h2>
          </div>

          {/* Status Card */}
          <div className="w-full bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex items-center gap-6 group hover:bg-white/[0.05] transition-all">
             <div className="w-16 h-16 bg-zinc-800 rounded-xl overflow-hidden shrink-0">
                <img 
                  src={trackData.coverUrl} 
                  alt="Track Cover" 
                  className="w-full h-full object-cover opacity-60"
                />
             </div>
             <div className="flex-1 text-left space-y-2">
                <h3 className="text-xl font-black text-white">{trackData.title}</h3>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                   <div className="w-2 h-2 rounded-full bg-[#FF007A] animate-pulse" />
                   <span className="text-[9px] font-black tracking-widest text-zinc-300 uppercase">Your Track is Now Live</span>
                </div>
             </div>
          </div>

          {/* Transaction Details Toggle */}
          <div className="w-full">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-white/5 rounded-full border border-white/5 hover:bg-white/10 transition-colors group"
            >
              <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase group-hover:text-white transition-colors">Transaction Details</span>
              {showDetails ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showDetails ? 'max-h-40 mt-6 opacity-100' : 'max-h-0 opacity-0'}`}>
               <div className="bg-white/5 rounded-2xl p-5 space-y-4 border border-white/5 text-left">
                  <div className="flex justify-between items-center">
                     <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Transaction Hash</span>
                     <span className="text-[10px] font-black text-white font-mono">{trackData.txHash}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Token ID</span>
                     <span className="text-[10px] font-black text-white font-mono">{trackData.tokenId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Status</span>
                     <span className="text-[9px] font-black text-[#00FF85] uppercase tracking-widest">Confirmed</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 w-full pt-2">
            <Button 
              variant="secondary" 
              fullWidth 
              onClick={() => {
                if (trackData.txHash) {
                  window.open(`${POLYGONSCAN_BASE}${trackData.txHash}`, '_blank', 'noopener,noreferrer');
                }
              }}
              className="py-4 bg-white/5 hover:bg-white/10 border-none rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black leading-none"
            >
              View on Blockchain
            </Button>
            <Button 
              variant="primary" 
              fullWidth 
              onClick={onGoToLibrary}
              className="py-4 bg-accent-purple shadow-[0_0_20px_rgba(157,0,255,0.3)] hover:shadow-[0_0_30px_rgba(157,0,255,0.5)] rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black leading-none"
            >
              Go to Library
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
