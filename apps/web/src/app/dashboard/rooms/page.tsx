'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { CreateRoomModal } from '@/components/rooms/CreateRoomModal';
import { 
  Radio, 
  Plus, 
  Users, 
  Clock, 
  Play, 
  ListMusic, 
  Sparkles, 
  Headphones, 
  ShieldCheck, 
  Share2, 
  Calendar,
  DollarSign
} from 'lucide-react';
import { cachedApiFetch, resolveIpfsUrl } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CreatorRoomsDashboard() {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('groovely_user_id') || localStorage.getItem('grooveli_user_id');
      if (storedId) setCurrentUserId(Number(storedId));
    }
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const { data } = await cachedApiFetch('/api/rooms', {
        onBackgroundUpdate: (fresh: any) => {
          if (fresh?.data) setRooms(fresh.data);
        }
      });
      if (data?.data) {
        setRooms(data.data);
      }
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // Filter creator's active/live rooms vs all public rooms
  const myRooms = rooms.filter((r: any) => 
    currentUserId ? String(r.host_id) === String(currentUserId) : true
  );

  const activeRooms = myRooms.filter((r: any) => r.status === 'live' || !r.status);
  const scheduledRooms = myRooms.filter((r: any) => r.status === 'scheduled');
  const pastRooms = myRooms.filter((r: any) => r.status === 'ended');

  return (
    <div className="flex h-screen overflow-hidden bg-[#192134] text-white font-sans">
      {/* Sidebar */}
      <Sidebar activePage="rooms" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#192134]">
        <TopBar displayName="Creator" />

        <main className="flex-1 p-6 sm:p-10 overflow-y-auto space-y-8 custom-scrollbar max-w-[1600px] mx-auto w-full">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-8 bg-gradient-to-r from-[#0F172A] via-[#192134] to-[#2E0B5E] rounded-3xl border border-[#2D3548] shadow-xl relative overflow-hidden">
            <div className="space-y-2 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8A2BE2]/20 border border-[#8A2BE2]/40 text-accent-purple text-xs font-bold uppercase tracking-wider">
                <Radio size={14} className="animate-pulse text-[#00FF85]" />
                <span>Creator Studio Live</span>
              </div>
              <h1 className="font-['Clash_Display',sans-serif] text-2xl sm:text-3xl font-bold text-white tracking-wide">
                Listening Room Hub
              </h1>
              <p className="text-sm text-zinc-400 max-w-xl">
                Host live listening parties, stream high-fidelity stems, interact with fans on stage, and monetize with real-time tips.
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="z-10 px-6 py-3.5 bg-gradient-to-r from-[#8A2BE2] to-[#FF0044] hover:opacity-95 text-white font-bold text-sm rounded-2xl shadow-[0_0_25px_rgba(138,43,226,0.5)] transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus size={18} />
              <span>Host New Room</span>
            </button>

            {/* Background Decorative Glow */}
            <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-[#8A2BE2]/15 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Room Analytics Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0F172A] p-5 rounded-2xl border border-[#232B3E] space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider">Active Rooms</span>
                <Radio size={16} className="text-[#00FF85]" />
              </div>
              <p className="text-2xl font-bold text-white">{activeRooms.length}</p>
            </div>

            <div className="bg-[#0F172A] p-5 rounded-2xl border border-[#232B3E] space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider">Live Listeners</span>
                <Users size={16} className="text-accent-purple" />
              </div>
              <p className="text-2xl font-bold text-white">
                {activeRooms.reduce((acc, r) => acc + (r.max_listeners || r.active_listeners || 12), 0)}
              </p>
            </div>

            <div className="bg-[#0F172A] p-5 rounded-2xl border border-[#232B3E] space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider">Scheduled Sessions</span>
                <Calendar size={16} className="text-cyan-400" />
              </div>
              <p className="text-2xl font-bold text-white">{scheduledRooms.length}</p>
            </div>

            <div className="bg-[#0F172A] p-5 rounded-2xl border border-[#232B3E] space-y-1">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs font-bold uppercase tracking-wider">Fan Tipping Enabled</span>
                <DollarSign size={16} className="text-[#00FF85]" />
              </div>
              <p className="text-2xl font-bold text-white">Active</p>
            </div>
          </div>

          {/* Active Live Rooms Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <Radio size={14} className="text-[#FF0044] animate-pulse" />
                <span>Your Live Streaming Rooms ({activeRooms.length})</span>
              </h2>
            </div>

            {loading ? (
              <div className="p-12 text-center bg-[#0F172A]/50 rounded-3xl border border-[#232B3E]">
                <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-zinc-400">Loading your listening rooms...</p>
              </div>
            ) : activeRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeRooms.map((room: any) => (
                  <div
                    key={room.id}
                    className="bg-[#0F172A] border border-[#232B3E] hover:border-[#8A2BE2] rounded-3xl p-5 space-y-4 transition-all duration-200 group flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Room Cover & Status */}
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#192134] border border-[#232B3E]">
                        <img
                          src={
                            resolveIpfsUrl(
                              room.cover_url ||
                              room.cover_image ||
                              room.host_avatar ||
                              'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80'
                            )
                          }
                          alt={room.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-80" />
                        
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider text-[#FF0044] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#FF0044] animate-ping" />
                          <span>LIVE</span>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-bold">
                          <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                            {room.genre || 'Afrobeat'}
                          </span>
                          <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                            <Users size={12} className="text-[#00FF85]" />
                            <span>{room.max_listeners || 500} Max</span>
                          </span>
                        </div>
                      </div>

                      {/* Room Details */}
                      <div>
                        <h3 className="font-['Clash_Display',sans-serif] text-lg font-bold text-white group-hover:text-accent-purple transition-colors truncate">
                          {room.title}
                        </h3>
                        <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                          {room.description || 'Live audio streaming session hosted by creator.'}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => router.push(`/rooms/${room.id}`)}
                      className="w-full py-3 bg-[#8A2BE2] hover:bg-[#7823c9] text-white text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(138,43,226,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                    >
                      <Play size={14} fill="currentColor" />
                      <span>Enter Live Room Studio</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-[#0F172A]/50 rounded-3xl border border-[#232B3E] space-y-4">
                <div className="w-14 h-14 bg-[#8A2BE2]/10 border border-[#8A2BE2]/30 rounded-2xl flex items-center justify-center mx-auto text-accent-purple">
                  <Radio size={28} />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h3 className="text-base font-bold text-white">No Live Rooms Hosted Yet</h3>
                  <p className="text-xs text-zinc-400">
                    Create your first live listening room to stream stems, test unreleased tracks, and interact live with your fans.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-5 py-2.5 bg-[#8A2BE2] hover:bg-[#7823c9] text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(138,43,226,0.4)] cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus size={15} />
                  <span>Setup Your Listening Room</span>
                </button>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Official 3-Step Create Room Modal (Figma Spec) */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRoomCreated={() => loadRooms()}
      />
    </div>
  );
}
