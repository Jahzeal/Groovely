'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, ChevronDown, ChevronUp, ExternalLink, Library, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PaymentSuccessOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentSuccessOverlay = ({ isOpen, onClose }: PaymentSuccessOverlayProps) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Content Container */}
      <div className="relative w-full max-w-lg bg-[#050510] border border-white/10 rounded-[40px] p-10 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-500">
        
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent-purple/20 blur-[100px] pointer-events-none" />
        
        <div className="relative flex flex-col items-center text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 rounded-full bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 rounded-full border-2 border-accent-purple/50 animate-ping opacity-20" />
            <CheckCircle2 size={48} className="text-accent-purple" strokeWidth={1.5} />
          </div>

          <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase italic">Payment Successful</h2>
          <p className="text-zinc-500 text-sm font-bold mb-10 tracking-wide uppercase">Your transaction has been confirmed</p>

          {/* Purchased Item Card */}
          <div className="w-full bg-[#0F0F1A] border border-white/5 rounded-3xl p-5 flex items-center justify-between mb-8 group hover:border-white/10 transition-all">
            <div className="flex items-center gap-4 text-left">
              <div className="w-14 h-14 rounded-xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1514525253361-bee8d48800d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
                  alt="Track" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <h4 className="font-black text-white text-sm tracking-tight">Slow Lights on Third Street</h4>
                <p className="text-[10px] font-bold text-zinc-600">by Midnight Vibe</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <div className="w-4 h-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-[8px] font-black text-white/50 lowercase">eth</span>
                </div>
                <span className="text-sm font-black text-white">0.002</span>
              </div>
              <p className="text-[9px] font-bold text-zinc-700">(0.002)</p>
            </div>
          </div>

          {/* Transaction Details Dropdown */}
          <div className="w-full mb-10">
            <button 
              onClick={() => setDetailsOpen(!detailsOpen)}
              className="flex items-center justify-center gap-3 w-full py-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-white transition-colors">Transaction Details</span>
              {detailsOpen ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
            </button>
            
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${detailsOpen ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
              <div className="bg-[#050510] border border-white/5 rounded-2xl p-4 space-y-3 text-left">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-zinc-600 uppercase tracking-widest">Tx Hash:</span>
                  <div className="flex items-center gap-2 text-zinc-400 hover:text-white cursor-pointer transition-colors">
                    <span className="font-mono">0x7a...f92c</span>
                    <ExternalLink size={10} />
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-zinc-600 uppercase tracking-widest">Network:</span>
                  <span className="text-zinc-400 font-black">Polygon Mainnet</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-zinc-600 uppercase tracking-widest">Gas Fee:</span>
                  <span className="text-zinc-400 font-black">0.024 MATIC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Actions */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <Button 
              variant="secondary" 
              fullWidth 
              onClick={onClose}
              className="py-4 border border-white/5 hover:border-white/10 flex items-center justify-center gap-2 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Market
            </Button>
            <Button 
              fullWidth 
              className="py-4 bg-accent-purple shadow-[0_15px_30px_-5px_rgba(157,0,255,0.4)] flex items-center justify-center gap-2 group"
            >
              Go to Library
              <Library size={16} className="group-hover:scale-110 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
