'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { 
  Search, 
  Play,
  MoreVertical,
  Music,
  Loader2,
  Filter
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useMusicPlayer } from '@/components/marketplace/MusicPlayerContext';

interface Track {
  id: number;
  title: string;
  artist_name?: string;
  artist_username?: string;
  cover_url?: string;
  status?: string;
  category?: string;
}

const FilterTab = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
      active ? 'bg-accent-purple text-white shadow-[0_0_15px_rgba(157,0,255,0.3)]' : 'bg-white/5 text-zinc-500 border border-white/5 hover:bg-white/10'
    }`}
  >
    {label}
  </button>
);

const TrackCard = ({ track }: { track: Track }) => {
  const { playTrack } = useMusicPlayer();
  
  return (
    <div className="bg-[#0F0F1A]/40 border border-white/5 rounded-[24px] p-4 flex items-center gap-5 group hover:bg-[#0F0F1A]/60 transition-all duration-300 hover:border-accent-purple/20">
      <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-2xl">
        <img 
          src={track.cover_url || "https://images.unsplash.com/photo-1514525253361-bee8d48800d5?auto=format&fit=crop&w=300&q=80"} 
          alt={track.title} 
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => playTrack({
              id: track.id,
              title: track.title,
              artist: track.artist_name || track.artist_username || 'Unknown Artist',
              image: track.cover_url || ''
            })}
            className="w-10 h-10 bg-accent-purple rounded-full flex items-center justify-center text-white shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300"
          >
            <Play size={18} fill="white" className="ml-1" />
          </button>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-black text-white truncate group-hover:text-accent-purple transition-colors mb-1">{track.title}</h3>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold text-zinc-500 truncate">{track.artist_name || (track.artist_username ? `@${track.artist_username}` : 'Unknown Artist')}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg text-zinc-400">
              {track.category || 'Music'}
            </span>
            <span className="text-[10px] font-bold text-accent-purple uppercase tracking-wider">
              {track.status || 'Active'}
            </span>
          </div>
        </div>
      </div>
      <button className="text-zinc-700 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5">
        <MoreVertical size={18} />
      </button>
    </div>
  );
};

export default function LibraryPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    async function fetchLibrary() {
      try {
        const res = await apiFetch('/api/creator/tracks');
        if (res && res.ok) {
          const json = await res.json();
          const data = json.data || json;
          setTracks(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch library', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLibrary();
  }, []);

  const filteredTracks = tracks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.artist_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#050510] text-white font-sans selection:bg-accent-cyan selection:text-black">
      <Sidebar activePage="library" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />

        <main className="flex-1 overflow-y-auto px-10 pt-10 pb-20 mesh-gradient">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
              <div>
                <h1 className="text-5xl font-black tracking-tighter text-white mb-3">My Library</h1>
                <p className="text-zinc-500 font-medium text-lg">Manage and listen to your collection of tracks.</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-white transition-colors">
                    <Search size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search library..." 
                    className="w-80 bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-accent-purple/50 transition-all placeholder-zinc-600 focus:bg-white/[0.08]"
                  />
                </div>
                <button className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/5 rounded-2xl text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
                  <Filter size={18} />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 no-scrollbar">
              {['All', 'Music', 'Beats', 'Skits', 'Podcasts'].map(tab => (
                <FilterTab 
                  key={tab} 
                  label={tab} 
                  active={activeTab === tab} 
                  onClick={() => setActiveTab(tab)} 
                />
              ))}
            </div>

            {/* Content Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 size={48} className="text-accent-purple animate-spin" />
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Syncing library…</p>
              </div>
            ) : filteredTracks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {filteredTracks.map((track) => (
                  <TrackCard key={track.id} track={track} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center gap-6 bg-white/[0.02] border border-dashed border-white/5 rounded-[40px]">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-zinc-700">
                  <Music size={40} />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-bold text-white">Your library is empty</p>
                  <p className="text-zinc-500 max-w-sm">Start exploring the marketplace to add some tracks to your collection.</p>
                </div>
                <button 
                  onClick={() => window.location.href = '/marketplace'}
                  className="bg-accent-purple hover:bg-opacity-90 text-white font-black py-3.5 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(157,0,255,0.3)] hover:scale-105 active:scale-95 text-sm uppercase tracking-widest"
                >
                  Explore Marketplace
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
