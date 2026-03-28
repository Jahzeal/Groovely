'use client';

import React from 'react';
import { Upload, Eye, MoreVertical, Edit2, RefreshCw } from 'lucide-react';

interface TrackRow {
  image: string;
  name: string;
  artist: string;
  content: string;
  streams: string;
  earnings: string;
  status: 'Live' | 'Draft' | 'Failed' | 'Minting';
}

const tracks: TrackRow[] = [
  {
    image: "https://images.unsplash.com/photo-1514525253361-bee8d48800d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    name: "Slow Lights on Third Street",
    artist: "Midnight Vibe",
    content: "Music",
    streams: "5,000",
    earnings: "$234.01",
    status: "Live"
  },
  {
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    name: "Midnight Bounce",
    artist: "Synth Wave",
    content: "Beat",
    streams: "0",
    earnings: "$0",
    status: "Draft"
  },
  {
    image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    name: "Late Nights, Loose Thoughts — Ep. 01",
    artist: "The Talk Show",
    content: "Podcast",
    streams: "40,000",
    earnings: "$1,000.01",
    status: "Live"
  },
  {
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    name: "After the Noise",
    artist: "Static Echo",
    content: "Music",
    streams: "0",
    earnings: "$0",
    status: "Failed"
  },
  {
    image: "https://images.unsplash.com/photo-1526218626217-dc65a29bb444?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    name: "No Wahala, Just Vibes",
    artist: "Groove Master",
    content: "Skit",
    streams: "0",
    earnings: "$0",
    status: "Minting"
  }
];

const StatusBadge = ({ status }: { status: TrackRow['status'] }) => {
  const styles = {
    Live: "bg-[#00FF85]/10 text-[#00FF85] border-[#00FF85]/20",
    Draft: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    Failed: "bg-red-500/10 text-red-500 border-red-500/20",
    Minting: "bg-accent-purple/10 text-accent-purple border-accent-purple/20"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status]}`}>
      {status}
    </span>
  );
};

export const TracksTable = () => {
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

      <div className="overflow-x-auto">
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
            {tracks.map((track, i) => (
              <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                <td className="py-5">
                  <div className="flex items-center gap-4">
                    <img src={track.image} alt={track.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-white group-hover:text-accent-purple transition-colors">{track.name}</span>
                       <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mt-1">{track.artist}</span>
                    </div>
                  </div>
                </td>
                <td className="py-5">
                  <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-400">
                    {track.content}
                  </span>
                </td>
                <td className="py-5 text-center text-sm font-bold text-zinc-300">{track.streams}</td>
                <td className="py-5 text-center text-sm font-bold text-zinc-300">{track.earnings}</td>
                <td className="py-5 text-center">
                  <StatusBadge status={track.status} />
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
    </div>
  );
};
