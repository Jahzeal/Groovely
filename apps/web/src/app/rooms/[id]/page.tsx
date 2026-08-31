'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, ListMusic, 
  Mic, MicOff, Volume2, VolumeX, Send, Lock, Unlock, PhoneOff, 
  Users, MessageSquare, Radio, Share2, Sparkles, Heart, Flame, Hand, 
  ArrowLeft, Check, Copy, ChevronDown, Plus
} from 'lucide-react';
import { apiFetch, cachedApiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

export default function LiveRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const roomId = resolvedParams?.id;
  const router = useRouter();

  const [room, setRoom] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Live Player State
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTimeMs, setCurrentTimeMs] = useState(87000); // 01:27
  const [durationMs, setDurationMs] = useState(332000); // 05:32
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'activity'>('chat');
  const [chatMessage, setChatMessage] = useState('');
  const [isChatLocked, setIsChatLocked] = useState(false);

  // Floating Reactions State
  const [floatingReactions, setFloatingReactions] = useState<{ id: number; emoji: string; left: number }[]>([]);

  useEffect(() => {
    if (!roomId) return;

    async function fetchRoomData() {
      try {
        const { data } = await cachedApiFetch(`/api/rooms/${roomId}`, {
          onBackgroundUpdate: (fresh: any) => {
            if (fresh?.data) {
              setRoom(fresh.data.room);
              if (fresh.data.participants) setParticipants(fresh.data.participants);
              if (fresh.data.playlist) setPlaylist(fresh.data.playlist);
              if (fresh.data.messages) setMessages(fresh.data.messages);
            }
          }
        });

        if (data?.data) {
          setRoom(data.data.room);
          setParticipants(data.data.participants || []);
          setPlaylist(data.data.playlist || []);
          setMessages(data.data.messages || []);
        }
      } catch (err) {
        console.error('Failed to load room details:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRoomData();
  }, [roomId]);

  // Handle Sending Chat Messages
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newMsg = {
      id: Date.now(),
      display_name: 'You (Host)',
      username: 'host',
      content: chatMessage.trim(),
      message_type: 'text',
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isHost: true,
    };

    setMessages([...messages, newMsg]);
    setChatMessage('');
  };

  // Handle Floating Emoji Reactions (💜, 🔥, 💯, 🚀, 👋)
  const triggerReaction = (emoji: string) => {
    const reaction = {
      id: Date.now(),
      emoji,
      left: Math.floor(Math.random() * 70) + 15,
    };
    setFloatingReactions(prev => [...prev, reaction]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== reaction.id));
    }, 2500);
  };

  const handleEndRoom = async () => {
    if (confirm('Are you sure you want to end this live room?')) {
      try {
        await apiFetch(`/api/rooms/${roomId}/end`, { method: 'POST' });
        toast.success('Room session ended');
        router.push('/rooms');
      } catch (err) {
        toast.error('Failed to end room');
      }
    }
  };

  // Demo Speakers & Listeners matching Figma Spec
  const onStageSpeakers = [
    { name: 'Uzor', role: 'Host', isMuted: false, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
    { name: 'Darrell', role: 'Co-Host', isMuted: false, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
    { name: 'Shane', role: 'Speaker', isMuted: true, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
  ];

  const listenersList = [
    'Mitchell', 'Kyle', 'Debra', 'Esther', 'Soham', 'Leslie', 'Dianne', 'Ronald',
    'Arthur', 'Eduardo', 'Greg', 'Darlene', 'Kristin', 'Arlene', 'Cody', 'Aubrey',
    'Colleen', 'Philip', 'Max'
  ];

  const demoMessages = [
    { name: 'Sarah.eth', time: '11:32AM', text: 'This beat is absolutely fire🔥 Can&apos;t wait for the drop!', isHost: false },
    { name: 'skinpop', time: '01:32AM', text: 'Wen token?🚀', isHost: false },
    { name: 'Cub3 (Host)', time: '03:06AM', text: 'Thanks guys! Minting starts in 5 mins. Check the pinned link.', isHost: true },
    { name: 'overlisted', time: '07:54PM', text: 'Love the vibes here', isHost: false },
  ];

  const activeMessages = messages.length > 0 ? messages : demoMessages;

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-['Space_Grotesk',sans-serif] flex flex-col overflow-x-hidden select-none">
      
      {/* ── TOP HEADER BAR (Figma Spec) ── */}
      <header className="h-[76px] px-6 sm:px-10 border-b border-[#232B3E] bg-[#0F172A]/90 backdrop-blur-md flex items-center justify-between z-30">
        
        {/* Left: Live Status Badges */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/rooms')}
            className="p-2 text-zinc-400 hover:text-white rounded-lg bg-[#192134] border border-[#2D3548] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Frame 102: LIVE NOW Red Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#FF0044]/10 border border-[#FF0044]/30 text-[#FF0044] text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#FF0044] animate-ping" />
            <span>LIVE NOW</span>
          </div>

          {/* Frame 103: Listener Count */}
          <div className="hidden sm:flex items-center gap-2 text-zinc-400 text-xs font-medium">
            <Users size={16} className="text-zinc-400" />
            <span>243 listening</span>
          </div>
        </div>

        {/* Center: Room Title */}
        <h1 className="font-['Clash_Display',sans-serif] text-lg sm:text-2xl font-bold text-white tracking-wide truncate max-w-md text-center">
          {room?.title || 'Midnight Lo-Fi & Crypto Talk'}
        </h1>

        {/* Right: End Room & Share Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Room link copied!');
            }}
            className="px-4 py-2.5 bg-[#192134] hover:bg-[#232B3E] text-white font-bold text-xs rounded-xl border border-[#2D3548] transition-all flex items-center gap-1.5"
          >
            <Share2 size={15} />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={handleEndRoom}
            className="px-5 py-2.5 bg-[#FF0044] hover:bg-[#d60039] text-white font-bold text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(255,0,68,0.4)] flex items-center gap-1.5"
          >
            <PhoneOff size={15} />
            <span>End Room</span>
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT GRID (1512px Figma Layout) ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 max-w-[1600px] mx-auto w-full">
        
        {/* ── LEFT COLUMN (4 Cols): CURRENT PLAYING TRACK & PLAYER CONTROLS ── */}
        <div className="lg:col-span-4 flex flex-col items-center space-y-6 bg-[#0F172A] p-6 rounded-3xl border border-[#232B3E]">
          
          {/* Rectangle 6: Album Artwork (320x320px) */}
          <div className="relative w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden border border-[#2D3548] shadow-[0_15px_40px_rgba(0,0,0,0.8)] group">
            <img
              src={room?.current_track_cover || 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?auto=format&fit=crop&w=600&q=80'}
              alt="Track Artwork"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono font-bold text-accent-purple border border-accent-purple/30">
              HQ STEMS 24-BIT
            </div>
          </div>

          {/* Track Title & Artist Info */}
          <div className="text-center space-y-1.5 w-full">
            <h2 className="font-['Clash_Display',sans-serif] text-xl font-bold text-white truncate">
              {room?.current_track_title || 'Neon Dreams (Web3 Mix)'}
            </h2>
            <div className="flex items-center justify-center gap-2 text-sm text-[#CACACA] font-bold">
              <span>{room?.host_name || 'Uzor'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#CACACA]" />
              <span>The Collection</span>
            </div>
          </div>

          {/* Player Controls (Frame: Backward, Play 64px #8A2BE2, Forward) */}
          <div className="flex items-center justify-center gap-8 py-2">
            <button className="text-[#CACACA] hover:text-white transition-colors p-2">
              <SkipBack size={28} />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-full bg-[#8A2BE2] hover:bg-[#7823c9] text-white flex items-center justify-center transition-all shadow-[0_0_30px_rgba(138,43,226,0.6)]"
            >
              {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </button>

            <button className="text-[#CACACA] hover:text-white transition-colors p-2">
              <SkipForward size={28} />
            </button>
          </div>

          {/* Timecode & Progress Slider (01:27 / 05:32) */}
          <div className="w-full max-w-[320px] space-y-2">
            <div className="relative w-full h-1.5 bg-[#CACACA]/30 rounded-full overflow-hidden cursor-pointer">
              <div className="h-full bg-[#8A2BE2] rounded-full w-[35%]" />
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-[#CACACA]">
              <span>01:27</span>
              <span>05:32</span>
            </div>
          </div>

          {/* Additional Player Actions (Shuffle, Repeat, Playlist) */}
          <div className="flex items-center justify-between w-full max-w-[320px] pt-4 border-t border-[#232B3E] text-[#CACACA]">
            <button className="hover:text-accent-purple transition-colors p-2">
              <Shuffle size={20} />
            </button>

            <div className="flex items-center gap-4">
              <button className="hover:text-accent-purple transition-colors p-2">
                <Repeat size={20} />
              </button>
              <button className="hover:text-accent-purple transition-colors p-2">
                <ListMusic size={20} />
              </button>
            </div>
          </div>

        </div>

        {/* ── CENTER COLUMN (4 Cols): ON STAGE & LIVE LISTENERS GRID ── */}
        <div className="lg:col-span-4 flex flex-col space-y-8">
          
          {/* ON STAGE SECTION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#CACACA]">
                ON STAGE
              </h3>
              <button className="flex items-center gap-1.5 text-xs font-bold text-accent-purple hover:underline">
                <MicOff size={14} />
                <span>Mute All</span>
              </button>
            </div>

            {/* Stage Speakers Grid */}
            <div className="flex items-center gap-6 overflow-x-auto pb-2">
              {onStageSpeakers.map((speaker, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="relative w-16 h-16 rounded-full p-1 border-2 border-[#4E0AA6] shadow-[0_0_15px_rgba(78,10,166,0.5)]">
                    <img
                      src={speaker.avatar}
                      alt={speaker.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#0F172A] flex items-center justify-center ${speaker.isMuted ? 'bg-[#FF0044] text-white' : 'bg-[#8A2BE2] text-white'}`}>
                      {speaker.isMuted ? <MicOff size={12} /> : <Mic size={12} />}
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs font-bold text-white group-hover:text-accent-purple transition-colors">
                      {speaker.name}
                    </p>
                    <span className="text-[10px] font-bold text-accent-purple bg-[#8A2BE2]/10 px-2 py-0.5 rounded-full border border-[#8A2BE2]/20">
                      {speaker.role}
                    </span>
                  </div>
                </div>
              ))}

              {/* Add Co-Host Slot */}
              <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-[#192134] border border-dashed border-[#2D3548] group-hover:border-[#8A2BE2] flex items-center justify-center text-zinc-400 group-hover:text-accent-purple transition-colors">
                  <Plus size={20} />
                </div>
                <span className="text-[10px] font-bold text-zinc-500">Invite</span>
              </div>
            </div>
          </div>

          {/* LISTENERS (243) GRID */}
          <div className="flex-1 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#CACACA]">
              LISTENERS (243)
            </h3>

            {/* Listener Avatar Cards Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-4 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
              {listenersList.map((name, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 group cursor-pointer">
                  <div className="w-14 h-14 rounded-full border border-[#4E0AA6]/50 overflow-hidden bg-[#192134]">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <span className="text-xs font-bold text-white truncate max-w-[60px] text-center">
                    {name}
                  </span>
                </div>
              ))}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-full bg-[#192134] border border-[#2D3548] flex items-center justify-center font-['Clash_Display',sans-serif] font-bold text-white">
                  +225
                </div>
                <span className="text-[10px] font-bold text-zinc-500">More</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN (4 Cols): CHAT & FLOATING EMOJI REACTIONS (Frame 99) ── */}
        <div className="lg:col-span-4 relative bg-[#192134] border border-[#232B3E] rounded-3xl overflow-hidden flex flex-col h-[740px] shadow-2xl">
          
          {/* Header Tabs: Chat vs Activity */}
          <div className="h-[56px] bg-[#232B3E] flex items-center border-b border-[#2D3548]">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 h-full font-bold text-sm flex items-center justify-center transition-colors relative ${activeTab === 'chat' ? 'text-accent-purple' : 'text-zinc-400 hover:text-white'}`}
            >
              <span>Chat</span>
              {activeTab === 'chat' && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#8A2BE2]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 h-full font-bold text-sm flex items-center justify-center transition-colors relative ${activeTab === 'activity' ? 'text-accent-purple' : 'text-zinc-400 hover:text-white'}`}
            >
              <span>Activity</span>
              {activeTab === 'activity' && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#8A2BE2]" />
              )}
            </button>

            <button
              onClick={() => setIsChatLocked(!isChatLocked)}
              className="px-4 text-accent-purple hover:text-white transition-colors flex items-center gap-1 text-xs font-bold"
            >
              {isChatLocked ? <Lock size={16} /> : <Unlock size={16} />}
              <span>{isChatLocked ? 'Locked' : 'Lock Chat'}</span>
            </button>
          </div>

          {/* Chat Stream Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {activeMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl transition-all ${msg.isHost ? 'bg-[#8A2BE2]/10 border border-[#8A2BE2]/30' : 'bg-[#0F172A]/50 border border-transparent'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${msg.isHost ? 'text-accent-purple' : 'text-[#E5E5E5]'}`}>
                    {msg.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">{msg.time || '11:32AM'}</span>
                </div>
                <p className="text-sm font-normal text-white leading-relaxed">
                  {msg.text || msg.content}
                </p>
              </div>
            ))}
          </div>

          {/* Floating Emoji Stream Canvas */}
          <div className="absolute inset-x-0 bottom-24 h-48 pointer-events-none overflow-hidden">
            {floatingReactions.map(r => (
              <div
                key={r.id}
                style={{ left: `${r.left}%` }}
                className="absolute bottom-0 text-3xl animate-bounce duration-1000 opacity-90 transition-all"
              >
                {r.emoji}
              </div>
            ))}
          </div>

          {/* Floating Emoji Bar (Frame 136: 💜 🔥 💯 🚀 👋) */}
          <div className="px-4 py-2 bg-[#0F172A]/60 backdrop-blur-md border-t border-[#2D3548] flex items-center justify-center gap-3">
            {['💜', '🔥', '💯', '🚀', '👋'].map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => triggerReaction(emoji)}
                className="text-2xl hover:scale-125 transition-transform p-1 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Footer Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 bg-[#0F172A] border-t border-[#2D3548] flex items-center gap-3">
            <input
              type="text"
              placeholder={isChatLocked ? 'Chat locked by host' : 'Say something...'}
              disabled={isChatLocked}
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="flex-1 bg-[#192134] border border-[#2D3548] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#8A2BE2]"
            />
            <button
              type="submit"
              disabled={isChatLocked || !chatMessage.trim()}
              className="w-11 h-11 bg-[#8A2BE2] hover:bg-[#7823c9] text-white rounded-xl flex items-center justify-center transition-all shadow-[0_0_15px_rgba(138,43,226,0.5)] disabled:opacity-40 cursor-pointer"
            >
              <Send size={18} />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
