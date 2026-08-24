'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import {
  FileText,
  Download,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  ArrowUpRight,
  MoreHorizontal,
  Clock,
  History
} from 'lucide-react';

// --- Mock Data ---

const licenses = [
  {
    id: 'LIC-7729-XQ',
    trackTitle: 'Phoenix Feather Waltz',
    artist: 'NightWhisper',
    tier: 'Commercial',
    purchaseDate: 'May 12, 2026',
    price: '$299.00',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?w=300&h=300&fit=crop'
  },
  {
    id: 'LIC-8841-ZB',
    trackTitle: "Eternity's Echoes",
    artist: 'SilentShadow',
    tier: 'Personal',
    purchaseDate: 'May 10, 2026',
    price: '$49.00',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'
  },
  {
    id: 'LIC-3312-MA',
    trackTitle: 'Resonance of the Lost',
    artist: 'Vanilla',
    tier: 'Exclusive',
    purchaseDate: 'April 28, 2026',
    price: '$1,250.00',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop'
  },
  {
    id: 'LIC-9905-KL',
    trackTitle: 'The Vanishing Point',
    artist: 'SolarChill',
    tier: 'Commercial',
    purchaseDate: 'April 15, 2026',
    price: '$299.00',
    status: 'Expired',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop'
  }
];

// --- Sub-components ---

const StatCard = ({ label, value, icon: Icon, trend, color }: any) => (
  <div className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}/10 blur-3xl -mr-16 -mt-16 group-hover:bg-${color}/20 transition-all duration-500`} />
    <div className="flex items-center justify-between">
      <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-${color}`}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-lg border border-emerald-500/20">
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
    </div>
  </div>
);

const TierBadge = ({ tier }: { tier: string }) => {
  const styles: Record<string, string> = {
    Commercial: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20',
    Personal: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20',
    Exclusive: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[tier] || 'bg-white/5 text-zinc-400 border-white/10'}`}>
      {tier}
    </span>
  );
};

export default function LicensesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex h-screen overflow-hidden bg-[#192134] text-white font-sans selection:bg-[#8A2BE2] selection:text-white">
      <Sidebar activePage="licenses" />

      <div className="flex-1 flex flex-col overflow-hidden bg-[#192134]">
        <TopBar />

        <main className="flex-1 p-10 overflow-y-auto mesh-gradient relative">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-accent-purple/20 rounded-xl flex items-center justify-center text-accent-purple">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-accent-purple">Ownership & Protection</span>
                </div>
                <h1 className="text-5xl font-black tracking-tighter text-white mb-4">License Management</h1>
                <p className="text-zinc-500 font-medium text-lg max-w-2xl">Access, manage and verify your music licenses and certificates for all your content usage.</p>
              </div>

              <div className="flex items-center gap-4">
                <button className="bg-white/5 hover:bg-white/10 text-white font-black py-4 px-8 rounded-2xl transition-all border border-white/5 flex items-center gap-2 group">
                  <History size={18} className="text-zinc-500 group-hover:text-white transition-colors" />
                  <span className="text-sm uppercase tracking-widest">History</span>
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <StatCard label="Total Licenses" value="42" icon={FileText} trend="+3 this month" color="accent-purple" />
              <StatCard label="Active Licenses" value="38" icon={ShieldCheck} color="accent-cyan" />
              <StatCard label="Total Spent" value="$12,480" icon={Clock} color="amber-500" />
            </div>

            {/* Main Content Area */}
            <div className="glass-card p-2 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {/* Table Controls */}
              <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 bg-white/[0.01]">
                <div className="relative w-full md:w-96 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Search licenses by ID or Track..."
                    className="w-full bg-[#0F0F1A] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-accent-purple/30 transition-all placeholder-zinc-600"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#0F0F1A] border border-white/5 rounded-xl px-5 py-3 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all">
                    <Filter size={14} />
                    Filter
                  </button>
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#0F0F1A] border border-white/5 rounded-xl px-5 py-3 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all">
                    Sort by Date
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-white/[0.02]">
                      <th className="p-6">License Details</th>
                      <th className="p-6">Tier</th>
                      <th className="p-6">Issue Date</th>
                      <th className="p-6">Status</th>
                      <th className="p-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {licenses.map((license) => (
                      <tr key={license.id} className="group hover:bg-white/[0.02] transition-all">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/5">
                              <img src={license.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-zinc-600 mb-1 group-hover:text-accent-purple transition-colors">{license.id}</span>
                              <span className="text-base font-black text-white">"{license.trackTitle}"</span>
                              <span className="text-xs font-bold text-zinc-500">{license.artist}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <TierBadge tier={license.tier} />
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-zinc-200">{license.purchaseDate}</span>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Via Marketplace</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${license.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-zinc-600'}`} />
                            <span className={`text-xs font-black uppercase tracking-widest ${license.status === 'Active' ? 'text-emerald-500' : 'text-zinc-600'}`}>
                              {license.status}
                            </span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center justify-end gap-3">
                            <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-accent-purple hover:bg-accent-purple/10 hover:border-accent-purple/20 transition-all group/btn" title="Download Certificate">
                              <Download size={18} className="group-hover/btn:-translate-y-0.5 transition-transform" />
                            </button>
                            <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-accent-cyan hover:bg-accent-cyan/10 hover:border-accent-cyan/20 transition-all" title="View Track">
                              <ExternalLink size={18} />
                            </button>
                            <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
                              <MoreHorizontal size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Placeholder */}
              <div className="p-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Showing 4 of 42 licenses</span>
                <div className="flex items-center gap-2">
                  <button className="bg-white/5 hover:bg-white/10 text-white font-black py-2 px-4 rounded-lg text-[10px] uppercase tracking-widest border border-white/5 transition-all">
                    Load More
                  </button>
                </div>
              </div>
            </div>

            {/* Usage Tip Section */}
            <div className="mt-12 p-8 rounded-[32px] bg-gradient-to-br from-accent-purple/10 to-accent-cyan/10 border border-white/5 flex flex-col md:flex-row items-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <ArrowUpRight size={32} className="text-accent-cyan" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-lg font-black text-white mb-1">Need to clear a copyright claim?</h4>
                <p className="text-zinc-500 text-sm">Download your license certificate and upload it to the platform (YouTube, Twitch, etc.) to resolve claims instantly.</p>
              </div>
              <button className="whitespace-nowrap bg-white text-black font-black py-4 px-8 rounded-2xl hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest">
                View Help Guide
              </button>
            </div>
          </div>

          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-accent-purple/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-accent-cyan/5 blur-[120px] rounded-full" />
        </main>
      </div>
    </div>
  );
}
