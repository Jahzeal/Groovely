'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Play,
  Heart,
  ShoppingBag,
  MoreVertical,
  Send,
  Music
} from 'lucide-react';
import { Twitter, Instagram } from '@/components/ui/SocialIcons';

// --- Mock Data ---

const libraryTracks = [
  { id: 1, title: "Phoenix Feather Waltz", artist: "NightWhisper", status: "Purchased", image: "https://images.unsplash.com/photo-1514525253361-bee8d48800d5?w=300&h=300&fit=crop" },
  { id: 2, title: "Eternity's Echoes", artist: "SilentShadow", status: "Played", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop" },
  { id: 3, title: "Resonance of the Lost Li...", artist: "Vanilla", status: "Saved", image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop" },
  { id: 4, title: "The Vanishing Point", artist: "SolarChill", status: "Saved", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop" },
  { id: 5, title: "Paper Cranes in the Wind", artist: "Nebula", status: "Purchased", image: "https://images.unsplash.com/photo-1526218626217-dc65a29bb444?w=300&h=300&fit=crop" },
  { id: 6, title: "Dreams of the Melting Sun", artist: "Infinity", status: "Played", image: "https://images.unsplash.com/photo-1459749411177-042180ce673c?w=300&h=300&fit=crop" },
  { id: 7, title: "Echoes from the Halcy...", artist: "Vertigo", status: "Saved", image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop" },
  { id: 8, title: "An Intricate Dance of Cr...", artist: "SteelRhythm", status: "Played", image: "https://images.unsplash.com/photo-1483412033650-1015ddeb81d1?w=300&h=300&fit=crop" },
  { id: 9, title: "Portrait of a Sleeping Gal...", artist: "LunaSky", status: "Saved", image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&h=300&fit=crop" },
  { id: 10, title: "The Haunted Sonata", artist: "NovaZephyr", status: "Saved", image: "https://images.unsplash.com/photo-1420161907993-961fbcf21204?w=300&h=300&fit=crop" },
  { id: 11, title: "Lullabies from the Anci...", artist: "Serene", status: "Played", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop" },
  { id: 12, title: "Fossilized Emotions", artist: "Enchanted", status: "Purchased", image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=300&h=300&fit=crop" },
  { id: 13, title: "Eons", artist: "NeoPixel", status: "Purchased", image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&h=300&fit=crop" },
  { id: 14, title: "Ghostly Ballet at Dawn", artist: "CyberWitch", status: "Saved", image: "https://images.unsplash.com/photo-1514525253361-bee8d48800d5?w=300&h=300&fit=crop" },
  { id: 15, title: "Jade Starlight Serenade", artist: "EmberFire", status: "Played", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop" },
  { id: 16, title: "Rustic Symphony in the...", artist: "AquaDawn", status: "Played", image: "https://images.unsplash.com/photo-1459749411177-042180ce673c?w=300&h=300&fit=crop" },
  { id: 17, title: "Bittersweet Tango with...", artist: "Electric", status: "Saved", image: "https://images.unsplash.com/photo-1526218626217-dc65a29bb444?w=300&h=300&fit=crop" },
  { id: 18, title: "Zephyr's Twilight Sere...", artist: "DawnChase", status: "Purchased", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop" },
  { id: 19, title: "The Aurora's Secret So...", artist: "ChocoHaze", status: "Saved", image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop" },
  { id: 20, title: "Journey through the Ep...", artist: "Echo", status: "Purchased", image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&h=300&fit=crop" },
  { id: 21, title: "Twilight Cathedral", artist: "Vapor", status: "Saved", image: "https://images.unsplash.com/photo-1483412033650-1015ddeb81d1?w=300&h=300&fit=crop" },
];

const FilterTab = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 text-sm font-bold tracking-tight transition-all relative ${
      active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
    }`}
  >
    {label}
    {active && (
      <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-accent-purple rounded-full" />
    )}
  </button>
);

const TrackCard = ({ track }: { track: typeof libraryTracks[0] }) => (
  <div className="bg-[#0F0F1A]/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4 group hover:bg-[#0F0F1A]/60 transition-all duration-300 hover:border-white/10">
    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
      <img src={track.image} alt={track.title} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Play size={20} fill="white" className="text-white ml-1" />
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-black text-white truncate group-hover:text-accent-purple transition-colors">{track.title}</h3>
      <div className="flex items-center gap-2 mt-1">
        <p className="text-xs font-bold text-zinc-500 truncate">{track.artist}</p>
        <span className="bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md text-zinc-400">
          {track.status}
        </span>
      </div>
    </div>
    <button className="text-zinc-600 hover:text-white transition-colors p-1">
      <MoreVertical size={16} />
    </button>
  </div>
);

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    setWalletAddress(localStorage.getItem('groovely_wallet'));
  }, []);

  const abbrevWallet = walletAddress 
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-3)}` 
    : '0xc...y69';

  return (
    <div className="flex h-screen overflow-hidden bg-[#050510] text-white font-sans selection:bg-accent-cyan selection:text-black">
      <Sidebar activePage="library" />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-10 py-8 border-b border-white/5 bg-[#050510]/80 backdrop-blur-xl sticky top-0 z-50">
          <h1 className="text-2xl font-black tracking-tighter">My Library</h1>
          
          <div className="flex-1 max-w-md mx-10 relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-white transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Search your library..." 
              className="w-full bg-[#0F0F1A] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-accent-purple/30 transition-all placeholder-zinc-600"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="text-zinc-500 hover:text-white transition-colors relative">
              <Bell size={20} />
              <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-accent-purple rounded-full" />
            </button>
            <div className="flex items-center gap-3 bg-[#0F0F1A] border border-white/5 rounded-xl px-4 py-2">
              <div className="w-6 h-6 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30 overflow-hidden">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="Wallet" className="w-full h-full object-contain p-0.5" />
              </div>
              <span className="text-sm font-black tracking-tight text-white/90 font-mono">{abbrevWallet}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-10 pt-8 pb-20 custom-scrollbar">
          {/* Filters */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2">
              {['All', 'Played', 'Saved', 'Purchased'].map(tab => (
                <FilterTab 
                  key={tab} 
                  label={tab} 
                  active={activeTab === tab} 
                  onClick={() => setActiveTab(tab)} 
                />
              ))}
            </div>
            <button className="flex items-center gap-2 bg-[#0F0F1A] border border-white/5 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
              <span>Recently Added</span>
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {libraryTracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>

          {/* Footer */}
          <footer className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10 opacity-70">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <a href="#" className="hover:text-accent-purple transition-colors">About Groovely</a>
              <a href="#" className="hover:text-accent-purple transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-accent-purple transition-colors">Terms of Use</a>
              <a href="#" className="hover:text-accent-purple transition-colors">Docs/Developer API</a>
            </div>

            <div className="flex items-center gap-6 text-zinc-500">
               <Twitter size={18} className="hover:text-white cursor-pointer transition-colors" />
               <Send size={18} className="hover:text-white cursor-pointer transition-colors" />
               <Instagram size={18} className="hover:text-white cursor-pointer transition-colors" />
            </div>
          </footer>
          <div className="mt-6 text-center">
             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-800">© Copyright 2025</p>
          </div>
        </main>
      </div>
    </div>
  );
}
