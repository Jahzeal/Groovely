'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import { Check, X, ShieldAlert, Disc, User, Activity, Menu, Bell, ChevronDown } from 'lucide-react';

interface Invitation {
  id: number;
  song_id: number;
  song_title: string;
  creator_username: string;
  creator_display_name: string;
  wallet_address: string;
  basis_points: number;
  role: string;
  display_name: string;
  approval_status: string;
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<number | null>(null);

  const fetchInvitations = async () => {
    try {
      const res = await apiFetch('/api/creator/invitations');
      if (res && res.ok) {
        const json = await res.json();
        setInvitations(json.data || []);
      } else {
        toast.error('Failed to load split invitations.');
      }
    } catch (err) {
      console.error('Error fetching invitations:', err);
      toast.error('Error loading invitations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleRespond = async (id: number, accept: boolean) => {
    setActioningId(id);
    try {
      const res = await apiFetch(`/api/creator/invitations/${id}/respond`, {
        method: 'POST',
        body: JSON.stringify({ accept }),
      });

      if (res && res.ok) {
        toast.success(accept ? 'Invitation accepted!' : 'Invitation rejected.');
        setInvitations((prev) => prev.filter((item) => item.id !== id));
      } else {
        const json = res ? await res.json() : null;
        toast.error(json?.message || 'Failed to respond to invitation.');
      }
    } catch (err) {
      console.error('Error responding to invitation:', err);
      toast.error('Failed to submit response.');
    } finally {
      setActioningId(null);
    }
  };

  const toggleMobileSidebar = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toggle_mobile_sidebar'));
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#192134] text-white font-sans selection:bg-[#8A2BE2] selection:text-white">
      <Sidebar activePage="invitations" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#192134]">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white/[0.01] border-b border-[#2D3548] backdrop-blur-[50px] sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMobileSidebar}
              className="p-1 text-white hover:opacity-80 transition-opacity cursor-pointer"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold font-['Clash_Display',sans-serif] text-white tracking-tight">
              Split Invites
            </h1>
          </div>
        </div>

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 h-20 bg-[#0F172A]/10 border-b border-[#232B3E] backdrop-blur-[25px] sticky top-0 z-30">
          <h1 className="text-2xl font-bold font-['Clash_Display',sans-serif] text-white tracking-tight">
            Split Invitations
          </h1>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#232B3E] border border-[#2D3548] rounded-lg text-xs font-bold text-[#CACACA]">
            <Activity size={14} className="text-[#00FF88] animate-pulse" />
            <span>Direct Splits Engine Active</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-10 py-6 md:py-8 bg-[#192134]">
          <div className="max-w-4xl space-y-6">
            <div className="hidden md:block">
              <p className="text-sm font-['Space_Grotesk',sans-serif] text-[#CACACA]">
                Review and approve revenue split shares for tracks you co-created.
              </p>
            </div>

            {/* Cards List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Disc className="w-10 h-10 text-[#8A2BE2] animate-spin" />
                <p className="text-[#CACACA] text-sm font-bold tracking-widest uppercase font-['Space_Grotesk',sans-serif]">Loading invites...</p>
              </div>
            ) : invitations.length === 0 ? (
              <div className="bg-[#0F172A] border border-[#2D3548] rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-[#232B3E] border border-[#2D3548] rounded-full text-zinc-400">
                  <ShieldAlert size={36} className="text-zinc-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-bold font-['Clash_Display',sans-serif] text-white">
                    You're all caught up!
                  </h3>
                  <p className="text-[#CACACA] text-sm max-w-md mx-auto font-['Space_Grotesk',sans-serif]">
                    There are no pending collaborator invitations or split approvals waiting for you.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {invitations.map((invite) => {
                  const percent = (invite.basis_points / 100).toFixed(1);
                  return (
                    <div 
                      key={invite.id} 
                      className="bg-[#0F172A] border border-[#2D3548] rounded-xl p-5 hover:border-[#8A2BE2]/50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-5 group"
                    >
                      {/* Track Info */}
                      <div className="flex items-center gap-4">
                        <div className="p-3.5 bg-[#8A2BE2]/10 border border-[#8A2BE2]/20 rounded-xl text-[#8A2BE2]">
                          <Disc size={24} />
                        </div>
                        <div className="space-y-0.5">
                          <h3 className="text-base sm:text-lg font-bold font-['Clash_Display',sans-serif] text-white">
                            {invite.song_title}
                          </h3>
                          <div className="flex items-center gap-2 text-[#CACACA] text-xs font-['Space_Grotesk',sans-serif]">
                            <User size={12} />
                            <span>
                              Uploader: <span className="text-white font-medium">@{invite.creator_username}</span> ({invite.creator_display_name})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Split details */}
                      <div className="flex items-center gap-6">
                        <div className="text-left md:text-right">
                          <span className="text-[10px] font-bold uppercase text-[#CACACA] tracking-wider block font-['Space_Grotesk',sans-serif]">Role</span>
                          <span className="text-xs font-bold text-white capitalize bg-[#232B3E] border border-[#2D3548] px-2.5 py-1 rounded-md mt-1 inline-block font-['Space_Grotesk',sans-serif]">
                            {invite.role || 'Writer'}
                          </span>
                        </div>
                        <div className="text-left md:text-right">
                          <span className="text-[10px] font-bold uppercase text-[#CACACA] tracking-wider block font-['Space_Grotesk',sans-serif]">Split</span>
                          <span className="text-xl sm:text-2xl font-bold text-[#00FF88] block font-['JetBrains_Mono',monospace]">
                            {percent}%
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 w-full md:w-auto pt-3 md:pt-0 border-t border-[#2D3548] md:border-t-0">
                        <button
                          type="button"
                          onClick={() => handleRespond(invite.id, false)}
                          disabled={actioningId !== null}
                          className="flex-1 md:flex-none py-2.5 px-4 bg-[#FF0044]/10 hover:bg-[#FF0044]/20 text-[#FF0044] border border-[#FF0044]/30 rounded-lg text-xs font-bold font-['Space_Grotesk',sans-serif] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <X size={14} />
                          <span>Reject</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRespond(invite.id, true)}
                          disabled={actioningId !== null}
                          className="flex-1 md:flex-none py-2.5 px-4 bg-[#8A2BE2] hover:bg-[#7823c9] text-white rounded-lg text-xs font-bold font-['Space_Grotesk',sans-serif] shadow-[0_0_15px_rgba(138,43,226,0.3)] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Check size={14} />
                          <span>Accept</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
