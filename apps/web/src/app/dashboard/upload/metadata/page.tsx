'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { 
  ChevronLeft, 
  HelpCircle, 
  Info, 
  ChevronDown, 
  RefreshCw,
  Plus,
  Trash2,
  Lock,
  Globe,
  Music,
  CheckCircle2,
  FileText,
  DollarSign,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function MetadataPage() {
  const [step] = useState(2);

  return (
    <div className="flex min-h-screen bg-[#050510] text-white font-sans selection:bg-accent-cyan selection:text-black">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative pb-32">
        {/* Top Header */}
        <header className="flex items-center justify-between px-10 py-6 border-b border-white/5 bg-[#050510]/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-6">
            <Link href="/dashboard/upload">
              <button className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest group">
                <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back
              </button>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold">
              <RefreshCw size={14} className="animate-spin-slow text-green-500" />
              All Changes Saved
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center cursor-pointer hover:bg-accent-purple/30 transition-all overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Uzor" alt="User Profile" className="w-full h-full object-cover" />
             </div>
             <ChevronDown size={16} className="text-zinc-500" />
          </div>
        </header>

        {/* Content */}
        <div className="max-w-6xl mx-auto w-full px-10 pt-10">
          {/* Step Progress */}
          <div className="flex items-center gap-12 mb-12">
            {[
              { id: 1, label: 'Upload Audio', status: 'complete' },
              { id: 2, label: 'Add Metadata & Licensing', status: 'current' },
              { id: 3, label: 'Mint Track', status: 'pending' }
            ].map((s) => (
              <div key={s.id} className="flex items-center gap-4 group cursor-pointer">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-[0_0_15px_rgba(157,0,255,0.1)] 
                  ${s.status === 'complete' ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 
                    s.status === 'current' ? 'bg-accent-purple text-white shadow-[0_0_20px_rgba(157,0,255,0.4)]' : 
                    'bg-white/5 text-zinc-500 border border-white/10'}
                `}>
                  {s.status === 'complete' ? <CheckCircle2 size={16} /> : s.id}
                </div>
                <span className={`text-sm font-bold tracking-wide transition-colors ${s.status === 'current' || s.status === 'complete' ? 'text-white' : 'text-zinc-500'}`}>
                  {s.label}
                </span>
                {s.id < 3 && <div className="ml-8 text-zinc-800 font-light select-none">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-800"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>}
              </div>
            ))}
          </div>

          <div className="mb-12">
             <h2 className="text-3xl font-black mb-4">Finalize Licensing & Smart Contract</h2>
             <p className="text-zinc-500 font-medium max-w-2xl">Configure how your track will be minted on the blockchain and set its distribution properties.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
             {/* NFT Details */}
             <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 space-y-8">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-lg font-bold flex items-center gap-3">
                     <FileText className="text-accent-purple" size={24} />
                     Smart Contract Details
                   </h3>
                   <span className="text-[10px] font-black uppercase tracking-widest bg-accent-cyan/10 text-accent-cyan px-3 py-1 rounded-full border border-accent-cyan/20">Standard ERC-721</span>
                </div>

                <div className="space-y-6">
                   <div>
                     <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">NFT Name</label>
                     <input 
                       type="text" 
                       placeholder="Enter Name" 
                       className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-5 py-4 text-sm font-medium outline-none focus:border-accent-purple/50 transition-all"
                     />
                   </div>
                   <div>
                     <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">Symbol</label>
                     <input 
                       type="text" 
                       placeholder="e.g. GRV" 
                       className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-5 py-4 text-sm font-medium outline-none focus:border-accent-purple/50 transition-all uppercase"
                     />
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">Total Supply</label>
                        <input 
                          type="number" 
                          placeholder="1" 
                          className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-5 py-4 text-sm font-medium outline-none focus:border-accent-purple/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">Price per unit (SOL)</label>
                        <div className="relative">
                           <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                           <input 
                             type="text" 
                             placeholder="0.00" 
                             className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl pl-10 pr-5 py-4 text-sm font-medium outline-none focus:border-accent-purple/50 transition-all"
                           />
                        </div>
                      </div>
                   </div>
                </div>

                <div className="p-6 bg-[#0F0F1A]/50 border border-dashed border-white/5 rounded-2xl">
                   <div className="flex gap-4">
                      <div className="w-12 h-12 bg-accent-cyan/10 rounded-xl flex items-center justify-center text-accent-cyan shrink-0">
                         <ShieldCheck size={24} />
                      </div>
                      <div>
                         <h4 className="text-sm font-bold mb-1">Standard Rights Management</h4>
                         <p className="text-xs text-zinc-500 leading-relaxed">By default, all Groovely tracks include cryptographic proof of ownership and license integrity verification.</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Distribution Preferences */}
             <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 space-y-8">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-lg font-bold flex items-center gap-3">
                     <Zap className="text-accent-cyan" size={24} />
                     Distribution & Reveal
                   </h3>
                </div>

                <div className="space-y-8">
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 ml-1">Release Schedule</p>
                      <div className="grid grid-cols-2 gap-4">
                         <button className="flex items-center justify-center gap-3 bg-accent-purple text-white py-4 rounded-xl font-bold text-sm shadow-[0_10px_20px_rgba(157,0,255,0.2)]">
                            <Zap size={16} />
                            Instant Release
                         </button>
                         <button className="flex items-center justify-center gap-3 bg-[#0F0F1A] border border-white/5 py-4 rounded-xl font-bold text-sm text-zinc-500 hover:text-white transition-all">
                            Scheduled
                         </button>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 ml-1">Advanced Minting Options</p>
                      {[
                        { title: 'Allow Whitelist', desc: 'Permit specific wallets to mint first' },
                        { title: 'Delayed Reveal', desc: 'Hide metadata until after sale' },
                        { title: 'Soulbound NFT', desc: 'Make the NFT non-transferable' }
                      ].map((opt) => (
                        <div key={opt.title} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 group cursor-pointer">
                           <div>
                              <h4 className="text-sm font-bold group-hover:text-accent-cyan transition-colors">{opt.title}</h4>
                              <p className="text-[10px] text-zinc-600 font-medium">{opt.desc}</p>
                           </div>
                           <div className="w-10 h-5 bg-zinc-800 rounded-full relative">
                              <div className="absolute left-1 top-1 w-3 h-3 bg-zinc-600 rounded-full transition-all" />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="fixed bottom-0 right-0 left-64 bg-[#0F0F1A]/80 backdrop-blur-xl border-t border-white/5 px-10 py-6 flex items-center justify-between z-40">
           <div className="flex items-center gap-4 text-zinc-500">
              <p className="text-xs font-bold uppercase tracking-widest">Estimated Gas: <span className="text-green-500">0.005 SOL</span></p>
           </div>
           <div className="flex items-center gap-4">
              <Link href="/dashboard/upload">
                <Button variant="secondary" className="px-10">Back to Step 1</Button>
              </Link>
              <Button variant="primary" className="px-12 bg-accent-purple shadow-[0_0_20px_rgba(157,0,255,0.3)]">Continue to Mint</Button>
           </div>
        </footer>
      </div>
    </div>
  );
}
