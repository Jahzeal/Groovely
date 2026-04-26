'use client';

import React from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MarketTopBar } from '@/components/marketplace/MarketTopBar';
import { GenreBar } from '@/components/marketplace/GenreBar';
import { FeaturedCarousel } from '@/components/marketplace/FeaturedCarousel';
import { TrendingPanel } from '@/components/marketplace/TrendingPanel';
import { TrackCard } from '@/components/marketplace/TrackCard';
import { MusicPlayer } from '@/components/marketplace/MusicPlayer';
import { Twitter, Instagram } from '@/components/ui/SocialIcons';
import { Send, Disc } from 'lucide-react';

const FOR_YOU = [
  {
    title: 'Slow Lights on Third Street',
    creator: 'Midnight Vibe',
    image: 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    licenseTypes: ['Music', 'Exclusive'],
    price: '0.12 ETH',
    currency: '$202',
  },
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
  {
    title: 'Midnight Bounce',
    creator: 'Synth Wave',
    image: 'https://images.unsplash.com/photo-1526218626217-dc65a29bb444?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    licenseTypes: ['Sample', 'Exclusive'],
    price: '0.15 ETH',
    currency: '$252',
  },
];

import { CartProvider } from '@/components/marketplace/CartContext';

export default function MarketplacePage() {
  return (
    <CartProvider>
      <div className="flex h-screen overflow-hidden bg-[#050510] text-white font-sans selection:bg-accent-cyan selection:text-black">
        <Sidebar activePage="market" />

        <div className="flex-1 flex flex-col min-w-0">
          <MarketTopBar />
          <GenreBar />

          {/* Main scrollable area */}
          <main className="flex-1 overflow-y-auto pb-24">
            <div className="p-8 pt-4">
              {/* Featured + Trending two-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mb-4">
                <FeaturedCarousel />
                <TrendingPanel />
              </div>

              {/* For You section */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-black uppercase tracking-widest text-white">For You</h2>
                <button className="text-accent-purple text-xs font-bold uppercase tracking-widest hover:underline transition-all">
                  See All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-16">
                {FOR_YOU.map((track, i) => (
                  <TrackCard key={i} {...track} />
                ))}
              </div>

              {/* Footer */}
              <footer className="py-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-60 hover:opacity-100 transition-opacity">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <a href="#" className="hover:text-accent-purple transition-colors">About Groovely</a>
                  <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                  <a href="#" className="hover:text-accent-purple transition-colors">Privacy Policy</a>
                  <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                  <a href="#" className="hover:text-accent-purple transition-colors">Terms of Use</a>
                  <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                  <a href="#" className="hover:text-accent-purple transition-colors">Docs/Developer API</a>
                  <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                  <a href="#" className="hover:text-accent-cyan transition-colors text-accent-cyan">Feedback</a>
                </div>
                <div className="flex items-center gap-6 text-zinc-500">
                  <a href="#" className="hover:text-white transition-all hover:scale-110"><Twitter size={17} /></a>
                  <a href="#" className="hover:text-white transition-all hover:scale-110"><Disc size={17} /></a>
                  <a href="#" className="hover:text-white transition-all hover:scale-110"><Send size={17} /></a>
                  <a href="#" className="hover:text-white transition-all hover:scale-110"><Instagram size={17} /></a>
                </div>
              </footer>
            </div>
          </main>
        </div>

        {/* Bottom Music Player */}
        <MusicPlayer />
      </div>
    </CartProvider>
  );
}
