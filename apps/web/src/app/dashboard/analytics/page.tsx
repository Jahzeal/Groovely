'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { apiFetch } from '@/lib/api';
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
  Plus,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

// --- Sub-components ---

const StatCard = ({ icon: Icon, label, value, change, isLoading }: any) => (
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
        {isLoading ? (
          <div className="h-10 w-24 bg-white/5 animate-pulse rounded-lg mt-1" />
        ) : (
          <>
            <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black tracking-tight text-white">{value}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
                {change !== null && (
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${change >= 0 ? 'bg-[#00FF85]/10 text-[#00FF85] border-[#00FF85]/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                    {change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(change)}%
                  </div>
                )}
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest whitespace-nowrap">This Month</span>
            </div>
          </>
        )}
    </div>
  </div>
);

const PerformanceChart = ({ playsData, isLoading }: { playsData: number[], isLoading: boolean }) => {
    // If data is missing or loading, use a default or show loading
    const data = playsData.length > 0 ? playsData : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const width = 800;
    const height = 300;
    const padding = 40;
    
    const maxVal = Math.max(...data, 100); // Minimum max scale of 100
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

    if (isLoading) {
      return (
        <div className="w-full h-80 flex items-center justify-center bg-white/5 rounded-2xl animate-pulse">
           <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
        </div>
      );
    }

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
  const [stats, setStats] = useState<any>(null);
  const [playsData, setPlaysData] = useState<number[]>([]);
  const [earningsData, setEarningsData] = useState<number[]>([]);
  const [listenersData, setListenersData] = useState<number[]>([]);
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch stats
        const statsRes = await apiFetch('/api/creator/dashboard/stats');
        if (statsRes && statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.data);
        }

        // Fetch plays analytics
        const playsRes = await apiFetch('/api/creator/analytics/plays');
        if (playsRes && playsRes.ok) {
          const data = await playsRes.json();
          setPlaysData(data.data || []);
        }

        // Fetch earnings analytics
        const earningsRes = await apiFetch('/api/creator/analytics/earnings');
        if (earningsRes && earningsRes.ok) {
          const data = await earningsRes.json();
          setEarningsData(data.data || []);
        }

        // Fetch listeners analytics
        const listenersRes = await apiFetch('/api/creator/analytics/listeners');
        if (listenersRes && listenersRes.ok) {
          const data = await listenersRes.json();
          setListenersData(data.data || []);
        }

        // Fetch top tracks analytics
        const topTracksRes = await apiFetch('/api/creator/analytics/top-tracks');
        if (topTracksRes && topTracksRes.ok) {
          const data = await topTracksRes.json();
          setTopTracks(data.data || []);
        }

        // Fetch tracks
        const tracksRes = await apiFetch('/api/creator/dashboard/tracks');
        if (tracksRes && tracksRes.ok) {
          const data = await tracksRes.json();
          setTracks(data.data?.tracks || []);
        }
      } catch (error) {
        console.error('Failed to fetch analytics data', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#050510] text-white font-sans selection:bg-accent-cyan selection:text-black">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />

        <main className="flex-1 p-10 overflow-y-auto mesh-gradient">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
            <StatCard 
              icon={Radio} 
              label="Streams" 
              value={stats?.streams?.total || "0"} 
              change={stats?.streams?.change} 
              isLoading={isLoading}
            />
            <StatCard 
              icon={Wallet} 
              label="Earnings" 
              value={stats?.earnings?.total ? `$${parseFloat(stats.earnings.total).toFixed(4)}` : "$0.0000"} 
              change={stats?.earnings?.change} 
              isLoading={isLoading}
            />
            <StatCard 
              icon={UploadCloud} 
              label="Uploads" 
              value={stats?.uploads?.total || "0"} 
              change={stats?.uploads?.change} 
              isLoading={isLoading}
            />
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
             <PerformanceChart 
               playsData={
                 activeTab === 'Plays' ? playsData : 
                 activeTab === '$ Earnings' ? earningsData : 
                 listenersData
               } 
               isLoading={isLoading} 
             />
          </div>

          {/* Tracks Performance */}
          <div className="glass-card p-10 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black uppercase tracking-widest text-white">Tracks Performance</h3>
                <Link href="/dashboard/upload" className="bg-accent-purple hover:bg-opacity-90 text-white text-[10px] font-black uppercase tracking-widest py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(157,0,255,0.2)]">
                   <Plus size={14} />
                   Upload & Mint
                </Link>
             </div>

             <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="flex flex-col gap-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-16 w-full bg-white/5 animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : tracks.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="text-zinc-500 font-bold uppercase tracking-widest">No tracks found</p>
                  </div>
                ) : (
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
                        {tracks.map((track, i) => (
                          <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="py-6">
                                <div className="flex items-center gap-4">
                                  <img 
                                    src={track.cover_url || "https://images.unsplash.com/photo-1514525253361-bee8d48800d5?w=100&h=100&fit=crop"} 
                                    alt="" 
                                    className="w-12 h-12 rounded-xl object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all border border-white/5" 
                                  />
                                  <span className="text-sm font-black text-white group-hover:text-accent-purple transition-colors">{track.title}</span>
                                </div>
                            </td>
                            <td className="py-6">
                                <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400">{track.category || 'Music'}</span>
                            </td>
                            <td className="py-6 text-center text-sm font-black text-zinc-200">{track.streams.toLocaleString()}</td>
                            <td className="py-6 text-center text-sm font-black text-zinc-200">${track.earnings.toFixed(4)}</td>
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
                )}
             </div>

             {!isLoading && tracks.length > 0 && (
               <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-8">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Page 1 of 1</span>
                  <div className="flex items-center gap-2">
                    <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-600 cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
                    <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all"><ChevronRight size={16} /></button>
                  </div>
               </div>
             )}
          </div>

          {/* Top Tracks Section */}
          <div className="space-y-8 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
             <h3 className="text-xl font-black uppercase tracking-widest text-white px-2">Top Tracks</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {isLoading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="h-64 w-full bg-white/5 animate-pulse rounded-2xl" />
                  ))
                ) : topTracks.length === 0 ? (
                  <div className="col-span-full py-10 text-center">
                    <p className="text-zinc-500 font-bold uppercase tracking-widest">No top tracks identified yet</p>
                  </div>
                ) : topTracks.slice(0, 3).map((track, i) => (
                  <div key={i} className="glass-card group cursor-pointer overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]">
                     <div className="relative h-48">
                        <img 
                          src={track.cover_url || "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=200&fit=crop"} 
                          alt={track.title} 
                          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A15]/90 to-transparent" />
                        <div className="absolute top-4 left-4">
                           <span className="bg-accent-purple/20 backdrop-blur-md border border-accent-purple/30 text-accent-purple text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                              {track.badge || (i === 0 ? "Most Streams" : i === 1 ? "Most Earnings" : "Best Track")}
                           </span>
                        </div>
                     </div>
                     <div className="p-6">
                        <h4 className="text-sm font-black text-white group-hover:text-accent-purple transition-colors line-clamp-1">{track.title}</h4>
                        <div className="mt-4 flex items-center gap-1.5 text-accent-cyan opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                           <span className="text-[10px] font-black uppercase tracking-widest">View Deep Insights</span>
                           <ChevronRight size={12} />
                        </div>
                     </div>
                  </div>
                ))}
             </div>
             
             {!isLoading && tracks.length > 0 && (
               <div className="flex items-center justify-center gap-4 pt-4">
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-600 cursor-not-allowed"><ChevronLeft size={14} /></button>
                    <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white"><ChevronRight size={14} /></button>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">Page 1 of 1</span>
               </div>
             )}
          </div>

          {/* Footer */}
          <footer className="py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10 opacity-70 hover:opacity-100 transition-opacity">
             <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <a href="#" className="hover:text-accent-purple transition-colors">About Grooveli</a>
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
