'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Upload, Eye, MoreVertical, Edit2, RefreshCw, Loader2, Zap, Trash2, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

/** Convert ipfs:// URLs to a public HTTP gateway URL so browsers can load them */
const ipfsToHttp = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('ipfs://')) {
    const cid = url.slice(7);
    if (cid.length < 40) return '';
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  }
  return url;
};

interface TrackRow {
  id?: number | string;
  image?: string;
  cover_url?: string;
  coverImage?: string;
  name?: string;
  title?: string;
  artist?: string;
  artist_name?: string;
  artist_username?: string;
  content?: string;
  category?: string;
  streams?: string | number;
  earnings?: string | number;
  status?: string;
}

const formatEarnings = (val: any): string => {
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num) || num === 0) return '$0.00';
  return `$${num.toFixed(2)}`;
};

const formatStreams = (val: any): string => {
  const num = typeof val === 'number' ? val : parseInt(val, 10);
  if (isNaN(num)) return '0';
  return num.toLocaleString();
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = status?.toLowerCase();
  const normalizedStatus = s === 'active' || s === 'live' ? 'Live' : s === 'minting' ? 'Minting' : s === 'failed' ? 'Failed' : s === 'pending_approval' ? 'Pending splits' : 'Draft';
  const styles: Record<string, string> = {
    Live: "bg-[rgba(0,255,136,0.1)] text-[#00FF88] border border-[rgba(0,255,136,0.2)]",
    Draft: "bg-[rgba(255,230,0,0.1)] text-[#FFE600] border border-[rgba(255,230,0,0.2)]",
    Failed: "bg-[rgba(255,0,68,0.1)] text-[#FF0044] border border-[rgba(255,0,68,0.2)]",
    Minting: "bg-[#697184] text-[#0F172A] font-bold",
    "Pending splits": "bg-amber-500/10 text-amber-500 border border-amber-500/20"
  };

  const tooltips: Record<string, string> = {
    Live: "This track is minted and live on the public marketplace.",
    Draft: "This track is a draft. Click the action menu to mint and publish it.",
    Failed: "Minting failed. Click retry or use the menu to mint again.",
    Minting: "This track is currently minting on the blockchain.",
    "Pending splits": "This track splits are awaiting approvals from collaborators."
  };

  return (
    <span 
      title={tooltips[normalizedStatus]}
      className={`cursor-help px-3 py-0.5 rounded-full text-[11px] font-['Space_Grotesk',sans-serif] font-bold uppercase tracking-wider whitespace-nowrap ${styles[normalizedStatus] || styles.Draft}`}
    >
      {normalizedStatus}
    </span>
  );
};

export const TracksTable = () => {
  const router = useRouter();
  const [tracks, setTracks] = useState<TrackRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenuTrackId, setOpenMenuTrackId] = useState<number | string | null>(null);
  const [deletingTrackId, setDeletingTrackId] = useState<number | string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuTrackId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchTracks = async () => {
    try {
      const res = await apiFetch('/api/creator/dashboard/tracks');
      if (res && res.ok) {
        const json = await res.json();
        let parsedTracks: TrackRow[] = [];
        if (Array.isArray(json)) {
          parsedTracks = json;
        } else if (json && json.data) {
          if (Array.isArray(json.data)) {
            parsedTracks = json.data;
          } else if (json.data.tracks && Array.isArray(json.data.tracks)) {
            parsedTracks = json.data.tracks;
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
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const handleEditClick = (track: TrackRow) => {
    if (!track.id) return;
    router.push(`/dashboard/upload?editId=${track.id}`);
  };

  const handleMintClick = (track: TrackRow) => {
    if (!track.id) return;
    router.push(`/dashboard/upload/mint?id=${track.id}`);
  };

  const handleDeleteClick = async (track: TrackRow) => {
    if (!track.id) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete "${track.title || track.name || 'this track'}"?`);
    if (!confirmDelete) return;

    setDeletingTrackId(track.id);
    try {
      const res = await apiFetch(`/api/creator/tracks/${track.id}`, {
        method: 'DELETE',
      });
      if (res && res.ok) {
        toast.success('Track deleted successfully');
        setTracks(prev => prev.filter(t => t.id !== track.id));
      } else {
        const err = await res?.json().catch(() => ({}));
        toast.error(err?.message || 'Failed to delete track');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete track');
    } finally {
      setDeletingTrackId(null);
      setOpenMenuTrackId(null);
    }
  };

  return (
    <div className="bg-[#0F172A] border border-[#232B3E] rounded-[12px] p-4 sm:p-6 lg:col-span-2 overflow-visible">
      <div className="flex flex-row items-center justify-between gap-4 mb-4 sm:mb-6">
        <h2 className="font-['Clash_Display',sans-serif] font-bold text-[18px] sm:text-[20px] text-white tracking-tight leading-none">
          Tracks Summary
        </h2>
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={() => router.push('/library')}
            className="font-['Space_Grotesk',sans-serif] font-bold text-[14px] sm:text-[16px] text-[#8A2BE2] hover:underline cursor-pointer"
          >
             View All
          </button>
          <button 
            onClick={() => router.push('/dashboard/upload')}
            className="bg-[#8A2BE2] hover:bg-opacity-90 text-white font-['Space_Grotesk',sans-serif] font-bold text-xs sm:text-sm py-2 px-3.5 sm:px-5 rounded-[8px] flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(138,43,226,0.3)] cursor-pointer"
          >
            <Upload size={14} />
            <span className="hidden sm:inline">Upload &amp; Mint</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12 w-full">
          <Loader2 className="w-8 h-8 text-[#8A2BE2] animate-spin" />
        </div>
      ) : !Array.isArray(tracks) || tracks.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 w-full font-['Space_Grotesk',sans-serif]">
          <p>No tracks found.</p>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* MOBILE CARDS VIEW (Clean & Non-Squashed on < 640px)                      */}
          {/* ========================================================================= */}
          <div className="sm:hidden flex flex-col divide-y divide-white/5">
            {tracks.map((track, i) => {
              const s = track.status?.toLowerCase() || 'draft';
              const isLive = s === 'active' || s === 'live';
              const isFailed = s === 'failed';
              const isMenuOpen = openMenuTrackId === track.id;

              return (
                <div key={track.id || i} className="py-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={ipfsToHttp(track.image || track.cover_url || track.coverImage) || "https://images.unsplash.com/photo-1514525253361-bee8d48800d5?auto=format&fit=crop&w=100&q=80"} 
                        alt={track.name || track.title || "Track"} 
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10" 
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-white truncate">
                          {track.name || track.title || "Untitled Track"}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-medium text-zinc-400 truncate">
                            {track.artist_name || track.artist || (track.artist_username ? `@${track.artist_username}` : "Unknown Artist")}
                          </span>
                          {(track as any).contributor_role && (track as any).contributor_role !== 'creator' && (
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-[#8A2BE2]/15 text-[#8A2BE2] border border-[#8A2BE2]/20 shrink-0">
                              {(track as any).contributor_role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={track.status || 'Draft'} />
                  </div>

                  <div className="relative flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-3.5 py-2.5">
                    <div className="flex items-center gap-5">
                      <div>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Streams</span>
                        <span className="text-xs font-bold text-zinc-200">{formatStreams(track.streams)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Earnings</span>
                        <span className="text-xs font-bold text-[#00FF88]">{formatEarnings(track.earnings)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Content</span>
                        <span className="text-xs font-bold text-zinc-300">{track.content || track.category || "Audio"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 relative">
                      <button
                        onClick={() => handleEditClick(track)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                        title="Edit track"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuTrackId(isMenuOpen ? null : (track.id ?? null));
                        }}
                        className={`p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors ${isMenuOpen ? 'text-[#8A2BE2] bg-white/10' : 'text-zinc-400 hover:text-white'}`}
                        title="More options"
                      >
                        <MoreVertical size={15} />
                      </button>

                      {/* Dropdown Menu Popover on Mobile */}
                      {isMenuOpen && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 bottom-full mb-1.5 w-44 bg-[#0B101D] border border-[#2D3548] rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.85)] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-left font-['Space_Grotesk',sans-serif]"
                        >
                          {isLive ? (
                            <div className="px-3 py-2 text-xs font-semibold text-zinc-500 select-none flex items-center justify-between">
                              <span className="flex items-center gap-1.5"><Zap size={13} /> Minted</span>
                              <span className="text-[9px] text-[#00FF88] font-bold uppercase">Live</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleMintClick(track)}
                              className="w-full px-3 py-2 flex items-center gap-2 text-xs font-bold text-[#8A2BE2] hover:bg-[#8A2BE2]/15 hover:text-white transition-all cursor-pointer"
                            >
                              <Zap size={13} className="text-[#8A2BE2]" />
                              <span>{isFailed ? 'Retry Minting' : 'Mint Track'}</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setOpenMenuTrackId(null);
                              handleEditClick(track);
                            }}
                            className="w-full px-3 py-2 flex items-center gap-2 text-xs font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                          >
                            <Edit2 size={13} className="text-zinc-400" />
                            <span>Edit Details</span>
                          </button>
                          <div className="h-[1px] bg-white/5 my-1" />
                          <button
                            onClick={() => handleDeleteClick(track)}
                            disabled={deletingTrackId === track.id}
                            className="w-full px-3 py-2 flex items-center gap-2 text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer"
                          >
                            <Trash2 size={13} className="text-red-400" />
                            <span>Delete Track</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* DESKTOP & TABLET TABLE (Visible on >= 640px)                               */}
          {/* ========================================================================= */}
          <div className="hidden sm:block overflow-x-auto w-full">
            <table className="w-full text-left min-w-[620px]">
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
                {tracks.map((track, i) => {
                  const s = track.status?.toLowerCase() || 'draft';
                  const isLive = s === 'active' || s === 'live';
                  const isFailed = s === 'failed';
                  const isMenuOpen = openMenuTrackId === track.id;

                  return (
                    <tr key={track.id || i} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-5">
                        <div className="flex items-center gap-4">
                          <img 
                            src={ipfsToHttp(track.image || track.cover_url || track.coverImage) || "https://images.unsplash.com/photo-1514525253361-bee8d48800d5?auto=format&fit=crop&w=100&q=80"} 
                            alt={track.name || track.title || "Track"} 
                            className="w-10 h-10 rounded-lg object-cover shrink-0" 
                          />
                          <div className="flex flex-col min-w-0 max-w-[200px] lg:max-w-none">
                             <span className="text-sm font-bold text-white group-hover:text-[#8A2BE2] transition-colors truncate">
                               {track.name || track.title || "Untitled Track"}
                             </span>
                             <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider truncate">
                                  {track.artist_name || track.artist || (track.artist_username ? `@${track.artist_username}` : "Unknown Artist")}
                                </span>
                                {(track as any).contributor_role && (track as any).contributor_role !== 'creator' && (
                                  <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-[#8A2BE2]/15 text-[#8A2BE2] border border-[#8A2BE2]/20 shrink-0">
                                    {(track as any).contributor_role}
                                  </span>
                                )}
                             </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-5">
                        <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-400 whitespace-nowrap">
                          {track.content || track.category || "Audio"}
                        </span>
                      </td>
                      <td className="py-5 text-center text-sm font-bold text-zinc-300">{formatStreams(track.streams)}</td>
                      <td className="py-5 text-center text-sm font-bold text-[#00FF88]">{formatEarnings(track.earnings)}</td>
                      <td className="py-5 text-center">
                        <StatusBadge status={track.status || 'Draft'} />
                      </td>
                      <td className="py-5 text-right">
                        <div className="relative inline-flex items-center justify-end gap-2.5 text-zinc-400">
                          
                          {/* Edit Pencil Icon: Prefills all details into upload page */}
                          <button
                            onClick={() => handleEditClick(track)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                            title="Edit track details"
                          >
                            <Edit2 size={16} />
                          </button>

                          {/* More Actions Menu Button ( : ) */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuTrackId(isMenuOpen ? null : (track.id ?? null));
                            }}
                            className={`p-1.5 rounded-lg hover:bg-white/10 transition-all cursor-pointer ${isMenuOpen ? 'text-[#8A2BE2] bg-white/10' : 'hover:text-white'}`}
                            title="More actions"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {/* Dropdown Menu Popover */}
                          {isMenuOpen && (
                            <div
                              ref={menuRef}
                              className="absolute right-0 top-full mt-1.5 w-48 bg-[#0B101D] border border-[#2D3548] rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.85)] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-left font-['Space_Grotesk',sans-serif]"
                            >
                              {/* Mint Option */}
                              {isLive ? (
                                <div 
                                  className="px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-zinc-500 opacity-40 cursor-not-allowed select-none filter blur-[0.3px]"
                                  title="This track has already been minted"
                                >
                                  <div className="flex items-center gap-2">
                                    <Zap size={14} className="text-zinc-600" />
                                    <span>Mint Edition</span>
                                  </div>
                                  <span className="text-[9px] uppercase tracking-wider font-bold text-[#00FF88]">Minted</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleMintClick(track)}
                                  className="w-full px-3.5 py-2.5 flex items-center gap-2 text-xs font-bold text-[#8A2BE2] hover:bg-[#8A2BE2]/15 hover:text-white transition-all cursor-pointer"
                                >
                                  <Zap size={14} className="text-[#8A2BE2]" />
                                  <span>{isFailed ? 'Retry Minting' : 'Mint Track'}</span>
                                </button>
                              )}

                              {/* Edit Option */}
                              <button
                                onClick={() => {
                                  setOpenMenuTrackId(null);
                                  handleEditClick(track);
                                }}
                                className="w-full px-3.5 py-2.5 flex items-center gap-2 text-xs font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                              >
                                <Edit2 size={14} className="text-zinc-400" />
                                <span>Edit Details</span>
                              </button>

                              <div className="h-[1px] bg-white/5 my-1" />

                              {/* Delete Option */}
                              <button
                                onClick={() => handleDeleteClick(track)}
                                disabled={deletingTrackId === track.id}
                                className="w-full px-3.5 py-2.5 flex items-center gap-2 text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer disabled:opacity-50"
                              >
                                {deletingTrackId === track.id ? (
                                  <>
                                    <Loader2 size={14} className="animate-spin text-red-400" />
                                    <span>Deleting...</span>
                                  </>
                                ) : (
                                  <>
                                    <Trash2 size={14} className="text-red-400" />
                                    <span>Delete Track</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
