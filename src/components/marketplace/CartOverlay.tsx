'use client';

import React, { useState } from 'react';
import { X, Trash2, Info, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCart } from './CartContext';

interface CartItem {
  id: string;
  title: string;
  creator: string;
  image: string;
  license: string;
  price: number;
}

const INITIAL_ITEMS: CartItem[] = [
  {
    id: '1',
    title: 'Slow Lights on Third Street',
    creator: 'Midnight Vibe',
    image: 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    license: 'Exclusive License',
    price: 0.002,
  },
  {
    id: '2',
    title: 'Neon Soul',
    creator: 'Midnight Vibe',
    image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    license: 'Non-Exclusive',
    price: 0.002,
  },
  {
    id: '3',
    title: 'Lagos at 2AM',
    creator: 'Groove Master',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    license: 'Beat Lease',
    price: 0.002,
  },
  {
    id: '4',
    title: 'After Rain',
    creator: 'Static Echo',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    license: 'Stems Included',
    price: 0.002,
  },
];

interface CartOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartOverlay = ({ isOpen, onClose }: CartOverlayProps) => {
  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS);
  const [currency, setCurrency] = useState<'MATIC' | 'USDC'>('MATIC');
  const [isProcessing, setIsProcessing] = useState(false);
  const { completePayment } = useCart();

  if (!isOpen) return null;

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const removeAll = () => {
    setItems([]);
  };

  const handlePay = () => {
    setIsProcessing(true);
    // Simulate network delay
    setTimeout(() => {
      setIsProcessing(false);
      completePayment();
    }, 2000);
  };

  const subtotal = items.reduce((acc, item) => acc + item.price, 0);
  const gasFee = 2.5; 
  const serviceFee = 1.0;
  const total = subtotal + gasFee + serviceFee; // This is a simplified calculation for display

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Content Container */}
      <div className="relative w-full max-w-6xl h-full flex flex-col bg-[#050510] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-10 py-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white/50">Number of items:</h2>
            <span className="text-xl font-black text-white">{items.length}</span>
          </div>
          <button 
            onClick={onClose}
            className="flex items-center gap-3 text-zinc-400 hover:text-white transition-all group"
          >
            <span className="text-sm font-black uppercase tracking-widest group-hover:mr-1 transition-all">Close</span>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10 group-active:scale-90 transition-all">
              <X size={20} strokeWidth={2.5} />
            </div>
          </button>
        </div>

        {/* Scrollable body grid */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] h-full">
            
            {/* Left Column: Items List */}
            <div className="p-10 border-r border-white/5">
              <div className="flex items-center justify-end mb-8">
                <button 
                  onClick={removeAll}
                  className="flex items-center gap-2 text-zinc-500 hover:text-red-400 transition-colors group"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">Remove all</span>
                  <Trash2 size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              <div className="space-y-6">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                       <ShoppingCart size={32} className="opacity-20" />
                    </div>
                    <p className="font-bold">Your cart is empty</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex items-center gap-6 group">
                      <div className="relative flex-1 bg-[#0F0F1A] border border-white/5 rounded-3xl p-5 hover:border-white/10 transition-all flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="text-lg font-black tracking-tight text-white mb-0.5">{item.title}</h4>
                            <p className="text-xs font-bold text-zinc-500 mb-3">{item.creator}</p>
                            <span className="text-[9px] font-black uppercase tracking-widest bg-accent-purple/10 text-accent-purple px-3 py-1 rounded-lg border border-accent-purple/20">
                              {item.license}
                            </span>
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-4">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1.5 mb-1">
                               <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                  <span className="text-[10px] font-black text-white/50 lowercase">eth</span>
                               </div>
                               <span className="text-xl font-black text-white">{item.price}</span>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-600">({item.price})</span>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="w-12 h-12 rounded-2xl bg-red-500/5 hover:bg-red-500/20 border border-red-500/10 flex items-center justify-center text-red-500/40 hover:text-red-500 transition-all active:scale-90"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="bg-[#080814] p-10 flex flex-col">
              <h3 className="text-xl font-black text-center mb-10 text-white tracking-tight">Order Summary</h3>

              <div className="bg-[#0F0F1A] border border-white/5 rounded-[32px] p-8 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-10">
                  <span className="text-lg font-bold text-zinc-400">Subtotal</span>
                  <div className="text-right">
                    <span className="text-xs font-bold text-zinc-500 mr-3">(${subtotal.toFixed(2)})</span>
                    <span className="text-lg font-black text-white">{subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mb-10">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-600">I'm paying with</span>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#050510] border border-white/5 rounded-2xl">
                    <button 
                      onClick={() => setCurrency('MATIC')}
                      className={`flex items-center justify-center gap-3 py-3 rounded-xl transition-all ${currency === 'MATIC' ? 'bg-white/5 text-white shadow-xl' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${currency === 'MATIC' ? 'border-accent-purple bg-accent-purple/20' : 'border-zinc-800'}`}>
                        {currency === 'MATIC' && <div className="w-1.5 h-1.5 rounded-full bg-white animate-in zoom-in" />}
                      </div>
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] font-black">M</div>
                      <span className="text-xs font-black uppercase tracking-widest">MATIC</span>
                    </button>
                    <button 
                      onClick={() => setCurrency('USDC')}
                      className={`flex items-center justify-center gap-3 py-3 rounded-xl transition-all ${currency === 'USDC' ? 'bg-white/5 text-white shadow-xl' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${currency === 'USDC' ? 'border-accent-purple bg-accent-purple/20' : 'border-zinc-800'}`}>
                        {currency === 'USDC' && <div className="w-1.5 h-1.5 rounded-full bg-white animate-in zoom-in" />}
                      </div>
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] font-black text-blue-400">U</div>
                      <span className="text-xs font-black uppercase tracking-widest">USDC</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-6 mb-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Info size={16} />
                      <span className="text-sm font-bold">Gas Fee (est.)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-zinc-500 mr-3">($3.26)</span>
                      <span className="text-md font-black text-white">2.5</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-400">Service Fee</span>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-zinc-500 mr-3">($3.26)</span>
                      <span className="text-md font-black text-white">1.0</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between mb-10">
                  <span className="text-lg font-bold text-white">Total</span>
                  <div className="text-right">
                    <span className="text-xs font-bold text-zinc-500 mr-3">($3.26)</span>
                    <span className="text-2xl font-black text-white tracking-tight">{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] text-zinc-600 text-center leading-relaxed">
                    Once you click the "Confirm & Pay" button, You will confirm or cancel the transaction from your wallet
                  </p>
                  <Button 
                    fullWidth 
                    onClick={handlePay}
                    disabled={isProcessing || items.length === 0}
                    className="py-5 shadow-[0_20px_40px_-10px_rgba(157,0,255,0.4)] flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Confirm & Pay'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info line */}
        <div className="py-6 bg-[#050510] border-t border-white/5 flex items-center justify-center">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700">
             NOTE: Refunds are not possible on blockchain transactions
           </p>
        </div>
      </div>
    </div>
  );
};

// Simple icon wrapper for the empty state
const ShoppingCart = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
