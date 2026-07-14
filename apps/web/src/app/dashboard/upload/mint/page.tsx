'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { 
  ChevronLeft, 
  RefreshCw,
  CheckCircle2,
  Wallet,
  Music,
  Zap,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Polygon } from '@/components/ui/SocialIcons';
import { MintConfirmationModal } from '@/components/dashboard/MintConfirmationModal';
import { MintSuccessModal } from '@/components/dashboard/MintSuccessModal';
import { useConfig, useAccount } from 'wagmi';
import { 
  publishSongOnChain, 
  approveUSDC,
  parseUSDC,
  waitForTx 
} from '@/lib/contracts';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

export default function MintPage() {
  const router = useRouter();
  const config = useConfig();
  const { address } = useAccount();
  const [storage, setStorage] = useState('IPFS');
  const [addCollaborator, setAddCollaborator] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mintStatus, setMintStatus] = useState<'idle' | 'confirming' | 'minting' | 'success'>('idle');
  const [mintStepLabel, setMintStepLabel] = useState('Step 1/3: Registering track on-chain...');

  // Load from localStorage
  const [trackId, setTrackId] = useState<number | null>(null);
  const [trackTitle, setTrackTitle] = useState('Title');
  const [trackCover, setTrackCover] = useState('');
  const [trackGenre, setTrackGenre] = useState('');
  const [trackTags, setTrackTags] = useState<string[]>([]);
  const [trackRights, setTrackRights] = useState<string[]>([]);
  const [paymentModel, setPaymentModel] = useState('fixed');
  const [licensePrice, setLicensePrice] = useState('0.00');
  const [royaltyPercentage, setRoyaltyPercentage] = useState('10');
  const [txHash, setTxHash] = useState('');
  const [tokenId, setTokenId] = useState('');

  // Collaborators configuration
  const [collaborators, setCollaborators] = useState<{ username: string; wallet: string; percentage: number }[]>([]);
  const [collabUsername, setCollabUsername] = useState('');
  const [collabPercentage, setCollabPercentage] = useState(10);
  const [isSearchingCollab, setIsSearchingCollab] = useState(false);

  const handleAddCollabClick = async () => {
    const username = collabUsername.trim();
    if (!username) {
      toast.error('Please enter a username');
      return;
    }
    if (collaborators.some(c => c.username.toLowerCase() === username.toLowerCase())) {
      toast.error('Collaborator already added');
      return;
    }
    const currentTotal = collaborators.reduce((acc, c) => acc + c.percentage, 0);
    if (currentTotal + collabPercentage >= 100) {
      toast.error('Total splits cannot exceed 100%');
      return;
    }

    setIsSearchingCollab(true);
    try {
      const res = await apiFetch(`/api/profile/${username}`);
      if (!res || !res.ok) {
        throw new Error('User not found');
      }
      const user = await res.json();
      if (!user.wallet) {
        throw new Error('User does not have a wallet registered');
      }

      setCollaborators([
        ...collaborators,
        {
          username: user.username,
          wallet: user.wallet,
          percentage: collabPercentage,
        }
      ]);
      setCollabUsername('');
      toast.success(`Added @${user.username}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify username');
    } finally {
      setIsSearchingCollab(false);
    }
  };

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    
    if (idParam) {
      const trackIdNum = Number(idParam);
      setTrackId(trackIdNum);
      
      const fetchTrackData = async () => {
        try {
          const res = await apiFetch(`/api/creator/tracks/${idParam}`);
          if (res && res.ok) {
            const json = await res.json();
            const track = json.track || json.data || json;
            
            if (track.title) setTrackTitle(track.title);
            if (track.cover_url) setTrackCover(track.cover_url);
            if (track.category) setTrackGenre(track.category);
            if (track.tags) setTrackTags(track.tags);
            if (track.usage_rights) setTrackRights(track.usage_rights);
            if (track.payment_model) setPaymentModel(track.payment_model);
            if (track.license_price !== undefined && track.license_price !== null) {
              setLicensePrice(String(track.license_price));
            }
            if (track.royalty_percentage !== undefined && track.royalty_percentage !== null) {
              setRoyaltyPercentage(String(track.royalty_percentage));
            }
          }
        } catch (err) {
          console.error('Failed to fetch track details for minting:', err);
          toast.error('Failed to fetch track details');
        }
      };
      
      fetchTrackData();
      return;
    }

    const id = localStorage.getItem('pending_track_id');
    const title = localStorage.getItem('pending_track_title');
    const cover = localStorage.getItem('pending_track_cover');
    const genre = localStorage.getItem('pending_track_genre');
    const tagsStr = localStorage.getItem('pending_track_tags');
    const rightsStr = localStorage.getItem('pending_track_rights');
    const payment = localStorage.getItem('pending_track_payment');
    const price = localStorage.getItem('pending_track_price');
    const royalty = localStorage.getItem('pending_track_royalty');

    if (id) setTrackId(Number(id));
    if (title) setTrackTitle(title);
    if (cover) setTrackCover(cover);
    if (genre) setTrackGenre(genre);
    if (tagsStr) {
      try { setTrackTags(JSON.parse(tagsStr)); } catch (_) {}
    }
    if (rightsStr) {
      try { setTrackRights(JSON.parse(rightsStr)); } catch (_) {}
    }
    if (payment) setPaymentModel(payment);
    if (price) setLicensePrice(price);
    if (royalty) setRoyaltyPercentage(royalty);
  }, []);

  const handleStartMinting = () => {
    setIsModalOpen(true);
    setMintStatus('confirming');
  };

  const handleMintConfirmed = async () => {
    if (!address) {
      toast.error('Please connect your wallet first.');
      setIsModalOpen(false);
      setMintStatus('idle');
      return;
    }
    if (!trackId) {
      toast.error('No pending track found. Please upload again.');
      setIsModalOpen(false);
      setMintStatus('idle');
      return;
    }

    setMintStatus('minting');

    try {
      // 1. Approve USDC Upload Fee of 2.50 USDC
      setMintStepLabel('Step 1/2: Approving USDC transaction fee (please confirm in wallet)...');
      const approveTx = await approveUSDC(config, parseUSDC(2.50));
      await waitForTx(config, approveTx);

      // 2. Create Song in database
      setMintStepLabel('Step 2/2: Publishing track on-chain (please confirm in wallet)...');
      const songRes = await apiFetch('/api/songs', {
        method: 'POST',
        body: JSON.stringify({
          title: trackTitle,
          track_id: trackId,
        }),
      });

      if (!songRes || !songRes.ok) {
        throw new Error('Failed to create song in database');
      }
      const songJson = await songRes.json();
      const songDb = songJson.data || songJson.song || songJson;
      const songDbId = songDb.id;
      const songMetadataUri = songDb.metadata_uri || `ipfs://QmSongMetadataPlaceholder`;

      // 3. Set Contributors in database
      const totalCollabPercent = collaborators.reduce((acc, c) => acc + c.percentage, 0);
      const dbContributors = [
        {
          wallet_address: address,
          basis_points: (100 - totalCollabPercent) * 100,
          role: 'artist',
          display_name: 'Creator',
        },
        ...collaborators.map(c => ({
          wallet_address: c.wallet,
          basis_points: c.percentage * 100,
          role: 'collaborator',
          display_name: c.username,
        }))
      ];

      const contributorsRes = await apiFetch(`/api/songs/${songDbId}/contributors`, {
        method: 'POST',
        body: JSON.stringify({
          contributors: dbContributors,
        }),
      });
      if (!contributorsRes || !contributorsRes.ok) {
        throw new Error('Failed to set contributors in database');
      }

      // 4. Create Edition in database
      const editionRes = await apiFetch(`/api/songs/${songDbId}/editions`, {
        method: 'POST',
        body: JSON.stringify({
          edition_type: 'open',
          max_supply: 0,
          mint_price_usdc: Number(licensePrice) || 0,
        }),
      });
      if (!editionRes || !editionRes.ok) {
        throw new Error('Failed to create edition in database');
      }
      const editionJson = await editionRes.json();
      const editionDb = editionJson.data || editionJson.edition || editionJson;
      const editionDbId = editionDb.id;

      // 5. Publish song on-chain (combined call)
      const contributorsArg = dbContributors.map(c => ({
        wallet: c.wallet_address as `0x${string}`,
        basisPoints: BigInt(c.basis_points),
      }));

      const parsedPrice = Number(licensePrice);
      const safePrice = isNaN(parsedPrice) ? 0 : parsedPrice;

      console.log('Contract Call Parameters (publishSongOnChain):', {
        title: trackTitle,
        metadataUri: songMetadataUri,
        contributors: contributorsArg,
        editionType: 'open',
        maxSupply: 0,
        mintPrice: safePrice,
        editionMetadataUri: ''
      });

      const publishTx = await publishSongOnChain(
        config,
        trackTitle,
        songMetadataUri,
        contributorsArg,
        'open',
        0,
        safePrice,
        ''
      );
      const publishReceipt = await waitForTx(config, publishTx);

      // Parse songId and editionId from receipt logs
      let onChainSongId = 1;
      let onChainEditionId = 1;
      try {
        const songLog = publishReceipt.logs.find(
          (log) => log.topics[0] === '0x2cf607229937514d342113433bf500c4287cba30f599f96dbdb595701e6bf8d8'
        );
        if (songLog && songLog.topics[1]) {
          onChainSongId = parseInt(songLog.topics[1], 16);
        }

        const editionLog = publishReceipt.logs.find(
          (log) => log.topics[0] === '0xdea513584a6187bd083673763b9a1321f417e674a36df7c0e66c4e99368d6d50'
        );
        if (editionLog && editionLog.topics[1]) {
          onChainEditionId = parseInt(editionLog.topics[1], 16);
        }
      } catch (err) {
        console.error('Error parsing on-chain event logs:', err);
      }

      // 6. Update Song Contract ID on backend
      const updateSongRes = await apiFetch(`/api/songs/${songDbId}/contract-id`, {
        method: 'PATCH',
        body: JSON.stringify({
          contract_song_id: onChainSongId,
        }),
      });
      if (!updateSongRes || !updateSongRes.ok) {
        throw new Error('Failed to sync song contract ID with backend');
      }

      // 7. Update Edition Contract ID on backend
      const updateEditionRes = await apiFetch(`/api/editions/${editionDbId}/contract-id`, {
        method: 'PATCH',
        body: JSON.stringify({
          contract_edition_id: onChainEditionId,
          tx_hash: publishTx,
        }),
      });
      if (!updateEditionRes || !updateEditionRes.ok) {
        throw new Error('Failed to sync edition contract ID with backend');
      }

      // 8. Clear localStorage pending data
      localStorage.removeItem('pending_track_id');
      localStorage.removeItem('pending_track_title');
      localStorage.removeItem('pending_track_cover');
      localStorage.removeItem('pending_track_genre');
      localStorage.removeItem('pending_track_tags');
      localStorage.removeItem('pending_track_rights');
      localStorage.removeItem('pending_track_payment');
      localStorage.removeItem('pending_track_price');
      localStorage.removeItem('pending_track_royalty');

      setTxHash(publishTx);
      setTokenId(`#${onChainEditionId}`);
      setMintStatus('success');
      toast.success('Track published successfully!');

    } catch (err: any) {
      console.error('Minting error:', err);
      
      // Update track status to 'failed' in backend database
      if (trackId) {
        try {
          await apiFetch(`/api/creator/tracks/${trackId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'failed' }),
          });
        } catch (dbErr) {
          console.error('Failed to update track status to failed:', dbErr);
        }
      }

      const msg = err?.shortMessage || err?.message || 'Minting failed. Please try again.';
      toast.error(msg);
      setMintStatus('idle');
      setIsModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-accent-purple bg-accent-purple/20 flex items-center justify-center">
                        <div className="w-2 h-2 bg-accent-purple rounded-full" />
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-white/5 border-white/10 shadow-[0_0_20px_rgba(157,0,255,0.05)]">
                        <Polygon size={16} className="text-white" />
                        <span className="text-[10px] font-black tracking-widest text-white">POLYGON (AMOY TESTNET)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Smart Contract Type */}
                <div className="space-y-6 pt-10 border-t border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Smart Contract Standard</p>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-5 h-5 rounded-full border-2 border-accent-purple bg-accent-purple/20 flex items-center justify-center">
                          <div className="w-2 h-2 bg-accent-purple rounded-full" />
                        </div>
                        <span className="text-sm font-bold">Multi-Edition (ERC-1155 Platform Contract)</span>
                      </div>
                      <div className="bg-[#0F0F1A] border border-white/10 rounded-lg px-4 py-2 text-xs font-bold text-zinc-400 text-center uppercase tracking-widest">
                        {paymentModel === 'none' ? 'No licensing fee' : `$${licensePrice} USDC`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Splits */}
              <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">
                    Revenue Splits
                  </h3>
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

                    {/* Add Collaborator Form */}
                    {addCollaborator && (
                      <div className="bg-[#0F0F1A] border border-white/5 rounded-2xl p-6 space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-white">Add Collaborator</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Username</label>
                            <input
                              type="text"
                              value={collabUsername}
                              onChange={(e) => setCollabUsername(e.target.value)}
                              placeholder="e.g. producer_john"
                              className="w-full bg-[#050510] border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-accent-purple/50"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Split (%)</label>
                            <input
                              type="number"
                              min="1"
                              max="99"
                              value={collabPercentage}
                              onChange={(e) => setCollabPercentage(Number(e.target.value))}
                              className="w-full bg-[#050510] border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white outline-none focus:border-accent-purple/50"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              onClick={handleAddCollabClick}
                              disabled={isSearchingCollab}
                              className="w-full bg-accent-purple text-xs font-bold py-2 rounded-lg"
                            >
                              {isSearchingCollab ? 'Checking...' : 'Add'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Splits List */}
                    <div className="space-y-3">
                      {/* Creator (100% minus collabs) */}
                      <div className="flex items-center justify-between bg-[#0F0F1A] border border-white/5 rounded-xl p-4">
                        <div>
                          <p className="text-xs font-black text-white">You (Creator)</p>
                          <p className="text-[9px] text-zinc-500 font-bold truncate max-w-[200px]">{address}</p>
                        </div>
                        <span className="text-sm font-black text-accent-cyan">{100 - collaborators.reduce((acc, c) => acc + c.percentage, 0)}%</span>
                      </div>

                      {/* Added Collaborators */}
                      {collaborators.map((c, idx) => (
                        <div key={c.username} className="flex items-center justify-between bg-[#0F0F1A] border border-white/5 rounded-xl p-4">
                          <div>
                            <p className="text-xs font-black text-white">@{c.username}</p>
                            <p className="text-[9px] text-zinc-500 font-bold truncate max-w-[200px]">{c.wallet}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-black text-[#00FF85]">{c.percentage}%</span>
                            <button
                              onClick={() => {
                                setCollaborators(collaborators.filter((_, i) => i !== idx));
                              }}
                              className="text-red-500 hover:text-red-400 text-xs font-bold"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {collaborators.length === 0 && !addCollaborator && (
                      <div className="bg-[#0F0F1A]/50 border-2 border-dashed border-white/5 rounded-2xl py-12 flex items-center justify-center">
                         <p className="text-xs font-bold uppercase tracking-widest text-zinc-700">No Collaborators Added Yet</p>
                      </div>
                    )}
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
                             <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{trackGenre || 'GENRE'}</p>
                          </div>
                          {trackTags.length > 0 && (
                             <div className="flex flex-wrap gap-1">
                               {trackTags.map((tag) => (
                                 <span key={tag} className="text-[9px] font-bold bg-white/5 px-2 py-0.5 rounded-full text-zinc-400 flex items-center gap-1">
                                   <Tag size={8} />
                                   {tag}
                                 </span>
                               ))}
                             </div>
                          )}
                       </div>
                    </div>
                 </div>

                 {/* Configured Usage Rights */}
                 <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Configured Usage Rights</p>
                    <div className="grid grid-cols-2 gap-2">
                       {trackRights.map((right) => (
                         <div key={right} className="bg-[#0F0F1A] border border-white/5 rounded-xl py-2 px-3 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                           {right}
                         </div>
                       ))}
                       {trackRights.length === 0 && (
                         <div className="col-span-2 text-center text-xs text-zinc-600 font-bold italic py-2">
                           No custom usage rights configured
                         </div>
                       )}
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
                       <span className="text-xl font-black text-white">0.02 MATIC (~$0.01)</span>
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

        <MintConfirmationModal 
          isOpen={isModalOpen && mintStatus === 'confirming'}
          onClose={handleCloseModal}
          onConfirm={handleMintConfirmed}
          data={{
            fee: '2.50 USDC',
            from: address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '0x000...0000',
            to: 'Grooveli Contract',
            network: 'POLYGON',
            gasFee: '0.02 POL',
            totalEth: '2.50 USDC',
            totalUsd: '2.50'
          }}
        />

        {/* Mint Success Modal */}
        <MintSuccessModal 
          isOpen={isModalOpen && mintStatus === 'success'}
          onClose={handleCloseModal}
          onGoToLibrary={() => {
            handleCloseModal();
            router.push('/dashboard');
          }}
          trackData={{
            title: trackTitle,
            txHash: txHash || '0x8a72e8bc5d29a54460f780dba8ba36b7454f7aacaa2d0f62e841e94eb019cf92b',
            tokenId: tokenId || '#4829'
          }}
        />

        {/* Minting Loading State Overlay */}
        {isModalOpen && mintStatus === 'minting' && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-xl">
             <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-accent-purple border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(157,0,255,0.4)]" />
                <p className="text-lg font-black text-white uppercase tracking-widest animate-pulse">{mintStepLabel}</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple local ChevronDown replacement for the user profile header chevron
const ChevronDown = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
