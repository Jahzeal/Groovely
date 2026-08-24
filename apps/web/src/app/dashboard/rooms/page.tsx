'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Plus, 
  Radio, 
  Users, 
  Lock, 
  Globe, 
  Clock,
  Music2,
  Play,
  SkipBack,
  SkipForward,
  Shuffle,
  MessageSquare,
  ListMusic
} from 'lucide-react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';

type Step = 'setup' | 'confirm' | 'live' | 'room';

export default function ListeningRoomPage() {
  const [step, setStep] = useState<Step>('setup');
  const [roomData, setRoomData] = useState({
    title: '',
    limit: 10,
    isLimitEnabled: false,
    visibility: 'public',
    startTime: 'Now',
  });

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('setup');
    } else if (step === 'live') {
      setStep('confirm');
    } else {
      window.history.back();
    }
  };

  const renderSetup = () => (
    // ... setup UI ...
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#0A0A15] border border-white/5 rounded-3xl p-10 space-y-8 shadow-2xl">
        {/* Room Title */}
        <div className="space-y-4">
          <label className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Room Title</label>
          <input 
            type="text" 
            placeholder="Room Title"
            value={roomData.title}
            onChange={(e) => setRoomData({ ...roomData, title: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white text-lg font-medium focus:outline-none focus:border-accent-purple/50 transition-all placeholder-white/20"
          />
        </div>

        {/* Set Limit */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Set Limit</label>
            <button 
              onClick={() => setRoomData({ ...roomData, isLimitEnabled: !roomData.isLimitEnabled })}
              className={`w-12 h-6 rounded-full transition-all duration-300 relative ${roomData.isLimitEnabled ? 'bg-accent-purple' : 'bg-zinc-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${roomData.isLimitEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          <input 
            type="number" 
            value={roomData.limit}
            onChange={(e) => setRoomData({ ...roomData, limit: parseInt(e.target.value) })}
            disabled={!roomData.isLimitEnabled}
            className={`w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white text-center text-xl font-black transition-all ${!roomData.isLimitEnabled && 'opacity-30'}`}
          />
        </div>

        {/* Room Playlist */}
        <div className="space-y-4">
          <label className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Room Playlist</label>
          <div className="w-32 h-32 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-white/10 hover:border-accent-purple/50 transition-all group">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="text-white" size={24} />
            </div>
          </div>
        </div>

        {/* Visibility Settings */}
        <div className="space-y-4">
          <label className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Visibility Settings</label>
          <div className="flex gap-4">
            <button 
              onClick={() => setRoomData({ ...roomData, visibility: 'public' })}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border transition-all ${roomData.visibility === 'public' ? 'bg-white/10 border-accent-purple text-white' : 'bg-white/5 border-white/5 text-zinc-500'}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${roomData.visibility === 'public' ? 'border-accent-purple' : 'border-zinc-700'}`}>
                {roomData.visibility === 'public' && <div className="w-2.5 h-2.5 bg-accent-purple rounded-full" />}
              </div>
              <span className="font-bold">Public</span>
            </button>
            <button 
              onClick={() => setRoomData({ ...roomData, visibility: 'private' })}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border transition-all ${roomData.visibility === 'private' ? 'bg-white/10 border-accent-purple text-white' : 'bg-white/5 border-white/5 text-zinc-500'}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${roomData.visibility === 'private' ? 'border-accent-purple' : 'border-zinc-700'}`}>
                {roomData.visibility === 'private' && <div className="w-2.5 h-2.5 bg-accent-purple rounded-full" />}
              </div>
              <span className="font-bold">Private</span>
            </button>
          </div>
        </div>

        {/* Start Time */}
        <div className="space-y-4">
          <label className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Start Time</label>
          <div className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white/50 text-sm font-medium">
            Placeholder for start time picker...
          </div>
        </div>
      </div>

      <div className="mt-10">
        <button 
          onClick={() => setStep('confirm')}
          className="w-full bg-accent-purple hover:bg-opacity-90 text-white font-black py-6 rounded-2xl text-xl uppercase tracking-tighter shadow-[0_0_30px_rgba(157,0,255,0.3)] transform active:scale-[0.98] transition-all"
        >
          Host Room
        </button>
      </div>
    </div>
  );

  const renderConfirm = () => (
    <div className="max-w-lg mx-auto animate-in fade-in zoom-in duration-500">
      <div className="bg-[#0A0A15] border border-white/5 rounded-3xl p-10 space-y-10 shadow-2xl">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-6">
            <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Room Title</span>
            <span className="text-white font-black text-lg">{roomData.title || 'Untitled Room'}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-6">
            <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Holding Limit</span>
            <span className="text-white font-black text-lg">{roomData.isLimitEnabled ? roomData.limit : 'No Limit'}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-6">
            <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Room Playlist</span>
            <button className="text-accent-purple font-black text-sm uppercase tracking-widest hover:underline">View Playlist</button>
          </div>

          <div className="grid grid-cols-5 gap-3 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`aspect-square rounded-lg ${i === 5 ? 'bg-zinc-800' : 'bg-zinc-300/10'}`} />
            ))}
          </div>

          <div className="flex justify-between items-center pt-6">
            <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Visibility</span>
            <span className="text-white font-black text-lg capitalize">{roomData.visibility}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Start Time</span>
            <span className="text-white font-black text-lg">{roomData.startTime}</span>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <button 
          onClick={() => setStep('live')}
          className="w-full bg-accent-purple hover:bg-opacity-90 text-white font-black py-6 rounded-2xl text-2xl uppercase tracking-tighter shadow-[0_0_40px_rgba(157,0,255,0.4)] transform active:scale-[0.98] transition-all"
        >
          GO LIVE
        </button>
      </div>
    </div>
  );

  const renderLive = () => (
    <div className="max-w-lg mx-auto flex flex-col items-center justify-center pt-10 animate-in fade-in zoom-in slide-in-from-top-4 duration-700">
      <div className="w-40 h-40 bg-zinc-300/20 rounded-full mb-10 border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.1)] flex items-center justify-center">
        <Radio className="text-white/20" size={60} />
      </div>
      
      <h2 className="text-5xl font-black tracking-tighter text-white mb-12 text-center">
        Your Room is Now Live
      </h2>

      <button 
        onClick={() => setStep('room')}
        className="w-full max-w-sm bg-accent-purple hover:bg-opacity-90 text-white font-black py-6 rounded-2xl text-xl uppercase tracking-widest shadow-[0_0_50px_rgba(157,0,255,0.5)] transform hover:scale-105 active:scale-95 transition-all"
      >
        Visit Room
      </button>
    </div>
  );

  const renderActiveRoom = () => (
    <div className="flex-1 flex flex-col h-full animate-in fade-in duration-1000">
      {/* Room Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            Live Now
          </div>
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold">
            <Users size={14} />
            <span>243 listening</span>
          </div>
        </div>

        <h2 className="text-2xl font-black tracking-tight text-white absolute left-1/2 -translate-x-1/2">
          {roomData.title}
        </h2>

        <div className="flex items-center gap-3">
          <button className="bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl border border-white/5 transition-all text-sm">
            Share
          </button>
          <button 
            onClick={() => setStep('setup')}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all text-sm shadow-[0_0_20px_rgba(239,68,68,0.2)]"
          >
            End Room
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-8 min-h-0">
        {/* Left Column: Player and Stage */}
        <div className="col-span-3 flex flex-col gap-8">
          <div className="bg-[#0A0A15]/60 border border-white/5 rounded-3xl p-6 space-y-6 flex flex-col">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl relative group">
              <img 
                src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&auto=format&fit=crop&q=60" 
                alt="Album Art" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-black tracking-tight text-white">Neon Dreams (Web3 Mix)</h3>
              <p className="text-zinc-500 text-sm font-medium">Uzor • The Collection</p>
            </div>

            <div className="flex items-center justify-between px-2">
              <button className="text-zinc-500 hover:text-white transition-colors">
                <SkipBack size={24} strokeWidth={1.5} />
              </button>
              <button className="w-14 h-14 bg-accent-purple rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(157,0,255,0.4)] hover:scale-105 active:scale-95 transition-all outline-none">
                <Play className="text-white fill-current ml-1" size={24} />
              </button>
              <button className="text-zinc-500 hover:text-white transition-colors">
                <SkipForward size={24} strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-2 px-2">
              <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                <span>01:27</span>
                <span>05:32</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-accent-purple w-1/3 shadow-[0_0_10px_rgba(157,0,255,0.5)] transition-all" />
              </div>
            </div>

            <div className="flex items-center justify-between px-2 text-zinc-500">
               <Shuffle size={18} className="hover:text-white transition-colors cursor-pointer" />
               <div className="flex items-center gap-6">
                  <MessageSquare size={18} className="hover:text-white transition-colors cursor-pointer" />
                  <ListMusic size={18} className="hover:text-white transition-colors cursor-pointer" />
               </div>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">On Stage</h4>
                <button className="flex items-center gap-1.5 text-accent-purple text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity">
                   <Radio size={12} />
                   Mute All
                </button>
             </div>
             <div className="flex items-center gap-4">
                {[
                  { name: 'Uzor', role: 'Host', img: 'https://i.pravatar.cc/150?u=uzor' },
                  { name: 'Darrell', role: '', img: 'https://i.pravatar.cc/150?u=darrell' },
                  { name: 'Shane', role: '', img: 'https://i.pravatar.cc/150?u=shane' }
                ].map((user, idx) => (
                  <div key={idx} className="relative group cursor-pointer text-center">
                    <div className={`w-14 h-14 rounded-full border-2 ${idx === 0 ? 'border-accent-purple' : 'border-red-500'} p-0.5 mb-2 relative`}>
                      <img src={user.img} className="w-full h-full rounded-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#0F0F1A] rounded-full border border-white/10 flex items-center justify-center">
                         {idx === 2 ? <div className="w-2 h-2 bg-red-500 rounded-full" /> : <Radio size={10} className="text-accent-purple" />}
                      </div>
                    </div>
                    <p className="text-[10px] font-black text-white uppercase tracking-wider">{user.name}</p>
                    {user.role && <p className="text-[8px] font-bold text-accent-purple uppercase tracking-widest mt-0.5">{user.role}</p>}
                  </div>
                ))}
                <div className="w-14 h-14 rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-zinc-500 font-black text-xs">
                  +3
                </div>
             </div>
          </div>
        </div>

        {/* Center Column: Listeners Grid */}
        <div className="col-span-6 flex flex-col">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-6">Listeners (243)</h4>
          <div className="grid grid-cols-4 gap-y-10 gap-x-8 overflow-y-auto pr-4 scrollbar-hide">
            {Array.from({ length: 16 }).map((_, i) => {
              const names = ['Mitchell', 'Kyle', 'Debra', 'Esther', 'Soham', 'Leslie', 'Dianne', 'Ronald', 'Arthur', 'Eduardo', 'Greg', 'Darlene', 'Kristin', 'Arlene', 'Cody', 'Aubrey'];
              return (
                <div key={i} className="flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="w-16 h-16 rounded-full p-0.5 border-2 border-accent-purple/30 hover:border-accent-purple transition-all cursor-pointer group">
                    <img 
                      src={`https://i.pravatar.cc/150?u=${names[i]}`} 
                      className="w-full h-full rounded-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all" 
                    />
                  </div>
                  <span className="text-xs font-black text-white/80 tracking-wide">{names[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chat Sidebar */}
        <div className="col-span-3 bg-[#0A0A15]/60 border border-white/5 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
          <div className="flex border-b border-white/5">
            <button className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-accent-purple border-b-2 border-accent-purple bg-accent-purple/5">Chat</button>
            <button className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">Activity</button>
          </div>

          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest flex items-center gap-2">
                <Lock size={10} /> Lock Chat
              </span>
            </div>
            
            {[
              { author: 'Sarah.eth', time: '11:32AM', content: "This beat is absolutely fire🔥 Can't wait for the drop!", img: 'https://i.pravatar.cc/150?u=sarah' },
              { author: 'skinpop', time: '01:32AM', content: 'Wen token?🚀', img: 'https://i.pravatar.cc/150?u=skin' },
              { author: 'Cub3 (Host)', time: '03:06AM', content: 'Thanks guys! Minting starts in 5 mins. Check the pinned link.', img: 'https://i.pravatar.cc/150?u=cub3', isHost: true },
              { author: 'overlisted', time: '07:54PM', content: 'Love the vibes here', img: 'https://i.pravatar.cc/150?u=list' }
            ].map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.isHost ? 'bg-accent-purple/10 -mx-6 px-6 py-4' : ''}`}>
                <img src={msg.img} className="w-8 h-8 rounded-lg object-cover grayscale-[0.2]" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${msg.isHost ? 'text-accent-purple' : 'text-white/90'}`}>{msg.author}</span>
                    <span className="text-[8px] font-bold text-zinc-700">{msg.time}</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#0F0F1A] border-t border-white/5 space-y-4">
             <div className="flex items-center gap-3 pb-2 overflow-x-auto scrollbar-hide">
                {['💜', '🔥', '💯', '🚀', '👏'].map((emoji, i) => (
                   <button key={i} className="text-lg grayscale hover:grayscale-0 transition-all transform hover:scale-125 active:scale-90">{emoji}</button>
                ))}
                <Plus size={14} className="text-zinc-600 ml-auto cursor-pointer" />
             </div>
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Say something"
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 pr-12 text-sm font-medium focus:outline-none focus:border-accent-purple/30 transition-all placeholder-zinc-700"
                />
                <button className="absolute right-2 top-1.5 w-8 h-8 bg-accent-purple rounded-lg flex items-center justify-center hover:scale-105 active:scale-90 transition-all rotate-[-45deg] shadow-[0_0_15px_rgba(157,0,255,0.3)]">
                   <ChevronLeft size={16} className="text-white rotate-[180deg]" />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen overflow-hidden bg-[#192134] text-white font-sans ${step === 'room' ? 'h-screen overflow-hidden' : ''}`}>
      <Sidebar activePage={step === 'room' ? 'rooms' : ''} />
      <div className="flex-1 flex flex-col overflow-hidden bg-[#192134]">
        <header className="flex items-center justify-between px-10 py-8 bg-[#192134] border-b border-[#2D3548]">
          {step !== 'live' && step !== 'room' && (
            <button 
              onClick={handleBack}
              className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all border border-white/5">
                <ChevronLeft size={20} strokeWidth={3} />
              </div>
              <span className="font-black uppercase tracking-widest text-sm">Back</span>
            </button>
          )}

          {step !== 'room' && (
            <h1 className={`text-3xl font-black tracking-tight text-white mb-0 absolute left-1/2 -translate-x-1/2 ${step === 'live' ? 'hidden' : ''}`}>
              {step === 'setup' ? 'Setup Your Listening Room' : 'Are You Ready To Go Live?'}
            </h1>
          )}
          <div className="w-24" /> {/* Spacer */}
        </header>

        <main className={`flex-1 p-10 overflow-y-auto ${step === 'live' ? 'flex items-center justify-center' : ''} ${step === 'room' ? 'pt-0' : ''}`}>
          {step === 'setup' ? renderSetup() : step === 'confirm' ? renderConfirm() : step === 'live' ? renderLive() : renderActiveRoom()}
        </main>
      </div>
    </div>
  );
}
