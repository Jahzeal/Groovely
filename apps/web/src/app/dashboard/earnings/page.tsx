'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { 
  Wallet, 
  Info, 
  TrendingUp, 
  ChevronRight, 
  ChevronLeft,
  Music,
  Disc,
  Mic2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';

// --- Mock Data ---

const transactions = [
  {
    id: 1,
    type: 'License Purchase',
    title: 'Slow Lights on Third Street',
    content: 'Music',
    amount: 994,
    date: '15 May 2026 8:30 am',
    status: 'Completed',
    image: 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?w=100&h=100&fit=crop'
  },
  {
    id: 2,
    type: 'NFT Sale',
    title: 'Midnight Bounce',
    content: 'Beat',
    amount: 426,
    date: '15 May 2026 9:00 am',
    status: 'Pending',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop'
  },
  {
    id: 3,
    type: 'Withdrawal',
    title: '$500',
    content: 'Podcast',
    amount: 877,
    date: '15 May 2026 9:30 am',
    status: 'Completed',
    image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=100&h=100&fit=crop'
  },
  {
    id: 4,
    type: 'NFT Sale',
    title: 'After the Noise',
    content: 'Music',
    amount: 883,
    date: '15 May 2026 8:00 am',
    status: 'Failed',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop'
  },
  {
    id: 5,
    type: 'License Purchase',
    title: 'No Wahala, Just Vibes',
    content: 'Skit',
    amount: 740,
    date: '15 May 2026 8:30 am',
    status: 'Completed',
    image: 'https://images.unsplash.com/photo-1526218626217-dc65a29bb444?w=100&h=100&fit=crop'
  }
];

// --- Sub-components ---

const PerformanceChart = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Custom mock data for the chart
  const data = [300, 450, 420, 400, 600, 650, 850, 800, 820, 850, 950, 1200];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const width = 800;
  const height = 300;
  const padding = 40;
  
  const maxVal = Math.max(...data);
  const minVal = 0;
  
  const getX = (index: number) => (index * (width - padding * 2)) / (data.length - 1) + padding;
  const getY = (value: number) => height - padding - ((value - minVal) * (height - padding * 2)) / (maxVal - minVal);

  const pathD = data.map((val, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(val)}`).join(' ');
  
  // Create a smoother curve using cubic bezier approximations (simplified here)
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
    <div className="relative w-full overflow-hidden group">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto drop-shadow-[0_0_20px_rgba(139,92,246,0.2)]">
        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p) => {
          const y = height - padding - p * (height - padding * 2);
          return (
            <g key={p}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <text x={padding - 10} y={y} fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="end" dominantBaseline="middle">
                ${Math.round(p * maxVal)}
              </text>
            </g>
          );
        })}

        {/* The Curve */}
        <path
          d={curveD}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Hover Points and Vertical Lines */}
        {data.map((val, i) => (
          <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} className="cursor-pointer">
            <rect x={getX(i) - 20} y={0} width="40" height={height} fill="transparent" />
            {hoveredIndex === i && (
              <line x1={getX(i)} y1={padding} x2={getX(i)} y2={height - padding} stroke="rgba(139, 92, 246, 0.5)" strokeWidth="1" strokeDasharray="4 2" />
            )}
            <circle
              cx={getX(i)}
              cy={getY(val)}
              r={hoveredIndex === i ? '6' : '0'}
              fill="#8B5CF6"
              className="transition-all duration-200"
            />
          </g>
        ))}

        {/* X-Axis labels */}
        {months.map((m, i) => (
          <text key={m} x={getX(i)} y={height - 10} fill={hoveredIndex === i ? '#8B5CF6' : 'rgba(255,255,255,0.3)'} fontSize="9" textAnchor="middle" className="transition-colors uppercase font-black tracking-widest">
            {m.slice(0, 3)}
          </text>
        ))}

        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#D946EF" />
            <stop offset="100%" stopColor="#2DD4BF" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div 
          className="absolute bg-[#0F0F1A] border border-white/10 p-3 rounded-xl shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-[120%]"
          style={{ left: `${(getX(hoveredIndex) / width) * 100}%`, top: `${(getY(data[hoveredIndex]) / height) * 100}%` }}
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-[#8B5CF6] mb-1">{months[hoveredIndex]}</p>
          <p className="text-xl font-black text-white">${data[hoveredIndex].toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    Completed: 'bg-[#00FF85]/10 text-[#00FF85] border-[#00FF85]/20',
    Pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Failed: 'bg-red-500/10 text-red-500 border-red-500/20'
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
      {status}
    </span>
  );
};

// --- Page Main Component ---

export default function EarningsPage() {
  const router = useRouter();
  const [activeChartTab, setActiveChartTab] = useState<'licenses' | 'sales'>('licenses');

  return (
    <div className="flex h-screen overflow-hidden bg-[#050510] text-white font-sans selection:bg-accent-cyan selection:text-black">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />

        <main className="flex-1 p-10 overflow-y-auto mesh-gradient">
          {/* Header Stats */}
          <div className="glass-card p-10 mb-12 flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
             <div className="flex items-center gap-8">
                <div className="w-16 h-16 bg-[#0F0F1A] border border-white/10 rounded-2xl flex items-center justify-center shadow-inner group">
                   <Wallet className="text-accent-purple group-hover:scale-110 transition-transform" size={32} />
                </div>
                <div className="space-y-1">
                   <h2 className="text-zinc-500 text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                      Earnings
                      <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-help">
                        <Info size={10} />
                      </div>
                   </h2>
                   <div className="flex items-baseline gap-4">
                      <span className="text-5xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">$1,032.60</span>
                      <div className="inline-flex items-center gap-1 bg-[#00FF85]/10 text-[#00FF85] px-3 py-1.5 rounded-xl border border-[#00FF85]/20 text-xs font-black">
                         <TrendingUp size={14} />
                         +10.5%
                      </div>
                   </div>
                   <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">This Month</p>
                </div>
             </div>

              <button
                onClick={() => router.push('/dashboard/settings')}
                className="bg-accent-purple hover:bg-opacity-90 text-white font-black py-5 px-10 rounded-2xl transition-all shadow-[0_0_30px_rgba(157,0,255,0.3)] hover:scale-105 active:scale-95 text-sm uppercase tracking-widest shrink-0"
              >
                 Withdraw Earnings
              </button>
          </div>

          {/* Performance Chart Section */}
          <div className="glass-card p-10 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black uppercase tracking-widest text-white">Performance Chart</h3>
                <div className="flex bg-[#0F0F1A] p-1.5 rounded-xl border border-white/5">
                   <button 
                     onClick={() => setActiveChartTab('licenses')}
                     className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeChartTab === 'licenses' ? 'bg-accent-purple text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                   >
                      Licenses
                   </button>
                   <button 
                     onClick={() => setActiveChartTab('sales')}
                     className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeChartTab === 'sales' ? 'bg-accent-purple text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                   >
                      Sales
                   </button>
                </div>
             </div>
             
             <PerformanceChart />
          </div>

          {/* Transactions Table Section */}
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <h3 className="text-xl font-black uppercase tracking-widest text-white px-2">Transactions</h3>
             
             <div className="glass-card overflow-hidden">
                <table className="w-full text-left">
                   <thead>
                      <tr className="border-b border-white/5 text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-white/[0.01]">
                        <th className="p-6 font-black">Type</th>
                        <th className="p-6 font-black">Content</th>
                        <th className="p-6 font-black text-center">Amount</th>
                        <th className="p-6 font-black text-center">Date</th>
                        <th className="p-6 font-black text-center">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {transactions.map((t, i) => (
                        <tr key={t.id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="p-6">
                             <div className="flex items-center gap-4">
                                <img src={t.image} alt="" className="w-12 h-12 rounded-xl object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all border border-white/5" />
                                <div className="flex flex-col">
                                   <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{t.type}</span>
                                   <span className="text-sm font-black text-white group-hover:text-accent-purple transition-colors">"{t.title}"</span>
                                </div>
                             </div>
                          </td>
                          <td className="p-6">
                             <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                {t.content}
                             </span>
                          </td>
                          <td className="p-6 text-center text-sm font-black text-zinc-200">
                             ${t.amount.toLocaleString()}
                          </td>
                          <td className="p-6 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                             {t.date}
                          </td>
                          <td className="p-6 text-center">
                             <StatusBadge status={t.status} />
                          </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
                
                {/* Pagination */}
                <div className="p-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
                   <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Page 1 of 2</span>
                   <div className="flex items-center gap-2">
                      <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-600 transition-colors cursor-not-allowed">
                         <ChevronLeft size={16} />
                      </button>
                      <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all">
                         <ChevronRight size={16} />
                      </button>
                   </div>
                </div>
             </div>
          </div>

          {/* Footer */}
          <footer className="mt-20 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10 opacity-70 hover:opacity-100 transition-opacity">
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

             <div className="flex items-center gap-6">
                <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">© Copyright 2025</p>
             </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
