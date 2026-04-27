'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Eye, MoreVertical, Edit2, RefreshCw, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface TrackRow {
  image?: string;
  cover_url?: string;
  coverImage?: string;
  name?: string;
  title?: string;
  artist?: string;
  content?: string;
  category?: string;
  streams?: string | number;
  earnings?: string | number;
  status?: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const normalizedStatus = status === 'active' ? 'Live' : status === 'Live' ? 'Live' : status === 'Minting' ? 'Minting' : status === 'Failed' ? 'Failed' : 'Draft';
  const styles: Record<string, string> = {
    Live: "bg-[#00FF85]/10 text-[#00FF85] border-[#00FF85]/20",
    Draft: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    Failed: "bg-red-500/10 text-red-500 border-red-500/20",
    Minting: "bg-accent-purple/10 text-accent-purple border-accent-purple/20"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[normalizedStatus] || styles.Draft}`}>
      {normalizedStatus}
    </span>
  );
};

export const TracksTable = () => {
  const [tracks, setTracks] = useState<TrackRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTracks() {
      try {
        const res = await apiFetch('/api/creator/dashboard/tracks');
        if (res && res.ok) {
          const json = await res.json();
          let parsedTracks: TrackRow[] = [];
          
          if (Array.isArray(json)) {
            parsedTracks = json;
          } else if (json && json.success && json.data) {
            if (Array.isArray(json.data)) {
              parsedTracks = json.data;
            } else if (json.data.tracks && Array.isArray(json.data.tracks)) {
              parsedTracks = json.data.tracks;
            } else if (json.data.data && Array.isArray(json.data.data)) {
              parsedTracks = json.data.data;
            }
          } else if (json && json.tracks && Array.isArray(json.tracks)) {
            parsedTracks = json.tracks;
          }
          setTracks(parsedTracks);
        }
      } catch (error) {
        console.error('Failed to fetch tracks', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTracks();
  }, []);

  return (
    <div className="glass-card p-8 lg:col-span-2">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-white tracking-tight uppercase">Tracks Summary</h2>
        <div className="flex items-center gap-4">
          <button className="text-accent-purple text-xs font-bold uppercase tracking-widest hover:underline transition-all">
             View All Tracks
          </button>
          <button className="bg-accent-purple hover:bg-opacity-90 text-white text-xs font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(157,0,255,0.2)]">
            <Upload size={14} />
            <span>Upload & Mint</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12 w-full">
          <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
        </div>
      ) : !Array.isArray(tracks) || tracks.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 w-full">
          <p>No tracks found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                <th className="pb-4 font-black">Track</th>
                <th className="pb-4 font-black">Content</th>
                <th className="pb-4 font-black text-center">Streams</th>
                <th className="pb-4 font-black text-center">Earnings</th>
                <th className="pb-4 font-black text-center">Status</th>
                <th className="pb-4 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {Array.isArray(tracks) && tracks.map((track, i) => (
                <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-5">
                    <div className="flex items-center gap-4">
                      <img src={track.image || track.cover_url || track.coverImage || "https://images.unsplash.com/photo-1514525253361-bee8d48800d5?auto=format&fit=crop&w=100&q=80"} alt={track.name || track.title || "Track"} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex flex-col">
                         <span className="text-sm font-bold text-white group-hover:text-accent-purple transition-colors">{track.name || track.title || "Untitled Track"}</span>
                         <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mt-1">{track.artist || "Unknown Artist"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-5">
                    <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-400">
                      {track.content || track.category || "Audio"}
                    </span>
                  </td>
                  <td className="py-5 text-center text-sm font-bold text-zinc-300">{track.streams || "0"}</td>
                  <td className="py-5 text-center text-sm font-bold text-zinc-300">{track.earnings || "$0.00"}</td>
                  <td className="py-5 text-center">
                    <StatusBadge status={track.status || 'Draft'} />
                  </td>
                  <td className="py-5">
                    <div className="flex items-center justify-end gap-3 text-zinc-500">
                      <button className="hover:text-white transition-colors">
                         {track.status === 'Draft' ? <Edit2 size={16} /> : track.status === 'Failed' ? <RefreshCw size={16} /> : <Eye size={16} />}
                      </button>
                      <button className="hover:text-white transition-colors">
                         <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
