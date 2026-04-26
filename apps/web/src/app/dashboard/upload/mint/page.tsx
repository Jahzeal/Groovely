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
  CheckCircle2,
  FileText,
  DollarSign,
  ShieldCheck,
  Zap,
  Layers,
  HardDrive,
  Users,
  Wallet,
  Music
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Polygon, Solana, Ethereum } from '@/components/ui/SocialIcons';
import { MintConfirmationModal } from '@/components/dashboard/MintConfirmationModal';
import { MintSuccessModal } from '@/components/dashboard/MintSuccessModal';



export default function MintPage() {
  const [network, setNetwork] = useState('POLYGON');
  const [contractType, setContractType] = useState('ERC-721');
  const [storage, setStorage] = useState('IPFS');
  const [addCollaborator, setAddCollaborator] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mintStatus, setMintStatus] = useState<'idle' | 'confirming' | 'minting' | 'success'>('idle');

  const [trackTitle, setTrackTitle] = useState('Title');
  const [trackCover, setTrackCover] = useState('');

  React.useEffect(() => {
    const title = localStorage.getItem('pending_track_title');
    const cover = localStorage.getItem('pending_track_cover');
    if (title) setTrackTitle(title);
    if (cover) setTrackCover(cover);
  }, []);

  const handleStartMinting = () => {
    setIsModalOpen(true);
    setMintStatus('confirming');
  };

  const handleMintConfirmed = () => {
    setMintStatus('minting');
    
    // Simulate minting process
    setTimeout(() => {
      setMintStatus('success');
    }, 2000);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset status after a brief delay to allow exit animation if any
    setTimeout(() => setMintStatus('idle'), 300);
  };



  return (
    <div className="flex h-screen overflow-hidden bg-[#050510] text-white font-sans selection:bg-accent-cyan selection:text-black">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative pb-32 overflow-y-auto">
        {/* Top Header */}
        <header className="flex items-center justify-between px-10 py-6 border-b border-white/5 bg-[#050510]/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-6">
            <Link href="/dashboard/upload/metadata">
              <button className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest group">
                <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back
              </button>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold">
              <RefreshCw size={14} className="animate-spin-slow text-green-500" />
              Autosaving
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
        <div className="max-w-7xl mx-auto w-full px-10 pt-10">
          {/* Step Progress */}
          <div className="flex items-center gap-12 mb-12">
            {[
              { id: 1, label: 'Upload Audio, Add Metadata & Licensing', status: 'complete' },
              { id: 2, label: 'Mint Track', status: 'current' }
            ].map((s) => (
              <div key={s.id} className="flex items-center gap-4 group cursor-pointer">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-[0_0_15px_rgba(157,0,255,0.1)] 
                  ${s.status === 'complete' ? 'bg-accent-purple text-white shadow-[0_0_20px_rgba(157,0,255,0.4)]' : 
                    s.status === 'current' ? 'bg-accent-purple text-white shadow-[0_0_20px_rgba(157,0,255,0.4)]' : 
                    'bg-white/5 text-zinc-500 border border-white/10'}
                `}>
                  {s.status === 'complete' ? <CheckCircle2 size={16} /> : s.id}
                </div>
                <span className={`text-sm font-bold tracking-wide transition-colors ${s.status === 'current' || s.status === 'complete' ? 'text-white' : 'text-zinc-500'}`}>
                  {s.label}
                </span>
                {s.id < 2 && <div className="ml-8 text-zinc-800 font-light select-none">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-800"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Configuration */}
            <div className="lg:col-span-8 space-y-10">
              {/* Blockchain Configuration */}
              <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 space-y-10">
                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">Blockchain Configuration</h3>
                
                {/* Network Selection */}
                <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Network</p>
                  <div className="flex gap-8">
                    {[
                      { id: 'POLYGON', icon: Polygon, label: 'POLYGON' },
                      { id: 'SOLANA', icon: Solana, label: 'SOLANA' },
                      { id: 'ETHEREUM', icon: Ethereum, label: 'ETHEREUM' }
                    ].map((net) => (
                      <div key={net.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => setNetwork(net.id)}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${network === net.id ? 'border-accent-purple bg-accent-purple/20' : 'border-zinc-700 bg-transparent group-hover:border-zinc-500'}`}>
                           {network === net.id && <div className="w-2 h-2 bg-accent-purple rounded-full" />}
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${network === net.id ? 'bg-white/5 border-white/10' : 'border-transparent opacity-40 group-hover:opacity-100'}`}>
                           <net.icon size={16} className="text-white" />
                           <span className="text-[10px] font-black tracking-widest text-white">{net.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Smart Contract Type */}
                <div className="space-y-6 pt-10 border-t border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Smart Contract Type</p>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setContractType('ERC-721')}>
                       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${contractType === 'ERC-721' ? 'border-accent-purple bg-accent-purple/20' : 'border-zinc-700 bg-transparent group-hover:border-zinc-500'}`}>
                          {contractType === 'ERC-721' && <div className="w-2 h-2 bg-accent-purple rounded-full" />}
                       </div>
                       <span className="text-sm font-bold">Single Edition (ERC-721)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setContractType('ERC-1155')}>
                         <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${contractType === 'ERC-1155' ? 'border-accent-purple bg-accent-purple/20' : 'border-zinc-700 bg-transparent group-hover:border-zinc-500'}`}>
                            {contractType === 'ERC-1155' && <div className="w-2 h-2 bg-accent-purple rounded-full" />}
                         </div>
                         <span className="text-sm font-bold">Multi-Edition (ERC-1155)</span>
                      </div>
                      <div className="w-24 relative">
                        <label className="absolute -top-6 left-1 text-[8px] font-black uppercase text-zinc-600">No. of Editions</label>
                        <input type="text" placeholder="0.00" className="w-full bg-[#0F0F1A] border border-white/10 rounded-lg px-4 py-3 text-sm font-bold text-right text-zinc-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Royalty Split */}
              <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Royalty Split</h3>
                  <div className="flex items-center gap-2">
                     <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Royalty</span>
                     <span className="text-sm font-black text-[#00FF85]">10%</span>
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Creator Splits</p>
                      <div className="flex items-center gap-3">
                         <span className="text-xs font-bold text-zinc-500">Add Collaborator</span>
                         <button 
                           onClick={() => setAddCollaborator(!addCollaborator)}
                           className={`w-10 h-5 rounded-full transition-all relative ${addCollaborator ? 'bg-accent-purple' : 'bg-zinc-800'}`}
                         >
                           <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${addCollaborator ? 'left-5.5' : 'left-0.5'}`} />
                         </button>
                      </div>
                   </div>

                   <div className="bg-[#0F0F1A]/50 border-2 border-dashed border-white/5 rounded-2xl py-12 flex items-center justify-center">
                      <p className="text-xs font-bold uppercase tracking-widest text-zinc-700">No Collaborators Added Yet</p>
                   </div>
                </div>
              </div>

              {/* Metadata Storage */}
              <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 space-y-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Metadata Storage</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className={`p-6 rounded-2xl border transition-all cursor-pointer group ${storage === 'IPFS' ? 'bg-accent-purple/5 border-accent-purple' : 'bg-[#0F0F1A] border-white/5 hover:border-white/10'}`} onClick={() => setStorage('IPFS')}>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${storage === 'IPFS' ? 'border-accent-purple bg-accent-purple/20' : 'border-zinc-700 bg-transparent group-hover:border-zinc-500'}`}>
                           {storage === 'IPFS' && <div className="w-2 h-2 bg-accent-purple rounded-full" />}
                        </div>
                        <span className="text-[8px] font-black uppercase bg-[#00FF85] text-black px-2 py-0.5 rounded-sm">Recommended</span>
                      </div>
                      <h4 className="text-sm font-black tracking-wide mb-2">IPFS</h4>
                      <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">Decentralized peer-to-peer storage solution. Fast, secure, and reliable.</p>
                   </div>
                   <div className={`p-6 rounded-2xl border transition-all cursor-pointer group ${storage === 'ON_CHAIN' ? 'bg-accent-purple/5 border-accent-purple' : 'bg-[#0F0F1A] border-white/5 hover:border-white/10'}`} onClick={() => setStorage('ON_CHAIN')}>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${storage === 'ON_CHAIN' ? 'border-accent-purple bg-accent-purple/20' : 'border-zinc-700 bg-transparent group-hover:border-zinc-500'}`}>
                           {storage === 'ON_CHAIN' && <div className="w-2 h-2 bg-accent-purple rounded-full" />}
                        </div>
                        <span className="text-[8px] font-black uppercase bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-sm">Advanced</span>
                      </div>
                      <h4 className="text-sm font-black tracking-wide mb-2">On-Chain (Advanced)</h4>
                      <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">Store metadata directly on the blockchain. Permanence at higher gas cost.</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Right Column: Summaries */}
            <div className="lg:col-span-4 space-y-10">
              {/* Track Summary */}
              <div className="bg-white/5 border border-white/5 rounded-[40px] p-8 space-y-8">
                 <h3 className="text-sm font-black uppercase tracking-widest text-[#00FF85]">Track Summary</h3>
                 <div className="bg-[#0F0F1A]/80 border border-white/5 rounded-3xl p-6">
                    <div className="flex gap-6">
                       <div className="w-24 h-24 bg-zinc-800 rounded-2xl shrink-0 overflow-hidden relative group">
                          <img src={trackCover || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Track Cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <Music size={24} className="text-white" />
                          </div>
                       </div>
                       <div className="flex-1 space-y-4">
                          <div>
                             <h4 className="text-xl font-black mb-1">{trackTitle}</h4>
                             <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Ready to mint</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <p className="text-[8px] font-black uppercase text-zinc-600 mb-1">Duration</p>
                                <p className="text-xs font-bold text-zinc-400">Duration</p>
                             </div>
                             <div>
                                <p className="text-[8px] font-black uppercase text-zinc-600 mb-1">File Type</p>
                                <p className="text-xs font-bold text-zinc-400">File Type</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Wallet & Gas Fee */}
              <div className="bg-white/5 border border-white/5 rounded-[40px] p-8 space-y-8">
                 <h3 className="text-sm font-black uppercase tracking-widest text-white">Wallet & Gas Fee</h3>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between py-2">
                       <div className="flex items-center gap-3">
                          <Wallet size={18} className="text-zinc-500" />
                          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Wallet</span>
                       </div>
                       <span className="text-sm font-black text-white">0xc...y69</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-t border-white/5 pt-6">
                       <div className="flex items-center gap-3">
                          <Zap size={18} className="text-accent-cyan" />
                          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Gas Fee (est.)</span>
                       </div>
                       <span className="text-xl font-black text-white">$0.38</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <footer className="fixed bottom-0 right-0 left-64 bg-[#0F0F1A]/80 backdrop-blur-xl border-t border-white/5 px-10 py-6 flex items-center justify-end gap-4 z-40">
           <Button variant="secondary" className="px-10">Save as Draft</Button>
           <Button 
             variant="primary" 
             onClick={handleStartMinting}
             disabled={mintStatus === 'minting'}
             className="px-16 bg-accent-purple shadow-[0_0_30px_rgba(157,0,255,0.4)] hover:shadow-[0_0_40px_rgba(157,0,255,0.6)]"
           >
             {mintStatus === 'minting' ? 'Minting...' : 'Mint Track'}
           </Button>
        </footer>

        {/* Mint Confirmation Modal */}
        <MintConfirmationModal 
          isOpen={isModalOpen && mintStatus === 'confirming'}
          onClose={handleCloseModal}
          onConfirm={handleMintConfirmed}
          data={{
            fee: '0.002',
            from: '0.002',
            to: '0.002',
            network: network || 'ETH',
            gasFee: '2.5',
            totalEth: '2.5',
            totalUsd: '3.26'
          }}
        />

        {/* Mint Success Modal */}
        <MintSuccessModal 
          isOpen={isModalOpen && mintStatus === 'success'}
          onClose={handleCloseModal}
          onGoToLibrary={() => {
            handleCloseModal();
            // In a real app, router.push('/dashboard/library')
            alert('Redirecting to library...');
          }}
          trackData={{
            title: network || 'ETH',
            txHash: '0x8a7...f92b',
            tokenId: '#4829'
          }}
        />

        {/* Minting Loading State Overlay (Optional - can be simple for now) */}
        {isModalOpen && mintStatus === 'minting' && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-xl">
             <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-accent-purple border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(157,0,255,0.4)]" />
                <p className="text-xl font-black text-white uppercase tracking-widest animate-pulse">Minting Your Track...</p>
             </div>
          </div>
        )}


      </div>
    </div>
  );
}
