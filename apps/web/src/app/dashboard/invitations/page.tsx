'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import { Check, X, ShieldAlert, Disc, User, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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
        // Remove from list or update local state
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

  return (
    <div className="flex h-screen overflow-hidden bg-[#050510] text-white font-sans">
      <Sidebar activePage="invitations" />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-12 py-10 relative">
        {/* Decorative background glows */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-accent-purple/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-accent-cyan/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          {/* Header */}
          <div className="flex justify-between items-center pb-6 border-b border-white/5">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white uppercase leading-none">
                Split Invitations
              </h1>
              <p className="text-zinc-500 text-sm mt-2 font-medium">
                Review and approve revenue split shares for tracks you co-created.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-2xl text-xs font-bold text-zinc-400">
              <Activity size={14} className="text-accent-cyan animate-pulse" />
              <span>Direct Splits Engine Active</span>
            </div>
          </div>

          {/* Cards List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Disc className="w-10 h-10 text-accent-purple animate-spin" />
              <p className="text-zinc-500 text-sm font-bold tracking-widest uppercase">Loading invites...</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="bg-white/[0.01] border border-white/5 rounded-[32px] p-12 text-center flex flex-col items-center justify-center space-y-6">
              <div className="p-5 bg-white/[0.03] border border-white/5 rounded-full text-zinc-600">
                <ShieldAlert size={40} className="text-zinc-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">You're all caught up!</h3>
                <p className="text-zinc-500 text-sm max-w-md mx-auto">
                  There are no pending collaborator invitations or split approvals waiting for you.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {invitations.map((invite) => {
                const percent = (invite.basis_points / 100).toFixed(1);
                return (
                  <div 
                    key={invite.id} 
                    className="bg-white/[0.02] border border-white/5 rounded-[32px] p-6 hover:bg-white/[0.03] transition-all hover:border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group"
                  >
                    {/* Track Info */}
                    <div className="flex items-center gap-5">
                      <div className="p-4 bg-accent-purple/10 border border-accent-purple/20 rounded-2xl text-accent-purple group-hover:scale-105 transition-transform duration-300">
                        <Disc size={28} className="animate-spin-slow" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-white group-hover:text-accent-cyan transition-colors">
                          {invite.song_title}
                        </h3>
                        <div className="flex items-center gap-2 text-zinc-500 text-xs">
                          <User size={12} />
                          <span>
                            Uploader: <span className="text-zinc-300 font-semibold">@{invite.creator_username}</span> ({invite.creator_display_name})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Split details */}
                    <div className="flex items-center gap-10">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest block">Role Tag</span>
                        <span className="text-sm font-bold text-white capitalize bg-white/5 border border-white/5 px-3 py-1 rounded-lg mt-1 inline-block">
                          {invite.role || 'Writer'}
                        </span>
                      </div>
                      <div className="text-left md:text-right">
                        <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest block">Revenue Split</span>
                        <span className="text-2xl font-black text-accent-cyan block leading-none mt-1">
                          {percent}%
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t border-white/5 md:border-t-0">
                      <Button
                        variant="secondary"
                        onClick={() => handleRespond(invite.id, false)}
                        disabled={actioningId !== null}
                        className="flex-1 md:flex-none py-3.5 px-6 border border-red-500/20 bg-red-950/10 hover:bg-red-950/20 text-red-400 rounded-2xl text-xs uppercase tracking-widest font-black flex items-center justify-center gap-2 transition-all"
                      >
                        <X size={14} />
                        <span>Reject</span>
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => handleRespond(invite.id, true)}
                        disabled={actioningId !== null}
                        className="flex-1 md:flex-none py-3.5 px-6 bg-accent-purple hover:bg-opacity-95 shadow-[0_0_15px_rgba(157,0,255,0.2)] hover:shadow-[0_0_25px_rgba(157,0,255,0.4)] rounded-2xl text-xs uppercase tracking-widest font-black flex items-center justify-center gap-2 transition-all border-none"
                      >
                        <Check size={14} />
                        <span>Accept</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
