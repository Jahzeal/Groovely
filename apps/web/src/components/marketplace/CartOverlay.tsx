'use client';

import React, { useState } from 'react';
import { X, Trash2, Info, Check, Loader2, ShoppingCart, ExternalLink, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCart } from './CartContext';
import { useRouter } from 'next/navigation';
import { useAccount, useConfig, useSwitchChain } from 'wagmi';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { useWallets } from '@privy-io/react-auth';
import { parseUnits } from 'viem';
import {
  approveUSDC,
  mintEdition,
  waitForTx,
  checkUSDCAllowance,
  checkUSDCBalance,
  parseUSDC,
  CONTRACT_ADDRESS,
  POLYGONSCAN_BASE
} from '@/lib/contracts';
import { apiFetch, resolveIpfsUrl } from '@/lib/api';
import { useMusicPlayer } from './MusicPlayerContext';
import { formatBlockchainError } from '@/lib/blockchainError';
import toast from 'react-hot-toast';

const isMainnet = process.env.NEXT_PUBLIC_CHAIN_ID === '137';
const targetChain = isMainnet ? polygon : polygonAmoy;
const targetChainName = isMainnet ? 'Polygon Mainnet' : 'Polygon Amoy Testnet';

interface CartOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartOverlay = ({ isOpen, onClose }: CartOverlayProps) => {
  const { cartItems, removeFromCart, clearCart, completePayment } = useCart();
  const [currency, setCurrency] = useState<'USDC' | 'POL'>('USDC');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  const router = useRouter();
  const config = useConfig();
  const { address, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { wallets } = useWallets();
  const { addPurchasedTrack } = useMusicPlayer();

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) || 1.0), 0);
  const total = subtotal;

  const handlePay = async () => {
    if (cartItems.length === 0) return;

    if (!address) {
      toast.error('Please connect your Web3 wallet to complete checkout');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Checking network and wallet...');

    try {
      // 1. Enforce correct chain
      const requiredChainId = targetChain.id;
      const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy');

      if (embeddedWallet) {
        if (embeddedWallet.chainId !== `eip155:${requiredChainId}`) {
          try {
            await embeddedWallet.switchChain(requiredChainId);
          } catch (err: any) {
            throw new Error(`Please switch wallet to ${targetChainName}.`);
          }
        }
      } else if (chain?.id !== requiredChainId) {
        try {
          await switchChainAsync({ chainId: requiredChainId });
        } catch (err: any) {
          throw new Error(`Please switch wallet to ${targetChainName}.`);
        }
      }

      // 2. Check USDC Balance
      setStatusMessage('Checking USDC balance...');
      const requiredUsdcRaw = parseUSDC(total);
      const balance = await checkUSDCBalance(config, address);

      if (balance < requiredUsdcRaw) {
        throw new Error(
          `Insufficient USDC balance. You need at least $${total.toFixed(2)} USDC, but your wallet has $${(Number(balance) / 1e6).toFixed(2)} USDC.`
        );
      }

      // 3. Check / Approve USDC Allowance
      setStatusMessage('Checking USDC approval...');
      const allowance = await checkUSDCAllowance(config, address);

      if (allowance < requiredUsdcRaw) {
        setStatusMessage('Approving USDC on Polygon...');
        const maxAllowance = parseUnits('1000000', 6);
        const approveTx = await approveUSDC(config, maxAllowance);
        setStatusMessage('Waiting for approval confirmation...');
        await waitForTx(config, approveTx);
      }

      // 4. Sequential Minting for Cart Items
      let lastTxHash = '';
      const purchasedReceiptItems = [];

      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        setStatusMessage(`Minting track ${i + 1} of ${cartItems.length}: "${item.title}"...`);

        // Resolve edition IDs if needed
        let editionId = item.editionId;
        let contractEditionId = item.contractEditionId;

        if (!editionId || !contractEditionId) {
          try {
            const trackRes = await apiFetch(`/api/track/${item.trackId || item.id}`);
            if (trackRes && trackRes.ok) {
              const trackData = await trackRes.json();
              const editions = trackData.editions || trackData.data?.editions || [];
              if (editions.length > 0) {
                editionId = editions[0].id;
                contractEditionId = editions[0].contract_edition_id ?? editions[0].contractEditionId ?? 7;
              }
            }
          } catch (e) {
            console.error('Failed to resolve edition details for item', item.title, e);
          }
        }

        if (!contractEditionId) {
          contractEditionId = 7; // Fallback standard contract edition token ID
        }

        // On-chain mint transaction
        const mintTx = await mintEdition(config, contractEditionId, 1);
        lastTxHash = mintTx;

        setStatusMessage(`Confirming transaction for "${item.title}"...`);
        const receipt = await waitForTx(config, mintTx);

        let derivedTokenId = contractEditionId;
        try {
          const transferLog = receipt.logs.find(
            (log) => log.topics[0] === '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62'
          );
          if (transferLog && transferLog.topics[3]) {
            derivedTokenId = parseInt(transferLog.topics[3], 16);
          }
        } catch (_) {}

        // Backend Confirmation in Database
        try {
          await apiFetch('/api/mint/confirm', {
            method: 'POST',
            skipAuthRedirect: true,
            body: JSON.stringify({
              edition_id: editionId || 29,
              tx_hash: mintTx,
              token_id: derivedTokenId,
              buyer_wallet: address,
              license_type: 'standard',
            }),
          });
        } catch (syncErr) {
          console.warn('Backend sync notice:', syncErr);
        }

        // Add to local purchased state
        if (item.trackId) {
          addPurchasedTrack(Number(item.trackId));
        }

        purchasedReceiptItems.push({
          ...item,
          editionId,
          contractEditionId: derivedTokenId
        });
      }

      toast.success('All items minted successfully!');
      completePayment({
        items: purchasedReceiptItems.length > 0 ? purchasedReceiptItems : cartItems,
        txHash: lastTxHash,
        totalUsdc: total
      });

    } catch (err: any) {
      console.error('Cart checkout error:', err);
      const formatted = formatBlockchainError(err, { action: 'mint', requiredUsdc: total });
      toast.error(formatted.message || 'Checkout failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-10">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={isProcessing ? undefined : onClose}
      />

      {/* Content Container */}
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-[#0b0e17] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <h2 className="text-base sm:text-lg font-bold text-zinc-400">Cart Items:</h2>
            <span className="text-base sm:text-lg font-black text-white px-2.5 py-0.5 bg-accent-purple/20 border border-accent-purple/30 rounded-full">
              {cartItems.length}
            </span>
          </div>
          <button 
            disabled={isProcessing}
            onClick={onClose}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all group cursor-pointer disabled:opacity-50"
          >
            <span className="text-xs font-black uppercase tracking-widest group-hover:mr-0.5 transition-all">Close</span>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-all">
              <X size={16} strokeWidth={2.5} />
            </div>
          </button>
        </div>

        {/* Scrollable body grid */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] min-h-[360px]">
            
            {/* Left Column: Items List */}
            <div className="p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Your Selection</h3>
                {cartItems.length > 0 && !isProcessing && (
                  <button 
                    onClick={clearCart}
                    className="flex items-center gap-1.5 text-zinc-500 hover:text-red-400 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-zinc-500 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/5">
                       <ShoppingCart size={28} className="opacity-30 text-white" />
                    </div>
                    <p className="font-bold text-white text-sm mb-1">Your cart is empty</p>
                    <p className="text-xs text-zinc-500 max-w-xs mb-6">Explore the marketplace to add tracks, beats, and podcasts to your cart.</p>
                    <button
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl bg-accent-purple text-white text-xs font-black uppercase tracking-wider hover:bg-accent-purple/90 transition-all shadow-lg cursor-pointer"
                    >
                      Browse Marketplace
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 sm:gap-4 group bg-[#121829] border border-white/5 rounded-2xl p-3 sm:p-4 hover:border-accent-purple/30 transition-all">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shadow-md shrink-0 bg-black/40 border border-white/5">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-black tracking-tight text-white truncate">{item.title}</h4>
                        <p className="text-xs text-zinc-400 font-medium truncate mb-1">{item.creator}</p>
                        <span className="text-[9px] font-black uppercase tracking-widest bg-accent-purple/10 text-accent-purple px-2 py-0.5 rounded-md border border-accent-purple/20">
                          {item.license}
                        </span>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-3">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-black text-accent-cyan">${Number(item.price).toFixed(2)} USDC</span>
                        </div>
                        
                        {!isProcessing && (
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 transition-all cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Checkout Summary */}
            <div className="p-6 sm:p-8 bg-white/[0.01] flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6">Payment Summary</h3>

                {/* Currency Selection */}
                <div className="mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 block">Payment Currency</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCurrency('USDC')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        currency === 'USDC'
                          ? 'bg-accent-purple/20 border-accent-purple text-white'
                          : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      USDC (Polygon)
                    </button>
                    <button
                      onClick={() => setCurrency('POL')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        currency === 'POL'
                          ? 'bg-accent-purple/20 border-accent-purple text-white'
                          : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      POL / MATIC
                    </button>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-2.5 py-4 border-y border-white/5 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span className="font-bold text-white">${subtotal.toFixed(2)} USDC</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Network Fee</span>
                    <span className="font-bold text-zinc-400 text-[11px]">Paid in POL by wallet</span>
                  </div>
                  <div className="flex justify-between text-sm font-black pt-2 text-white border-t border-white/5">
                    <span>Total Amount</span>
                    <span className="text-accent-cyan">${total.toFixed(2)} USDC</span>
                  </div>
                </div>

                {/* Live Processing Indicator */}
                {isProcessing && statusMessage && (
                  <div className="mt-4 p-3 rounded-xl bg-accent-purple/10 border border-accent-purple/30 flex items-center gap-2 text-xs text-accent-cyan font-bold animate-pulse">
                    <Loader2 size={14} className="animate-spin text-accent-purple shrink-0" />
                    <span className="truncate">{statusMessage}</span>
                  </div>
                )}
              </div>

              {/* Checkout Action */}
              <div className="pt-6">
                <button
                  disabled={cartItems.length === 0 || isProcessing}
                  onClick={handlePay}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl ${
                    cartItems.length === 0
                      ? 'bg-white/5 text-zinc-600 border border-white/5 cursor-not-allowed'
                      : 'bg-accent-purple hover:bg-accent-purple/90 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-[1.01]'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{statusMessage || 'Processing Web3 Checkout...'}</span>
                    </>
                  ) : (
                    <>
                      <Wallet size={16} />
                      <span>Mint & Purchase · ${total.toFixed(2)} USDC</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-zinc-500 font-bold uppercase tracking-wider mt-3">
                  Secured on Polygon Bor Blockchain
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
