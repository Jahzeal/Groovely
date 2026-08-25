'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import { Check, X, ShieldAlert, Disc, User, Activity, Menu, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [displayName, setDisplayName] = useState<string>('Creator');

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/creator/invitations', { skipAuthRedirect: true });
      if (res && res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data) 
          ? json.data 
          : (Array.isArray(json.data?.data) ? json.data.data : (Array.isArray(json.invitations) ? json.invitations : (Array.isArray(json) ? json : [])));
        setInvitations(list);
      } else {
        setInvitations([]);
      }
    } catch (err) {
      console.error('Error fetching invitations:', err);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('grooveli_token') || localStorage.getItem('groovely_token'))
      : null;

    if (!token) {
      router.push('/login');
      return;
    }

    async function fetchProfile() {
      try {
        const res = await apiFetch('/api/creator/profile', { skipAuthRedirect: true });
        if (res && res.ok) {
          const data = await res.json();
          const profile = data.data ?? data;
          if (profile.display_name) {
            setDisplayName(profile.display_name);
          }
        }
      } catch (e) {
        console.error('Profile fetch error:', e);
      }
    }

    fetchProfile();
    fetchInvitations();
  }, [router]);

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
        {/* TopBar Header */}
        <TopBar displayName={displayName} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-10 py-6 md:py-8 bg-[#192134]">
          <div className="max-w-4xl space-y-6">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-['Clash_Display',sans-serif] text-white tracking-tight">
                  Split Invitations
                </h1>
                <p className="text-xs sm:text-sm font-['Space_Grotesk',sans-serif] text-[#CACACA] mt-1">
                  Review and approve revenue split shares for tracks you co-created.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchInvitations}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-2 bg-[#232B3E] hover:bg-[#2d374f] border border-[#2D3548] rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin text-[#8A2BE2]' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Invitations List / Empty State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <Disc className="w-10 h-10 text-[#8A2BE2] animate-spin" />
                <p className="text-[#CACACA] text-xs font-bold tracking-widest uppercase font-['Space_Grotesk',sans-serif]">
                  Loading invites...
                </p>
              </div>
            ) : invitations.length === 0 ? (
              <div className="bg-[#0F172A] border border-[#2D3548] rounded-[24px] p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-[#232B3E] border border-[#2D3548] rounded-full text-zinc-400">
                  <ShieldAlert size={36} className="text-zinc-400" />
                </div>
                <div className="space-y-1 max-w-md">
                  <h3 className="text-lg sm:text-xl font-bold font-['Clash_Display',sans-serif] text-white">
                    You're all caught up!
                  </h3>
                  <p className="text-[#CACACA] text-xs sm:text-sm font-['Space_Grotesk',sans-serif]">
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
                      className="bg-[#0F172A] border border-[#2D3548] rounded-[20px] p-5 hover:border-[#8A2BE2]/50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-5 group"
                    >
                      {/* Track Info */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="p-3.5 bg-[#8A2BE2]/10 border border-[#8A2BE2]/20 rounded-xl text-[#8A2BE2] shrink-0">
                          <Disc size={24} />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <h3 className="text-base sm:text-lg font-bold font-['Clash_Display',sans-serif] text-white truncate">
                            {invite.song_title}
                          </h3>
                          <div className="flex items-center gap-2 text-[#CACACA] text-xs font-['Space_Grotesk',sans-serif]">
                            <User size={12} />
                            <span className="truncate">
                              Uploader: <span className="text-white font-medium">@{invite.creator_username}</span> ({invite.creator_display_name})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Split Details */}
                      <div className="flex items-center gap-6 shrink-0">
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
                      <div className="flex items-center gap-3 w-full md:w-auto pt-3 md:pt-0 border-t border-[#2D3548] md:border-t-0 shrink-0">
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
