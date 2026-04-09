'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MarketTopBar } from '@/components/marketplace/MarketTopBar';
import { TrackCard } from '@/components/marketplace/TrackCard';
import { MusicPlayer } from '@/components/marketplace/MusicPlayer';
import { Button } from '@/components/ui/Button';
import { 
  ChevronLeft, 
  ShoppingCart, 
  Search, 
  Bell, 
  ChevronDown, 
  Play,
  Share2,
  ExternalLink,
  Copy,
  Info
} from 'lucide-react';
import { CartProvider, useCart } from '@/components/marketplace/CartContext';

const MOCK_TRACK = {
  id: '1',
  title: 'Slow Lights on Third Street',
  creator: 'Midnight Vibe',
  handle: '@midnightvibe',
  image: 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  price: '0.002',
  priceUsd: '7.32',
  bpm: '128',
  key: 'A#',
  duration: '2:30',
  fileType: 'WAV',
  nftId: '1erg4ghh87jggh8m',
  royalty: '60%',
  licenses: ['License', 'License', 'License']
};

const SIMILAR_TRACKS = [
  {
    title: 'Sabi Sabi',
    creator: 'Groove Master',
    image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    licenseTypes: ['Afrobeats', 'Lease'],
    price: '0.06 ETH',
    currency: '$101',
  },
  {
    title: 'Lagos at 2AM',
    creator: 'DJ Spectra',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    licenseTypes: ['Beat', 'Stems'],
    price: '0.09 ETH',
    currency: '$151',
  },
  {
    title: 'Burnt Orange Ep. 5',
    creator: 'The Podcast Lab',
    image: 'https://images.unsplash.com/photo-1478737270197-497851a1f29d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    licenseTypes: ['Podcast', 'License'],
    price: '0.03 ETH',
    currency: '$50',
  },
  {
    title: 'No Wahala, Just Vibes',
    creator: 'Static Echo',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    licenseTypes: ['Skit', 'Non-Excl.'],
    price: '0.02 ETH',
    currency: '$33',
  },
];

export default function ProductDetailPage() {
  const router = useRouter();

  return (
    <CartProvider>
      <div className="flex min-h-screen bg-[#050510] text-white font-sans selection:bg-accent-cyan selection:text-black">
        <Sidebar activePage="market" />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Customized Top Bar for Detail Page */}
          <header className="flex items-center justify-between px-10 py-5 bg-[#050510]/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
            <div className="flex items-center gap-6 flex-1">
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                  <ChevronLeft size={18} />
                </div>
                <span className="text-sm font-bold">Back</span>
              </button>

              <div className="relative flex-1 max-w-md group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-accent-purple transition-colors">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-[#0F0F1A] border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-xs font-medium focus:outline-none focus:border-accent-purple/50 transition-all placeholder-zinc-600"
                />
              </div>
            </div>

            <HeaderActions />
          </header>

          <main className="flex-1 overflow-y-auto pb-32">
            {/* Hero Section */}
            <div className="relative h-[450px] w-full overflow-hidden">
              <img 
                src={MOCK_TRACK.image} 
                alt={MOCK_TRACK.title} 
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-[#050510]/40 to-transparent" />
              
              {/* Play Button Over Hero */}
              <div className="absolute bottom-10 right-10">
                <button className="w-20 h-20 bg-accent-purple rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(157,0,255,0.6)] hover:scale-105 transition-all">
                  <Play size={32} fill="white" className="ml-2" />
                </button>
              </div>

              {/* Title */}
              <div className="absolute bottom-10 left-10">
                <h1 className="text-6xl font-black tracking-tighter text-white mb-2">{MOCK_TRACK.title}</h1>
              </div>
            </div>

            <div className="px-10 py-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
              {/* Left Content */}
              <div className="space-y-12">
                {/* Description */}
                <section>
                  <h3 className="text-lg font-black uppercase tracking-widest text-zinc-500 mb-6">Description</h3>
                  <p className="text-zinc-400 leading-relaxed max-w-3xl">
                    {MOCK_TRACK.description}
                  </p>
                </section>

                {/* Technical Data */}
                <section>
                  <h3 className="text-lg font-black uppercase tracking-widest text-zinc-500 mb-6">Technical Data</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'BPM', value: MOCK_TRACK.bpm, isTag: true },
                      { label: 'Key', value: MOCK_TRACK.key, isTag: true },
                      { label: 'Duration', value: MOCK_TRACK.duration, isTag: true },
                      { label: 'File Type', value: MOCK_TRACK.fileType, isTag: true },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider whitespace-nowrap">{item.label}:</span>
                        <div className="bg-[#0F0F1A] border border-white/5 rounded-lg px-6 py-2.5 text-xs font-black text-white min-w-[80px] text-center">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 flex items-center gap-4">
                     <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">NFT ID:</span>
                     <div className="bg-[#0F0F1A] border border-white/5 rounded-lg px-6 py-2.5 text-xs font-black text-white/70 font-mono">
                       {MOCK_TRACK.nftId}
                     </div>
                  </div>
                </section>

                {/* Creator Info */}
                <section className="bg-[#0F0F1A]/50 border border-white/5 rounded-3xl p-8 max-w-2xl">
                  <h3 className="text-lg font-black uppercase tracking-widest text-zinc-500 mb-8">Creator Info</h3>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-zinc-800 overflow-hidden border-2 border-white/5">
                      <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-4xl font-black text-white/20">
                        {MOCK_TRACK.creator[0]}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-white mb-1">{MOCK_TRACK.creator}</h4>
                      <p className="text-zinc-500 font-bold mb-4">{MOCK_TRACK.handle}</p>
                      <Button variant="secondary" className="px-5 py-2 text-xs rounded-xl">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </section>

                {/* More From This Creator */}
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black uppercase tracking-widest text-zinc-500">More from this Creator</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-5">
                    {SIMILAR_TRACKS.map((track, i) => (
                      <TrackCard key={i} {...track} />
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Sidebar */}
              <aside className="space-y-6">
                <PurchaseSidebar />
              </aside>
            </div>

            {/* Bottom Footer Details */}
            <footer className="px-10 py-10 border-t border-white/5 opacity-40 hover:opacity-100 transition-opacity flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
              <div className="flex gap-8">
                <a href="#" className="hover:text-white transition-colors">About Groovely</a>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
              </div>
              <div className="flex gap-4">
                <Share2 size={16} />
                <ExternalLink size={16} />
                <Copy size={16} />
              </div>
            </footer>
          </main>
        </div>

        <MusicPlayer />
      </div>

      <style jsx>{`
        .divider-text {
          position: relative;
        }
        .divider-text::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(255, 255, 255, 0.05);
          z-index: 0;
        }
        .divider-text span {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </CartProvider>
  );
}

const HeaderActions = () => {
  const { openCart } = useCart();
  return (
    <div className="flex items-center gap-5 ml-8">
      <button className="text-zinc-500 hover:text-white transition-colors">
        <Bell size={20} />
      </button>
      <button 
        onClick={openCart}
        className="text-zinc-500 hover:text-white transition-colors"
      >
        <ShoppingCart size={20} />
      </button>
      <div className="flex items-center gap-3 bg-[#0F0F1A] border border-white/5 rounded-xl px-4 py-2 hover:bg-white/5 cursor-pointer transition-all">
        <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/10">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="Wallet" className="w-full h-full object-contain" />
        </div>
        <span className="text-[11px] font-black tracking-tight text-white/90">0xc...y69</span>
        <ChevronDown size={12} className="text-zinc-500" />
      </div>
    </div>
  );
};

const PurchaseSidebar = () => {
  const { openCart } = useCart();
  return (
    <div className="bg-[#0F0F1A] border border-white/5 rounded-3xl p-8 sticky top-32">
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="w-5 h-5 rounded-full bg-accent-purple/30 border border-accent-purple/50 flex items-center justify-center">
          <span className="text-[10px] text-accent-purple font-black">Ξ</span>
        </div>
        <span className="text-sm font-bold text-zinc-400">ETH</span>
      </div>
      
      <div className="text-center mb-8">
        <div className="text-4xl font-black tracking-tight text-white mb-1">{MOCK_TRACK.price}</div>
        <div className="text-zinc-500 font-bold text-sm">(${MOCK_TRACK.priceUsd})</div>
      </div>

      <Button 
        fullWidth 
        onClick={openCart}
        className="mb-8 flex items-center justify-center gap-2"
      >
        <ShoppingCart size={18} />
        Add to Cart
      </Button>

      <div className="space-y-6">
        <div>
          <div className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 divider-text">
            <span className="bg-[#0F0F1A] px-4 -mt-px">Licenses</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {MOCK_TRACK.licenses.map((lic, i) => (
              <div key={i} className="bg-[#050510] border border-white/5 rounded-xl py-3 px-4 text-center text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer">
                {lic}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 divider-text">
            <span className="bg-[#0F0F1A] px-4 -mt-px">Royalty (%)</span>
          </div>
          <div className="bg-[#050510] border border-white/5 rounded-xl py-4 px-6 text-2xl font-black text-accent-purple text-center">
            {MOCK_TRACK.royalty}
          </div>
        </div>
      </div>
    </div>
  );
};
