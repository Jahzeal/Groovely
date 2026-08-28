'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, ChevronDown, ChevronUp, ExternalLink, Library, ArrowLeft, Disc } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { POLYGONSCAN_BASE } from '@/lib/contracts';
import { CartItem } from './CartContext';

interface PaymentSuccessOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  receipt?: {
    items: CartItem[];
    txHash: string;
    totalUsdc: number;
  };
}

export const PaymentSuccessOverlay = ({ isOpen, onClose, receipt }: PaymentSuccessOverlayProps) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const items = receipt?.items || [];
  const total = receipt?.totalUsdc || 0;
  const txHash = receipt?.txHash || '';
  const explorerUrl = txHash ? `${POLYGONSCAN_BASE}/tx/${txHash}` : '#';

  const handleGoToLibrary = () => {
    onClose();
    router.push('/library');
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Content Container */}
      <div className="relative w-full max-w-lg bg-[#070a14] border border-white/10 rounded-[36px] p-6 sm:p-8 overflow-hidden shadow-[0_0_80px_rgba(139,92,246,0.3)] animate-in fade-in zoom-in duration-300">
        
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent-purple/20 blur-[100px] pointer-events-none" />
        
        <div className="relative flex flex-col items-center text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-accent-purple/10 border border-accent-purple/30 flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-full border-2 border-accent-purple/50 animate-ping opacity-20" />
            <CheckCircle2 size={40} className="text-accent-purple" strokeWidth={2} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white mb-1.5 tracking-tight uppercase">
            Payment Successful!
          </h2>
          <p className="text-zinc-400 text-xs font-bold mb-6 tracking-wider uppercase">
            Your on-chain license has been confirmed
          </p>

          {/* Purchased Items List */}
          <div className="w-full max-h-56 overflow-y-auto space-y-2.5 mb-6 pr-1 custom-scrollbar">
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="w-full bg-[#0d1222] border border-white/5 rounded-2xl p-3 flex items-center justify-between group hover:border-accent-purple/30 transition-all text-left"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md bg-black/40 shrink-0 border border-white/10">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-white text-xs tracking-tight truncate">{item.title}</h4>
                    <p className="text-[11px] font-medium text-zinc-400 truncate">{item.creator}</p>
                    <span className="text-[8px] font-black uppercase tracking-widest text-accent-cyan">
                      {item.license || 'Licensed Edition'}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-white">${Number(item.price || 1).toFixed(2)} USDC</span>
                </div>
              </div>
            ))}
          </div>

          {/* Transaction Summary Details */}
          <div className="w-full mb-6">
            <button 
              onClick={() => setDetailsOpen(!detailsOpen)}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer group"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                Transaction Details
              </span>
              {detailsOpen ? <ChevronUp size={14} className="text-zinc-400" /> : <ChevronDown size={14} className="text-zinc-400" />}
            </button>
            
            {detailsOpen && (
              <div className="bg-[#050811] border border-white/5 rounded-2xl p-4 mt-2.5 space-y-2.5 text-left text-xs animate-in fade-in duration-200">
                {txHash && (
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Tx Hash:</span>
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-accent-cyan hover:underline font-mono text-[11px]"
                    >
                      <span>{txHash.slice(0, 8)}...{txHash.slice(-6)}</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Network:</span>
                  <span className="text-zinc-300 font-bold text-[11px]">Polygon Network</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">Total Paid:</span>
                  <span className="text-accent-cyan font-black text-xs">${total.toFixed(2)} USDC</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button 
              variant="secondary" 
              fullWidth 
              onClick={onClose}
              className="py-3 text-xs font-bold border border-white/10 hover:border-white/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Market</span>
            </Button>
            <Button 
              fullWidth 
              onClick={handleGoToLibrary}
              className="py-3 text-xs font-black bg-accent-purple hover:bg-accent-purple/90 shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center justify-center gap-2 cursor-pointer text-white"
            >
              <span>Go to Library</span>
              <Library size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
