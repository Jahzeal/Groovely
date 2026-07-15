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
  Music,
  Pause,
  Loader2
} from 'lucide-react';
import { Twitter, Instagram } from '@/components/ui/SocialIcons';
import { apiFetch } from '@/lib/api';
import { useMusicPlayer } from '@/components/marketplace/MusicPlayerContext';
import { MusicPlayer } from '@/components/marketplace/MusicPlayer';
import toast from 'react-hot-toast';

interface Track {
  id: number;
  title: string;
  artist_name?: string;
  artist_username?: string;
  cover_url?: string;
  audio_url?: string;
  status?: string;
  category?: string;
  uploader_id?: number;
}

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

const TrackCard = ({ track, onSave }: { track: Track; onSave: (id: number, isSaved: boolean) => Promise<boolean> }) => {
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(true);

  const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsSaving(true);
    try {
      const success = await onSave(track.id, isSaved);
      if (success) setIsSaved(!isSaved);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#0F0F1A]/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4 group hover:bg-[#0F0F1A]/60 transition-all duration-300 hover:border-white/10">
      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
        <img 
          src={track.cover_url || "https://images.unsplash.com/photo-1514525253361-bee8d48800d5?auto=format&fit=crop&w=300&q=80"} 
          alt={track.title} 
          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" 
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => playTrack({
              id: track.id,
              title: track.title,
              artist: track.artist_name || track.artist_username || 'Unknown Artist',
              image: track.cover_url || '',
              audioUrl: track.audio_url,
              uploaderId: track.uploader_id
            })}
            className="w-8 h-8 bg-accent-purple rounded-full flex items-center justify-center text-white"
          >
            {isThisTrackPlaying ? (
              <Pause size={14} fill="white" />
            ) : (
              <Play size={14} fill="white" className="ml-0.5" />
            )}
          </button>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-black text-white truncate group-hover:text-accent-purple transition-colors">{track.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs font-bold text-zinc-500 truncate">{track.artist_name || (track.artist_username ? `@${track.artist_username}` : 'Unknown Artist')}</p>
          <span className="bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md text-zinc-400">
            {track.category || 'Music'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button 
          onClick={handleSave}
          disabled={isSaving || !isSaved}
          className={`transition-colors p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-50 ${isSaved ? 'text-red-400' : 'text-zinc-600'}`}
        >
          {isSaving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Heart size={14} fill={isSaved ? 'currentColor' : 'none'} />
          )}
        </button>
        <button className="text-zinc-600 hover:text-white transition-colors p-1">
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
};

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setWalletAddress(localStorage.getItem('grooveli_wallet'));
  }, []);

  const fetchLibrary = async (filter: string) => {
    setLoading(true);
    try {
      const apiFilter = filter.toLowerCase();
      const res = await apiFetch(`/api/library?filter=${apiFilter}&limit=50`);
      if (res && res.ok) {
        const json = await res.json();
        const tracksData = json.data?.tracks || (Array.isArray(json.data) ? json.data : json.tracks || json);
        setTracks(Array.isArray(tracksData) ? tracksData : []);
      }
    } catch (error) {
      console.error('Failed to fetch library', error);
      toast.error('Failed to load tracks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary(activeTab);
  }, [activeTab]);

  const handleSaveTrack = async (trackId: number, isCurrentlySaved: boolean): Promise<boolean> => {
    try {
      const method = isCurrentlySaved ? 'DELETE' : 'POST';
      const res = await apiFetch(`/api/library/save/${trackId}`, {
        method
      });
      if (res && res.ok) {
        toast.success(isCurrentlySaved ? 'Removed from library' : 'Saved to library');
        fetchLibrary(activeTab);
        return true;
      } else {
        const errorData = await res?.json();
        throw new Error(errorData?.error || 'Action failed');
      }
    } catch (error: any) {
      console.error('Library action error:', error);
      toast.error(error.message || 'Action failed');
      return false;
    }
  };

  const abbrevWallet = walletAddress 
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-3)}` 
    : '0xc...y69';

  const filteredTracks = tracks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.artist_name || t.artist_username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              {['All', 'Played', 'Saved', 'Purchased', 'Uploaded'].map(tab => (
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 w-full">
              <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Loading library...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {filteredTracks.length > 0 ? (
                filteredTracks.map((track) => (
                  <TrackCard key={track.id} track={track} onSave={handleSaveTrack} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white/5 rounded-3xl border border-white/5 border-dashed">
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No matching tracks found</p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <footer className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10 opacity-70">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <a href="#" className="hover:text-accent-purple transition-colors">About Grooveli</a>
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
      <MusicPlayer />
    </div>
  );
}
