'use client';

import React from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { StatCard } from '@/components/dashboard/StatCard';
import { TracksTable } from '@/components/dashboard/TracksTable';
import { ActiveRoomCard } from '@/components/dashboard/ActiveRoomCard';
import { PromoCards } from '@/components/dashboard/PromoCards';
import { 
  Radio, 
  Wallet, 
  UploadCloud, 
  Headphones,
  Send,
  Disc
} from 'lucide-react';
import { Twitter, Instagram } from '@/components/ui/SocialIcons';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#050510] text-white font-sans selection:bg-accent-cyan selection:text-black">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <TopBar />

        <main className="flex-1 p-10 overflow-y-auto">
          {/* Welcome Message */}
          <div className="mb-12 translate-y-0 opacity-100 transition-all duration-500">
            <h1 className="text-4xl font-black tracking-tight text-white mb-2">Hello, Uzor! 👋</h1>
            <p className="text-zinc-500 font-medium">Welcome back to your creator command center.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <StatCard 
               icon={Radio} 
               label="Streams" 
               value="1,230" 
               change={15} 
             />
             <StatCard 
               icon={Wallet} 
               label="Earnings" 
               value="$1,032.60" 
               change={10.5} 
             />
             <StatCard 
               icon={UploadCloud} 
               label="Uploads" 
               value="10" 
               change={-0.5} 
             />
             <StatCard 
               icon={Headphones} 
               label="Listening Rooms" 
               value="20" 
               change={-1} 
             />
          </div>

          {/* Tracks and Active Room Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <TracksTable />
             <div className="lg:col-span-1 border-white/5">
                <ActiveRoomCard />
             </div>
          </div>

          {/* Promo Section */}
          <PromoCards />

          {/* Footer */}
          <footer className="mt-20 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10 opacity-70 hover:opacity-100 transition-opacity">
             <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <a href="#" className="hover:text-accent-purple transition-colors">About Groovely</a>
                <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                <a href="#" className="hover:text-accent-purple transition-colors">Privacy Policy</a>
                <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                <a href="#" className="hover:text-accent-purple transition-colors">Terms of Use</a>
                <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                <a href="#" className="hover:text-accent-purple transition-colors">Docs/Developer API</a>
                <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                <a href="#" className="hover:text-accent-purple transition-colors text-accent-cyan">Feedback</a>
             </div>

             <div className="flex items-center gap-8 text-zinc-500">
                <a href="#" className="hover:text-white transition-all transform hover:scale-110 active:scale-90"><Twitter size={18} /></a>
                <a href="#" className="hover:text-white transition-all transform hover:scale-110 active:scale-90"><Disc size={18} /></a>
                <a href="#" className="hover:text-white transition-all transform hover:scale-110 active:scale-90"><Send size={18} /></a>
                <a href="#" className="hover:text-white transition-all transform hover:scale-110 active:scale-90"><Instagram size={18} /></a>
             </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
