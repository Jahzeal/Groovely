'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MarketTopBar } from '@/components/marketplace/MarketTopBar';
import { CartProvider } from '@/components/marketplace/CartContext';
import { CreateRoomModal } from '@/components/rooms/CreateRoomModal';
import { Headphones, Plus, Users, Radio, Calendar, Lock, Globe, Sparkles, Loader2 } from 'lucide-react';
import { cachedApiFetch } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ListeningRoomsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');

  useEffect(() => {
    async function fetchRooms() {
      try {
        const { data } = await cachedApiFetch('/api/rooms', {
          onBackgroundUpdate: (fresh: any) => {
            if (fresh?.data) setRooms(fresh.data);
          }
        });
        if (data?.data) {
          setRooms(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch rooms', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  const [userRole, setUserRole] = useState<string>('fan');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('groovely_role') || localStorage.getItem('grooveli_role') || 'fan';
      setUserRole(role.toLowerCase());
    }
  }, []);

  const handleCreateRoomClick = () => {
    if (userRole !== 'creator') {
      toast.error('Only verified Creators can create listening rooms. Fans can join any active room as a listener!');
      return;
    }
    setIsModalOpen(true);
  };

  const genres = ['All', 'Afrobeat', 'Hip Hop', 'Amapiano', 'R&B', 'Lo-Fi / Chill', 'Podcast / Discussion', 'Studio Session'];

  const filteredRooms = rooms.filter(r => {
    if (selectedGenre !== 'All' && r.genre?.toLowerCase() !== selectedGenre.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <CartProvider>
      <div className="flex h-screen overflow-hidden bg-[#192134] text-white font-sans">
        <Sidebar activePage="rooms" />

        <div className="flex-1 flex flex-col min-w-0 bg-[#192134]">
          <MarketTopBar />

          {/* Main scrollable content area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            
            {/* Header Banner */}
            <div className="relative rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden bg-gradient-to-r from-[#8A2BE2]/30 via-[#192134] to-[#00FF85]/10 border border-[#2D3548]">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8A2BE2]/20 border border-[#8A2BE2]/40 text-accent-purple text-xs font-bold uppercase tracking-widest mb-3">
                    <Radio size={14} className="animate-pulse" />
                    <span>Real-Time Creator Collaboration</span>
                  </div>
                  <h1 className="font-['Clash_Display',sans-serif] text-2xl sm:text-4xl font-extrabold text-white mb-2">
                    Live Listening Rooms
                  </h1>
                  <p className="text-zinc-400 text-sm max-w-xl">
                    Join live creator studio sessions, listen to unreleased stems in real-time, collaborate on stage, and chat with music producers around the world.
                  </p>
                </div>

                <button
                  onClick={handleCreateRoomClick}
                  className="px-6 py-3.5 bg-[#8A2BE2] hover:bg-[#7823c9] text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_25px_rgba(138,43,226,0.4)] flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Plus size={18} />
                  <span>Create Listening Room</span>
                </button>
              </div>
            </div>

            {/* Genre Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 custom-scrollbar">
              {genres.map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${selectedGenre === g ? 'bg-[#8A2BE2] text-white shadow-[0_0_15px_rgba(138,43,226,0.3)]' : 'bg-[#0F172A] border border-[#2D3548] text-zinc-400 hover:text-white'}`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Rooms Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-accent-purple animate-spin" />
              </div>
            ) : filteredRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map(room => (
                  <div key={room.id} className="bg-[#0F172A] border border-[#2D3548] hover:border-[#8A2BE2]/50 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-md">
                    <div>
                      {/* Top Meta */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Live Now
                        </span>

                        <div className="flex items-center gap-3 text-xs text-zinc-400 font-bold">
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {room.active_listeners || 1}
                          </span>
                          {room.room_type === 'private' ? <Lock size={14} /> : <Globe size={14} />}
                        </div>
                      </div>

                      {/* Room Cover & Host Info */}
                      <div className="flex gap-4 mb-4">
                        <img
                          src={room.cover_url || room.current_track_cover || 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?auto=format&fit=crop&w=600&q=80'}
                          alt={room.title}
                          className="w-20 h-20 rounded-xl object-cover border border-[#2D3548] shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-white group-hover:text-accent-purple transition-colors truncate">
                            {room.title}
                          </h3>
                          <p className="text-xs text-zinc-400 font-medium truncate mb-2">
                            Hosted by <span className="text-white font-bold">{room.host_name || 'Creator'}</span>
                          </p>
                          {room.genre && (
                            <span className="inline-block bg-[#192134] text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#2D3548]">
                              {room.genre}
                            </span>
                          )}
                        </div>
                      </div>

                      {room.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2 mb-4 font-medium">
                          {room.description}
                        </p>
                      )}
                    </div>

                    {/* Join Action Button */}
                    <Link href={`/rooms/${room.id}`}>
                      <button className="w-full bg-[#8A2BE2] hover:bg-[#7823c9] text-white font-bold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(138,43,226,0.3)]">
                        <Headphones size={15} />
                        <span>Join Room &amp; Listen</span>
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-[#0F172A] border border-[#2D3548] rounded-3xl p-8">
                <Headphones className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No Active Rooms Found</h3>
                <p className="text-zinc-400 text-xs max-w-md mx-auto mb-6">
                  Be the first creator to start a Live Listening Room, invite co-hosts, and share unreleased beats!
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 bg-[#8A2BE2] hover:bg-[#7823c9] text-white font-bold text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(138,43,226,0.4)] inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Create Listening Room</span>
                </button>
              </div>
            )}

          </main>
        </div>

        {/* Setup Your Listening Room Modal */}
        <CreateRoomModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onRoomCreated={(newRoom) => {
            setRooms([newRoom, ...rooms]);
          }}
        />
      </div>
    </CartProvider>
  );
}
