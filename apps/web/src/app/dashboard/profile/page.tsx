'use client';

import React from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { 
  Radio, 
  Users, 
  Headphones, 
  Globe 
} from 'lucide-react';
import Link from 'next/link';

// Mock Data
const profileData = {
  displayName: "Display Name",
  username: "@username",
  role: "Musician",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
  bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
  stats: {
    allTimePlays: "1.8M",
    followers: "120K",
    monthlyListeners: "50.3K"
  }
};

const discography = [
  {
    title: "FALLIN'",
    artist: "Fragment",
    plays: "449,003 Plays",
    image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&h=400&fit=crop"
  },
  {
    title: "Daydream",
    artist: "Obsidian",
    plays: "449,003 Plays",
    image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=600&h=400&fit=crop"
  },
  {
    title: "MINE",
    artist: "ShadowX",
    plays: "449,003 Plays",
    image: "https://images.unsplash.com/photo-1514525253361-bee8d48800d5?w=600&h=400&fit=crop"
  },
  {
    title: "METAGIRL (Remix) Feat. Nessy The Rilla",
    artist: "CosmicVibe",
    plays: "449,003 Plays",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop"
  },
  {
    title: "State of Sound Vol. 1",
    artist: "Reflection",
    plays: "449,003 Plays",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=400&fit=crop"
  },
  {
    title: "Dabow - WANNA BE",
    artist: "Starlight",
    plays: "449,003 Plays",
    image: "https://images.unsplash.com/photo-1526218626217-dc65a29bb444?w=600&h=400&fit=crop"
  }
];

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen bg-[#050510] text-white font-sans selection:bg-accent-cyan selection:text-black">
      <Sidebar activePage="profile" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />

        <main className="flex-1 p-10 overflow-y-auto mesh-gradient">
          <div className="max-w-6xl mx-auto space-y-12 pb-20">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-6">
                 <div className="w-32 h-32 rounded-full border-[4px] border-[#0A0A15] shadow-2xl overflow-hidden shrink-0">
                    <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover" />
                 </div>
                 <div className="space-y-2">
                    <div className="flex items-center gap-4">
                       <h1 className="text-4xl font-black tracking-tight text-white">{profileData.displayName}</h1>
                       <span className="text-zinc-500 font-bold text-sm">{profileData.username}</span>
                    </div>
                    <div className="inline-block bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-bold text-zinc-300">
                       {profileData.role}
                    </div>
                 </div>
              </div>
              <Link href="/dashboard/settings">
                 <button className="bg-accent-purple hover:bg-opacity-90 text-white font-black py-4 px-8 rounded-xl transition-all shadow-[0_0_30px_rgba(157,0,255,0.3)] hover:scale-105 active:scale-95 text-sm uppercase tracking-widest shrink-0">
                    Edit Profile
                 </button>
              </Link>
            </div>

            {/* About Section */}
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
               <h3 className="text-xl font-black uppercase tracking-widest text-white">About</h3>
               <p className="text-zinc-400 font-medium leading-relaxed max-w-4xl text-sm">
                  {profileData.bio}
               </p>
            </div>

            {/* Socials Section */}
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
               <h3 className="text-xl font-black uppercase tracking-widest text-white">Socials</h3>
               <div className="flex flex-wrap items-center gap-4">
                  <a href="#" className="w-14 h-14 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-all group">
                     {/* X Icon SVG */}
                     <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 4.09H5.078z"></path></svg>
                  </a>
                  <a href="#" className="w-14 h-14 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-all">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                     </svg>
                  </a>
                  <a href="#" className="flex items-center gap-3 px-6 h-14 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 rounded-xl text-zinc-400 hover:text-white transition-all font-bold text-sm tracking-widest uppercase">
                     <span>Connect</span>
                     <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-5 h-5">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                     </svg>
                  </a>
                  <a href="#" className="w-14 h-14 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-all">
                     <Globe size={20} />
                  </a>
               </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
               {[
                 { icon: Radio, label: 'All-Time Plays', value: profileData.stats.allTimePlays },
                 { icon: Users, label: 'Followers', value: profileData.stats.followers },
                 { icon: Headphones, label: 'Monthly Listeners', value: profileData.stats.monthlyListeners },
               ].map((stat, i) => (
                 <div key={i} className="glass-card p-8 flex flex-col gap-6 relative overflow-hidden group hover:border-accent-purple/30 transition-all duration-500">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                       <stat.icon size={100} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-[#0F0F1A] border border-white/10 rounded-xl flex items-center justify-center">
                         <stat.icon className="text-zinc-500 group-hover:text-accent-purple transition-colors" size={24} />
                      </div>
                      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center cursor-help">
                         <span className="text-[10px] font-bold text-zinc-500">i</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{stat.label}</p>
                       <p className="text-5xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{stat.value}</p>
                    </div>
                 </div>
               ))}
            </div>

            {/* Discography Section */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
               <h3 className="text-xl font-black uppercase tracking-widest text-white">Discography</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {discography.map((item, i) => (
                     <div key={i} className="relative aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(157,0,255,0.2)] transition-all duration-500">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A15] via-[#0A0A15]/40 to-transparent" />
                        
                        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                           <div className="flex flex-col gap-1 pr-4">
                              <h4 className="text-lg font-black text-white leading-tight drop-shadow-md group-hover:text-accent-purple transition-colors line-clamp-2">
                                 {item.title}
                              </h4>
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                 {item.artist}
                              </p>
                           </div>
                           <div className="shrink-0 text-right">
                              <p className="text-[10px] font-black uppercase tracking-widest text-white/80 whitespace-nowrap">
                                 {item.plays}
                              </p>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
