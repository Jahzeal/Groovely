'use client';

import React from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { 
  Users, 
  MessageSquare, 
  Headphones, 
  Plus, 
  ArrowRight, 
  Heart,
  Share2,
  MoreHorizontal,
  Search,
  Zap,
  Globe,
  HelpCircle,
  FileText
} from 'lucide-react';

// --- Mock Data ---

const featuredRooms = [
  { id: 1, title: 'Afrobeats Midnight Mix', host: 'JahzealDave', listeners: 124, image: 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?w=300&h=300&fit=crop' },
  { id: 2, title: 'Beatmaking Workshop', host: 'SilentShadow', listeners: 89, image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop' },
  { id: 3, title: 'New Release Listening', host: 'NightWhisper', listeners: 256, image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop' }
];

const feedItems = [
  {
    id: 1,
    user: 'CyberWitch',
    action: 'posted in',
    target: 'Creator Tips',
    content: 'Just discovered a new way to optimize vocal tracks for Web3 streaming. Anyone interested in a tutorial?',
    time: '2h ago',
    likes: 24,
    comments: 8,
    avatar: 'https://i.pravatar.cc/150?u=cyberwitch'
  },
  {
    id: 2,
    user: 'SolarChill',
    action: 'started a new room',
    target: 'Summer Vibes 2026',
    content: 'Come join me for some relaxed afternoon beats. Bringing some unreleased tracks today!',
    time: '4h ago',
    likes: 56,
    comments: 12,
    avatar: 'https://i.pravatar.cc/150?u=solarchill'
  }
];

// --- Sub-components ---

const CommunityStat = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-[#0F0F1A]/40 border border-white/5 rounded-2xl p-6 flex items-center gap-6 group hover:bg-[#0F0F1A]/60 transition-all">
    <div className={`w-12 h-12 rounded-xl bg-${color}/10 border border-${color}/20 flex items-center justify-center text-${color} group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{label}</p>
    </div>
  </div>
);

const RoomCard = ({ room }: any) => (
  <div className="glass-card p-4 flex flex-col gap-4 group hover:border-accent-purple/30 transition-all">
    <div className="relative aspect-square rounded-xl overflow-hidden shadow-2xl">
      <img src={room.image} alt={room.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded-md flex items-center gap-1 animate-pulse">
        <div className="w-1.5 h-1.5 bg-white rounded-full" />
        Live
      </div>
      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1.5">
        <Users size={12} />
        {room.listeners}
      </div>
    </div>
    <div>
      <h3 className="text-sm font-black text-white truncate group-hover:text-accent-purple transition-colors mb-1">{room.title}</h3>
      <p className="text-xs font-bold text-zinc-500">Host: <span className="text-zinc-300">@{room.host}</span></p>
    </div>
    <button className="w-full bg-white/5 hover:bg-accent-purple text-zinc-400 hover:text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
      Join Room
    </button>
  </div>
);

export default function CommunityPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#050510] text-white font-sans selection:bg-accent-cyan selection:text-black">
      <Sidebar activePage="community" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />

        <main className="flex-1 p-10 overflow-y-auto mesh-gradient custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-16 animate-in fade-in slide-in-from-top-8 duration-700">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-accent-purple/10 border border-accent-purple/20 px-3 py-1.5 rounded-full text-accent-purple text-[10px] font-black uppercase tracking-widest mb-6">
                  <Zap size={12} fill="currentColor" />
                  Community Hub
                </div>
                <h1 className="text-6xl font-black tracking-tighter text-white mb-6 leading-[0.95]">Connect with the <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-cyan">Sound.</span></h1>
                <p className="text-zinc-400 text-lg font-medium leading-relaxed mb-8">Join thousands of creators and fans in live listening rooms, discussions, and collaborative sessions. Your community is waiting.</p>
                <div className="flex flex-wrap items-center gap-4">
                  <button className="bg-accent-purple hover:bg-opacity-90 text-white font-black py-4 px-8 rounded-2xl transition-all shadow-[0_0_30px_rgba(157,0,255,0.3)] hover:scale-105 active:scale-95 text-xs uppercase tracking-widest flex items-center gap-2">
                    <Plus size={18} />
                    Start a Discussion
                  </button>
                  <button className="bg-white/5 hover:bg-white/10 text-white font-black py-4 px-8 rounded-2xl transition-all border border-white/5 text-xs uppercase tracking-widest">
                    Browse All Rooms
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                <CommunityStat label="Global Members" value="12.4k" icon={Globe} color="accent-purple" />
                <CommunityStat label="Active Rooms" value="84" icon={Headphones} color="accent-cyan" />
                <CommunityStat label="Messages/Day" value="45k" icon={MessageSquare} color="amber-500" />
                <CommunityStat label="Top Creators" value="850" icon={Zap} color="emerald-500" />
              </div>
            </div>

            {/* Featured Listening Rooms */}
            <div className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white mb-1">Live Listening Rooms</h2>
                  <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Happening right now</p>
                </div>
                <button className="text-accent-cyan text-xs font-black uppercase tracking-widest flex items-center gap-2 group">
                  View All Rooms
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredRooms.map(room => (
                  <RoomCard key={room.id} room={room} />
                ))}
                <div className="border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-4 group hover:border-accent-purple/30 hover:bg-white/[0.01] transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-600 group-hover:text-accent-purple transition-colors">
                    <Plus size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400">Host New Room</span>
                </div>
              </div>
            </div>

            {/* Main Content Grid (Feed & Sidebar) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Activity Feed */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-black uppercase tracking-widest text-white">Community Feed</h2>
                  <div className="flex gap-2">
                    <button className="bg-white/5 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-white">Latest</button>
                    <button className="text-zinc-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Trending</button>
                  </div>
                </div>

                {feedItems.map(item => (
                  <div key={item.id} className="glass-card p-6 flex gap-5 group">
                    <img src={item.avatar} alt={item.user} className="w-12 h-12 rounded-full border border-white/10" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm">
                          <span className="font-black text-white hover:text-accent-purple cursor-pointer transition-colors">@{item.user}</span>
                          <span className="text-zinc-500 font-bold ml-2">{item.action}</span>
                          <span className="text-accent-cyan font-black ml-2 hover:underline cursor-pointer">{item.target}</span>
                        </p>
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{item.time}</span>
                      </div>
                      <p className="text-zinc-300 font-medium leading-relaxed mb-6">{item.content}</p>
                      <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 text-zinc-600 hover:text-red-400 transition-colors group/btn">
                          <Heart size={16} className="group-hover/btn:scale-110 transition-transform" />
                          <span className="text-xs font-black">{item.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 text-zinc-600 hover:text-accent-purple transition-colors group/btn">
                          <MessageSquare size={16} className="group-hover/btn:scale-110 transition-transform" />
                          <span className="text-xs font-black">{item.comments}</span>
                        </button>
                        <button className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors">
                          <Share2 size={16} />
                        </button>
                        <button className="ml-auto text-zinc-700 hover:text-white transition-colors">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button className="w-full py-6 text-zinc-600 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">
                  Load more activities
                </button>
              </div>

              {/* Community Sidebar */}
              <div className="lg:col-span-4 space-y-8">
                {/* Search Sidebar */}
                <div className="relative group">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search discussions..." 
                    className="w-full bg-[#0F0F1A] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-accent-purple/30 transition-all"
                  />
                </div>

                {/* Support Section */}
                <div className="glass-card p-8 bg-gradient-to-br from-white/[0.02] to-transparent">
                  <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan mb-6">
                    <HelpCircle size={24} />
                  </div>
                  <h3 className="text-lg font-black text-white mb-2">Need Support?</h3>
                  <p className="text-zinc-500 text-sm font-medium mb-8 leading-relaxed">Our support team and documentation are here to help you with anything you need.</p>
                  <div className="space-y-3">
                    <a href="#" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group">
                      <div className="flex items-center gap-3">
                        <FileText size={18} className="text-zinc-500 group-hover:text-accent-purple transition-colors" />
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-300">Documentation</span>
                      </div>
                      <ArrowRight size={14} className="text-zinc-700 group-hover:text-white transition-colors" />
                    </a>
                    <a href="#" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group">
                      <div className="flex items-center gap-3">
                        <MessageSquare size={18} className="text-zinc-500 group-hover:text-accent-cyan transition-colors" />
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-300">Support Ticket</span>
                      </div>
                      <ArrowRight size={14} className="text-zinc-700 group-hover:text-white transition-colors" />
                    </a>
                  </div>
                </div>

                {/* Trending Topics */}
                <div className="space-y-4 px-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Trending Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {['#Web3Music', '#CreatorEarnings', '#MintingTips', '#CommunityEvents', '#SoundCheck'].map(tag => (
                      <span key={tag} className="text-[10px] font-black text-zinc-500 hover:text-accent-purple cursor-pointer transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
