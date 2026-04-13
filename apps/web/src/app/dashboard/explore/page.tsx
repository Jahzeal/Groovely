'use client';

import React from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MarketTopBar } from '@/components/marketplace/MarketTopBar';
import { ExploreNav } from '@/components/explore/ExploreNav';
import { ExploreHero } from '@/components/explore/ExploreHero';
import { ExploreCard } from '@/components/explore/ExploreCard';
import { CreatorCard } from '@/components/explore/CreatorCard';
import { MusicPlayer } from '@/components/marketplace/MusicPlayer';
import { CartProvider } from '@/components/marketplace/CartContext';
import { Twitter, Instagram } from '@/components/ui/SocialIcons';
import { Send, Disc } from 'lucide-react';

const TRENDING_NOW = [
  {
    title: 'Ripples in the Sand Dunes',
    artist: 'The Owl',
    image: 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Paper Cranes in the Wind',
    artist: 'The Professor',
    image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Frozen Symphony of the Winter...',
    artist: 'Gentleman',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Puzzle',
    artist: 'Cowboy',
    image: 'https://images.unsplash.com/photo-1478737270197-497851a1f29d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
];

const CREATORS = [
  { name: 'Seyi Phantom', role: 'Producer', image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
  { name: 'Luca Blaze', role: 'Musician', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
  { name: 'Oba', role: 'Skit Maker', image: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
  { name: 'Felix', role: 'Podcaster', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
  { name: 'Damian Flux', role: 'DJ', image: 'https://images.unsplash.com/photo-1611042553365-9b101441c135?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
];

const RECOMMENDED = [
  {
    title: 'Waltzing with Shadows',
    artist: 'Action Dan',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Conversations with Moonlit Owls',
    artist: 'Miami',
    image: 'https://images.unsplash.com/photo-1526218626217-dc65a29bb444?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Rustic Symphony in the Forest',
    artist: 'Devilfish',
    image: 'https://images.unsplash.com/photo-1453090927415-5f45085b65c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'The Haunting',
    artist: 'El Matador',
    image: 'https://images.unsplash.com/photo-1493225457224-ca2cf0012543?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
];

const RECENTLY_ADDED = [
  {
    title: 'The Unwritten Letters of Venice',
    artist: 'Gigabet',
    image: 'https://images.unsplash.com/photo-1485603348612-40db7f90bbbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Flickering Neon Love',
    artist: 'The Mathematician',
    image: 'https://images.unsplash.com/photo-1483392707171-cb3e46b04889?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Whirlwind Symphony',
    artist: 'The Shark',
    image: 'https://images.unsplash.com/photo-1478737270197-497851a1f29d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Ballad',
    artist: 'Kid Poker',
    image: 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
];

export default function ExplorePage() {
  return (
    <CartProvider>
      <div className="flex min-h-screen bg-[#050510] text-white font-sans selection:bg-accent-purple selection:text-white">
        {/* We use role="fan" here to show the correct menu */}
        <Sidebar activePage="explore" role="fan" />

        <div className="flex-1 flex flex-col min-w-0">
          <MarketTopBar />
          <ExploreNav />

          <main className="flex-1 overflow-y-auto pb-24">
            <div className="p-8 pt-4">
              <ExploreHero />

              {/* Trending Now */}
              <div className="mb-12">
                <h2 className="text-xl font-black text-white mb-6 tracking-tight">Trending Now</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {TRENDING_NOW.map((item, i) => (
                    <ExploreCard key={i} {...item} />
                  ))}
                </div>
              </div>

              {/* Creators */}
              <div className="mb-12">
                <h2 className="text-xl font-black text-white mb-6 tracking-tight">Creators</h2>
                <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-4">
                  {CREATORS.map((creator, i) => (
                    <div key={i} className="min-w-[140px] shrink-0">
                      <CreatorCard {...creator} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended For You */}
              <div className="mb-12">
                <h2 className="text-xl font-black text-white mb-6 tracking-tight">Recommended For You</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {RECOMMENDED.map((item, i) => (
                    <ExploreCard key={i} {...item} />
                  ))}
                </div>
              </div>

              {/* Recently Added */}
              <div className="mb-16">
                <h2 className="text-xl font-black text-white mb-6 tracking-tight">Recently Added</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {RECENTLY_ADDED.map((item, i) => (
                    <ExploreCard key={i} {...item} />
                  ))}
                </div>
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
                  <a href="#" className="hover:text-accent-purple transition-colors">Feedback</a>
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
