'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { 
  Wallet, 
  Info, 
  TrendingUp, 
  TrendingDown,
  ChevronRight, 
  ChevronLeft,
  Music,
  Loader2
} from 'lucide-react';
import { apiFetch, resolveIpfsUrl } from '@/lib/api';

// --- Sub-components ---

const PerformanceChart = ({ customData }: { customData?: number[] }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const data = customData && customData.length === 12
    ? customData
    : (customData && customData.length > 0
        ? [...customData, ...Array(Math.max(0, 12 - customData.length)).fill(0)]
        : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const width = 800;
  const height = 300;
  const padding = 40;
  
  const maxVal = Math.max(...data, 100);
  const minVal = 0;
  
  const getX = (index: number) => (index * (width - padding * 2)) / (data.length - 1) + padding;
  const getY = (value: number) => height - padding - ((value - minVal) * (height - padding * 2)) / (maxVal - minVal);

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
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || styles.Completed}`}>
      {status}
    </span>
  );
};

// --- Page Main Component ---

export default function EarningsPage() {
  const router = useRouter();
  const [activeChartTab, setActiveChartTab] = useState<'licenses' | 'sales'>('licenses');
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [statsRes, txRes, analyticsRes] = await Promise.all([
          apiFetch('/api/creator/dashboard/stats'),
          apiFetch('/api/creator/dashboard/transactions'),
          apiFetch('/api/analytics/earnings'),
        ]);

        if (statsRes?.ok) {
          const statsJson = await statsRes.json();
          setStats(statsJson.data || statsJson);
        }

        if (txRes?.ok) {
          const txJson = await txRes.json();
          const txs = txJson.data?.transactions || txJson.transactions || [];
          setTransactions(Array.isArray(txs) ? txs : []);
        }

        if (analyticsRes?.ok) {
          const analyticsJson = await analyticsRes.json();
          const dataPoints = analyticsJson.data?.map((d: any) => Number(d.total) || 0) || [];
          if (dataPoints.length > 0) {
            setChartData(dataPoints);
          }
        }
      } catch (err) {
        console.error('Failed to load earnings data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalEarnings = Number(stats?.earnings?.total || 0);
  const earningsChange = Number(stats?.earnings?.change || 0);

  return (
    <div className="flex h-screen overflow-hidden bg-[#050510] text-white font-sans selection:bg-accent-cyan selection:text-black">
      <Sidebar activePage="earnings" />

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
                      Total Revenue
                      <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-help">
                        <Info size={10} />
                      </div>
                   </h2>
                   <div className="flex items-baseline gap-4">
                      <span className="text-5xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        ${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-black ${
                        earningsChange >= 0
                          ? 'bg-[#00FF85]/10 text-[#00FF85] border-[#00FF85]/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                         {earningsChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                         {earningsChange >= 0 ? `+${earningsChange}%` : `${earningsChange}%`}
                      </div>
                   </div>
                   <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Lifetime Creator Sales & Streams</p>
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
             
             <PerformanceChart customData={chartData} />
          </div>

          {/* Transactions Table Section */}
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <h3 className="text-xl font-black uppercase tracking-widest text-white px-2">Transactions</h3>
             
             <div className="glass-card overflow-hidden">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 size={32} className="text-accent-purple animate-spin" />
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Loading transactions…</p>
                  </div>
                ) : transactions.length > 0 ? (
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
                        {transactions.map((t) => (
                          <tr key={t.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="p-6">
                               <div className="flex items-center gap-4">
                                  <img 
                                    src={resolveIpfsUrl(t.image) || "https://images.unsplash.com/photo-1514525253361-bee8d48800d5?w=100&h=100&fit=crop"} 
                                    alt="" 
                                    className="w-12 h-12 rounded-xl object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all border border-white/5" 
                                  />
                                  <div className="flex flex-col">
                                     <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{t.type || 'NFT Sale'}</span>
                                     <span className="text-sm font-black text-white group-hover:text-accent-purple transition-colors">"{t.title}"</span>
                                  </div>
                               </div>
                            </td>
                            <td className="p-6">
                               <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                  {t.content || 'Music'}
                               </span>
                            </td>
                            <td className="p-6 text-center text-sm font-black text-accent-cyan">
                               ${Number(t.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
                            </td>
                            <td className="p-6 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                               {t.date ? new Date(t.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                            </td>
                            <td className="p-6 text-center">
                               <StatusBadge status={t.status || 'Completed'} />
                            </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                    <Music size={32} className="text-zinc-600" />
                    <p className="text-sm font-bold text-zinc-400">No transactions recorded yet</p>
                    <p className="text-xs text-zinc-600 max-w-sm">When fans purchase your track editions or license your content, your revenue will display here.</p>
                  </div>
                )}
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
