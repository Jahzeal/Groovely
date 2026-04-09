'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { 
  Radio, 
  Wallet, 
  UploadCloud, 
  Info, 
  TrendingUp, 
  TrendingDown,
  Eye,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  Search,
  Plus
} from 'lucide-react';

// --- Mock Data ---

const tracksData = [
  {
    image: "https://images.unsplash.com/photo-1514525253361-bee8d48800d5?w=100&h=100&fit=crop",
    name: "Slow Lights on Third Street",
    content: "Music",
    streams: "5,000",
    earnings: "$234.01",
    status: "Live"
  },
  {
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop",
    name: "Midnight Bounce",
    content: "Beat",
    streams: "0",
    earnings: "$0",
    status: "Draft"
  },
  {
    image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=100&h=100&fit=crop",
    name: "Late Nights, Loose Thoughts — Ep. 01",
    content: "Podcast",
    streams: "40,000",
    earnings: "$1,000.01",
    status: "Live"
  },
  {
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop",
    name: "After the Noise",
    content: "Music",
    streams: "0",
    earnings: "$0",
    status: "Failed"
  },
  {
    image: "https://images.unsplash.com/photo-1526218626217-dc65a29bb444?w=100&h=100&fit=crop",
    name: "No Wahala, Just Vibes",
    content: "Skit",
    streams: "0",
    earnings: "$0",
    status: "Minting"
  }
];

const topTracks = [
  {
    name: "Late Nights, Loose Thoughts — Ep. 01",
    badge: "Most Streams",
    image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=200&fit=crop"
  },
  {
    name: "Late Nights, Loose Thoughts — Ep. 01",
    badge: "Most Earnings",
    image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=200&fit=crop"
  },
  {
    name: "Late Nights, Loose Thoughts",
    badge: "Best Track",
    image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=200&fit=crop"
  }
];

// --- Sub-components ---

const StatCard = ({ icon: Icon, label, value, change, isLow }: any) => (
  <div className="glass-card p-8 flex flex-col gap-4 relative overflow-hidden group hover:border-accent-purple/30 transition-all duration-500">
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
       <Icon size={80} />
    </div>
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 bg-[#0F0F1A] border border-white/10 rounded-xl flex items-center justify-center">
         <Icon className="text-accent-purple" size={20} />
      </div>
      <div className="flex items-center gap-2 hover:bg-white/5 p-1 rounded-md transition-colors cursor-help group/info">
         <Info size={14} className="text-zinc-600 group-hover/info:text-zinc-400" />
      </div>
    </div>
    <div className="space-y-1">
       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{label}</p>
       <div className="flex items-baseline gap-3">
          <span className="text-4xl font-black tracking-tight text-white">{value}</span>
       </div>
       <div className="flex items-center gap-2 mt-2">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${change > 0 ? 'bg-[#00FF85]/10 text-[#00FF85] border-[#00FF85]/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
             {change > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
             {change > 0 ? '+' : ''}{change}%
          </div>
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest whitespace-nowrap">This Month</span>
       </div>
    </div>
  </div>
);

const PerformanceChart = () => {
    // Custom mock data for the chart
    const data = [300, 450, 420, 500, 480, 700, 950, 900, 880, 920, 1000, 1300];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const width = 800;
    const height = 300;
    const padding = 40;
    
    const maxVal = Math.max(...data);
    const getX = (index: number) => (index * (width - padding * 2)) / (data.length - 1) + padding;
    const getY = (value: number) => height - padding - ((value / maxVal) * (height - padding * 2));

    const curveD = data.reduce((acc, val, i, arr) => {
      if (i === 0) return `M ${getX(i)} ${getY(val)}`;
      const prevX = getX(i - 1);
      const prevY = getY(arr[i - 1]);
      const currX = getX(i);
      const currY = getY(val);
      const cpX = (prevX + currX) / 2;
      return `${acc} C ${cpX} ${prevY}, ${cpX} ${currY}, ${currX} ${currY}`;
    }, '');

    return (
      <div className="w-full h-80 relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#2DD4BF" />
            </linearGradient>
          </defs>
          
          {/* Areas */}
          <path d={`${curveD} L ${getX(data.length-1)} ${height-padding} L ${padding} ${height-padding} Z`} fill="url(#chartGradient)" />
          
          {/* Grid Lines */}
          {[0, 0.5, 1].map((p) => {
            const y = height - padding - p * (height - padding * 2);
            return <line key={p} x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
          })}

          {/* Line */}
          <path d={curveD} fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round" />
          
          {/* Labels */}
          {months.map((m, i) => (
            <text key={m} x={getX(i)} y={height - 10} fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="middle" className="font-black uppercase tracking-widest">{m}</text>
          ))}
        </svg>
      </div>
    );
};

const StatusBadge = ({ status }: any) => {
  const styles: any = {
    Live: "bg-[#00FF85]/10 text-[#00FF85] border-[#00FF85]/20",
    Draft: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    Failed: "bg-red-500/10 text-red-500 border-red-500/20",
    Minting: "bg-accent-purple/10 text-accent-purple border-accent-purple/20"
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status]}`}>
      {status}
    </span>
  );
};

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('Plays');

  return (
    <div className="flex min-h-screen bg-[#050510] text-white font-sans selection:bg-accent-cyan selection:text-black">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />

        <main className="flex-1 p-10 overflow-y-auto mesh-gradient">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
            <StatCard icon={Radio} label="Streams" value="1,230" change={15} />
            <StatCard icon={Wallet} label="Earnings" value="$1,032.60" change={10.5} />
            <StatCard icon={UploadCloud} label="Uploads" value="10" change={-0.5} />
          </div>

          {/* Performance Chart */}
          <div className="glass-card p-10 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black uppercase tracking-widest text-white">Performance Chart</h3>
                <div className="flex bg-[#0F0F1A] p-1.5 rounded-xl border border-white/5">
                   {['Plays', '$ Earnings', 'Listeners'].map(tab => (
                     <button 
                       key={tab}
                       onClick={() => setActiveTab(tab)}
                       className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-accent-purple text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                     >
                        {tab}
                     </button>
                   ))}
                </div>
             </div>
             <PerformanceChart />
          </div>

          {/* Tracks Performance */}
          <div className="glass-card p-10 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black uppercase tracking-widest text-white">Tracks Performance</h3>
                <button className="bg-accent-purple hover:bg-opacity-90 text-white text-[10px] font-black uppercase tracking-widest py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(157,0,255,0.2)]">
                   <Plus size={14} />
                   Upload & Mint
                </button>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="border-b border-white/5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        <th className="pb-6 font-black">Track</th>
                        <th className="pb-6 font-black">Content</th>
                        <th className="pb-6 font-black text-center">Streams</th>
                        <th className="pb-6 font-black text-center">Earnings</th>
                        <th className="pb-6 font-black text-center">Status</th>
                        <th className="pb-6 font-black text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {tracksData.map((track, i) => (
                        <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="py-6">
                             <div className="flex items-center gap-4">
                                <img src={track.image} alt="" className="w-12 h-12 rounded-xl object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all border border-white/5" />
                                <span className="text-sm font-black text-white group-hover:text-accent-purple transition-colors">{track.name}</span>
                             </div>
                          </td>
                          <td className="py-6">
                             <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400">{track.content}</span>
                          </td>
                          <td className="py-6 text-center text-sm font-black text-zinc-200">{track.streams}</td>
                          <td className="py-6 text-center text-sm font-black text-zinc-200">{track.earnings}</td>
                          <td className="py-6 text-center"><StatusBadge status={track.status} /></td>
                          <td className="py-6 text-right">
                             <div className="flex items-center justify-end gap-4 text-zinc-500">
                                <button className="hover:text-white transition-colors"><Eye size={18} /></button>
                                <button className="hover:text-white transition-colors"><MoreVertical size={18} /></button>
                             </div>
                          </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>

             <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-8">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Page 1 of 2</span>
                <div className="flex items-center gap-2">
                   <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-600 cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
                   <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all"><ChevronRight size={16} /></button>
                </div>
             </div>
          </div>

          {/* Top Tracks Section */}
          <div className="space-y-8 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
             <h3 className="text-xl font-black uppercase tracking-widest text-white px-2">Top Tracks</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {topTracks.map((track, i) => (
                  <div key={i} className="glass-card group cursor-pointer overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]">
                     <div className="relative h-48">
                        <img src={track.image} alt={track.name} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A15]/90 to-transparent" />
                        <div className="absolute top-4 left-4">
                           <span className="bg-accent-purple/20 backdrop-blur-md border border-accent-purple/30 text-accent-purple text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                              {track.badge}
                           </span>
                        </div>
                     </div>
                     <div className="p-6">
                        <h4 className="text-sm font-black text-white group-hover:text-accent-purple transition-colors line-clamp-1">{track.name}</h4>
                        <div className="mt-4 flex items-center gap-1.5 text-accent-cyan opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                           <span className="text-[10px] font-black uppercase tracking-widest">View Deep Insights</span>
                           <ChevronRight size={12} />
                        </div>
                     </div>
                  </div>
                ))}
             </div>
             
             <div className="flex items-center justify-center gap-4 pt-4">
                <div className="flex items-center gap-2">
                   <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-600 cursor-not-allowed"><ChevronLeft size={14} /></button>
                   <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white"><ChevronRight size={14} /></button>
                </div>
                <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">Page 1 of 2</span>
             </div>
          </div>

          {/* Footer */}
          <footer className="py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10 opacity-70 hover:opacity-100 transition-opacity">
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
                <p className="text-[10px] font-black uppercase tracking-widest">© Copyright 2025</p>
             </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
