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
  Tag,
  Plus,
  Trash2,
  Check,
  Disc,
  ArrowRight,
  Loader2,
  FileAudio,
  Search,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

  // Blockchain Configuration State
  const [network, setNetwork] = useState<'polygon' | 'solana' | 'ethereum'>('polygon');
  const [contractType, setContractType] = useState<'erc721' | 'erc1155'>('erc721');
  const [editionsCount, setEditionsCount] = useState('1');
  const [storage, setStorage] = useState<'IPFS' | 'On-Chain'>('IPFS');
  
  // UI & Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mintStatus, setMintStatus] = useState<'idle' | 'confirming' | 'minting' | 'success'>('idle');
  const [mintStepLabel, setMintStepLabel] = useState('Step 1/2: Approving USDC fee...');
  const [showCollabModal, setShowCollabModal] = useState(false);

  // Loaded Track Data
  const [trackId, setTrackId] = useState<number | null>(null);
  const [trackTitle, setTrackTitle] = useState('Track Title');
  const [trackCover, setTrackCover] = useState('');
  const [trackGenre, setTrackGenre] = useState('Music');
  const [trackTags, setTrackTags] = useState<string[]>([]);
  const [trackRights, setTrackRights] = useState<string[]>([]);
  const [paymentModel, setPaymentModel] = useState('fixed');
  const [licensePrice, setLicensePrice] = useState('0.00');
  const [royaltyPercentage, setRoyaltyPercentage] = useState('10');
  const [txHash, setTxHash] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [existingSong, setExistingSong] = useState<any>(null);

  // Collaborators
  const [collaborators, setCollaborators] = useState<{ username: string; wallet: string; percentage: number; approval_status?: string; role?: string }[]>([]);
  const [collabUsername, setCollabUsername] = useState('');
  const [collabPercentage, setCollabPercentage] = useState(10);
  const [collabRole, setCollabRole] = useState('writer');
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
          role: collabRole,
        }
      ]);
      setCollabUsername('');
      setShowCollabModal(false);
      toast.success(`Added @${user.username} as ${collabRole}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify username');
    } finally {
      setIsSearchingCollab(false);
    }
  };

  const handleRemoveCollaborator = (index: number) => {
    setCollaborators(prev => prev.filter((_, i) => i !== index));
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
        }
      };

      const fetchSongData = async () => {
        try {
          const res = await apiFetch(`/api/songs/track/${idParam}`);
          if (res && res.ok) {
            const json = await res.json();
            const songData = json.data || json;
            if (songData) {
              setExistingSong(songData);
              const contributors = songData.contributors || songData.song?.contributors;
              if (contributors && Array.isArray(contributors)) {
                const collabs = contributors
                  .filter((c: any) => c.role !== 'artist')
                  .map((c: any) => ({
                    username: c.display_name,
                    wallet: c.wallet_address,
                    percentage: c.basis_points / 100,
                    approval_status: c.approval_status,
                    role: c.role
                  }));
                setCollaborators(collabs);
              }
            }
          }
        } catch (err) {
          console.error('Failed to fetch existing song details:', err);
        }
      };
      
      fetchTrackData();
      fetchSongData();
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
    if (network !== 'polygon') {
      toast.error('Currently Polygon network is enabled for direct smart contract minting');
      return;
    }
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
      // 1. Approve USDC Upload Fee (2.50 USDC)
      setMintStepLabel('Step 1/2: Approving USDC fee (please confirm in wallet)...');
      const approveTx = await approveUSDC(config, parseUSDC(2.50));
      await waitForTx(config, approveTx);

      let songDbId: number;
      let songMetadataUri: string;
      let editionDbId: number;
      let dbContributors: any[];

      setMintStepLabel('Step 2/2: Publishing track on-chain (please confirm in wallet)...');

      if (existingSong && (existingSong.song || existingSong.id)) {
        const actualSong = existingSong.song || existingSong;
        const actualEditions = existingSong.editions || [];
        const actualContributors = existingSong.contributors || [];

        songDbId = actualSong.id;
        songMetadataUri = actualSong.metadata_uri || `ipfs://QmSongMetadataPlaceholder`;
        editionDbId = actualEditions[0]?.id;
        dbContributors = actualContributors;
      } else {
        // Create Song in database
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
        songDbId = songDb.id;
        songMetadataUri = songDb.metadata_uri || `ipfs://QmSongMetadataPlaceholder`;

        // Set Contributors in database
        const totalCollabPercent = collaborators.reduce((acc, c) => acc + c.percentage, 0);
        dbContributors = [
          {
            wallet_address: address,
            basis_points: (100 - totalCollabPercent) * 100,
            role: 'artist',
            display_name: 'Creator',
          },
          ...collaborators.map(c => ({
            wallet_address: c.wallet,
            basis_points: c.percentage * 100,
            role: c.role || 'collaborator',
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

        // Create Edition in database
        const parsedPriceVal = Number(licensePrice);
        const safePriceVal = isNaN(parsedPriceVal) ? 0 : parsedPriceVal;

        const editionRes = await apiFetch(`/api/songs/${songDbId}/editions`, {
          method: 'POST',
          body: JSON.stringify({
            edition_type: contractType === 'erc721' ? 'single' : 'multi',
            max_supply: contractType === 'erc721' ? 1 : (Number(editionsCount) || 100),
            mint_price_usdc: safePriceVal,
          }),
        });
        if (!editionRes || !editionRes.ok) {
          throw new Error('Failed to create edition in database');
        }
        const editionJson = await editionRes.json();
        const editionDb = editionJson.data || editionJson.edition || editionJson;
        editionDbId = editionDb.id;
      }

      // Publish on Chain
      const contributorsParam = dbContributors.map((c: any) => ({
        account: c.wallet_address as `0x${string}`,
        basisPoints: c.basis_points,
      }));

      const parsedPriceVal = Number(licensePrice);
      const safePriceVal = isNaN(parsedPriceVal) ? 0 : parsedPriceVal;

      const mintTx = await publishSongOnChain(
        config,
        songMetadataUri,
        contributorsParam,
        editionDbId,
        0, // open/standard
        0, // unlimited or 1
        parseUSDC(safePriceVal)
      );

      setTxHash(mintTx);
      const receipt = await waitForTx(config, mintTx);
      const parsedTokenId = receipt.logs?.[0]?.topics?.[3] ? parseInt(receipt.logs[0].topics[3], 16).toString() : '1';
      setTokenId(parsedTokenId);

      // Finalize in Database
      await apiFetch(`/api/songs/${songDbId}/published`, {
        method: 'POST',
        body: JSON.stringify({
          on_chain_id: parsedTokenId,
          edition_db_id: editionDbId,
          on_chain_edition_id: parsedTokenId,
          tx_hash: mintTx,
        }),
      });

      // Clear pending storage
      localStorage.removeItem('pending_track_id');
      localStorage.removeItem('pending_track_title');
      localStorage.removeItem('pending_track_cover');
      localStorage.removeItem('pending_track_genre');
      localStorage.removeItem('pending_track_tags');
      localStorage.removeItem('pending_track_rights');
      localStorage.removeItem('pending_track_payment');
      localStorage.removeItem('pending_track_price');
      localStorage.removeItem('pending_track_royalty');

      setMintStatus('success');
      toast.success('Track minted on-chain successfully!');
    } catch (err: any) {
      console.error('Minting error:', err);
      toast.error(err.message || 'Minting transaction failed');
      setMintStatus('idle');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#192134] text-white font-sans selection:bg-[#8A2BE2] selection:text-white">
      {/* Sidebar (256px) */}
      <Sidebar activePage="dashboard" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#192134]">
        
        {/* ========================================================================= */}
        {/* TOP BAR HEADER (Figma Page Header - height: 60px)                          */}
        {/* ========================================================================= */}
        <header className="flex items-center justify-between px-6 sm:px-8 py-3.5 bg-[#0F172A] border-b border-[#232B3E] shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/upload')}
              className="flex items-center gap-2 text-white hover:text-[#8A2BE2] transition-colors cursor-pointer"
              aria-label="Back"
            >
              <div className="w-7 h-7 flex items-center justify-center">
                <ChevronLeft size={20} />
              </div>
              <span className="text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                Back
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-['Space_Grotesk',sans-serif] text-[#E5E5E5]">
            <CheckCircle2 size={16} className="text-[#00FF88]" />
            <span>Autosaved</span>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* STEP BREADCRUMB BAR (Figma Step Indicator - height: 64px)                 */}
        {/* ========================================================================= */}
        <div className="flex items-center px-6 sm:px-8 py-4 bg-[#192134] border-b border-[#232B3E] shrink-0 gap-6 overflow-x-auto no-scrollbar">
          {/* Step 1: Completed */}
          <Link href="/dashboard/upload" className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-[#8A2BE2] flex items-center justify-center text-white font-bold font-['Space_Grotesk',sans-serif] text-sm shadow-[0_0_10px_rgba(138,43,226,0.5)]">
              <Check size={16} strokeWidth={3} />
            </div>
            <span className="text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-[#8A2BE2] whitespace-nowrap">
              Upload Audio, Add Metadata &amp; Licensing
            </span>
          </Link>

          {/* Chevron Separator */}
          <div className="text-[#8A2BE2] shrink-0">
            <ChevronLeft size={18} className="rotate-180" />
          </div>

          {/* Step 2: Active */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#8A2BE2] flex items-center justify-center text-white font-bold font-['Space_Grotesk',sans-serif] text-sm shadow-[0_0_10px_rgba(138,43,226,0.5)]">
              2
            </div>
            <span className="text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-[#8A2BE2] whitespace-nowrap">
              Mint Track
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SCROLLABLE MAIN FORM (Desktop: 1512px x 1198px / Mobile: 440px x 1632px)   */}
        {/* ========================================================================= */}
        <main className="flex-1 overflow-y-auto pb-32 px-4 sm:px-8 py-6 sm:py-8 bg-[#192134]">
          <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* ───────────────────────────────────────────────────────────────── */}
            {/* LEFT COLUMN: Blockchain Configuration (Figma Desktop: 720px width) */}
            {/* ───────────────────────────────────────────────────────────────── */}
            <div className="lg:col-span-7 space-y-6">

              {/* CARD 1: BLOCKCHAIN CONFIGURATION (Figma height 870px, #0F172A) */}
              <div className="bg-[#0F172A] border border-[#2D3548] rounded-[24px] p-6 space-y-6">
                <h2 className="text-xl font-semibold font-['Clash_Display',sans-serif] text-white">
                  Blockchain Configuration
                </h2>

                {/* Frame 8: Network Box (688px x 128px) */}
                <div className="bg-[#192134] border border-[#2D3548] rounded-xl p-5 space-y-4">
                  <h3 className="text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                    Network
                  </h3>

                  <div className="flex flex-wrap items-center justify-between sm:justify-start gap-4 sm:gap-8 pt-1">
                    {/* Option 1: POLYGON */}
                    <label 
                      onClick={() => setNetwork('polygon')}
                      className="flex items-center gap-3 cursor-pointer select-none"
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        network === 'polygon' ? 'border-[#8A2BE2]' : 'border-[#959595]'
                      }`}>
                        {network === 'polygon' && <div className="w-3 h-3 rounded-full bg-[#8A2BE2]" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-6 flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-[#DA0A78] flex items-center justify-center text-[10px] font-bold text-white">
                            P
                          </div>
                        </div>
                        <span className="text-base font-bold font-['JetBrains_Mono',monospace] text-white">
                          POLYGON
                        </span>
                      </div>
                    </label>

                    {/* Option 2: SOLANA */}
                    <label 
                      onClick={() => setNetwork('solana')}
                      className="flex items-center gap-3 cursor-pointer select-none opacity-80 hover:opacity-100"
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        network === 'solana' ? 'border-[#8A2BE2]' : 'border-[#959595]'
                      }`}>
                        {network === 'solana' && <div className="w-3 h-3 rounded-full bg-[#8A2BE2]" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-4 bg-gradient-to-tr from-[#00FFA3] to-[#DC1FFF] rounded-sm flex items-center justify-center text-[9px] font-bold text-black">
                          S
                        </div>
                        <span className="text-base font-bold font-['JetBrains_Mono',monospace] text-white">
                          SOLANA
                        </span>
                      </div>
                    </label>

                    {/* Option 3: ETHEREUM */}
                    <label 
                      onClick={() => setNetwork('ethereum')}
                      className="flex items-center gap-3 cursor-pointer select-none opacity-80 hover:opacity-100"
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        network === 'ethereum' ? 'border-[#8A2BE2]' : 'border-[#959595]'
                      }`}>
                        {network === 'ethereum' && <div className="w-3 h-3 rounded-full bg-[#8A2BE2]" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#FF00EE] flex items-center justify-center text-[10px] font-bold text-white">
                          Ξ
                        </div>
                        <span className="text-base font-bold font-['JetBrains_Mono',monospace] text-white">
                          ETHEREUM
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Frame 9: Smart Contract Type Box (688px x 208px) */}
                <div className="bg-[#192134] border border-[#2D3548] rounded-xl p-5 space-y-4">
                  <h3 className="text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                    Smart Contract Type
                  </h3>

                  <div className="space-y-4">
                    {/* Single Edition ERC-721 */}
                    <label 
                      onClick={() => setContractType('erc721')}
                      className="flex items-center gap-3 cursor-pointer select-none"
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        contractType === 'erc721' ? 'border-[#8A2BE2]' : 'border-[#959595]'
                      }`}>
                        {contractType === 'erc721' && <div className="w-3 h-3 rounded-full bg-[#8A2BE2]" />}
                      </div>
                      <span className="text-base font-normal font-['Space_Grotesk',sans-serif] text-white">
                        Single Edition (ERC-721)
                      </span>
                    </label>

                    {/* Multi-Edition ERC-1155 */}
                    <div className="space-y-3">
                      <label 
                        onClick={() => setContractType('erc1155')}
                        className="flex items-center gap-3 cursor-pointer select-none"
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          contractType === 'erc1155' ? 'border-[#8A2BE2]' : 'border-[#959595]'
                        }`}>
                          {contractType === 'erc1155' && <div className="w-3 h-3 rounded-full bg-[#8A2BE2]" />}
                        </div>
                        <span className="text-base font-normal font-['Space_Grotesk',sans-serif] text-white">
                          Multi-Edition (ERC-1155)
                        </span>
                      </label>

                      {/* Frame 100: No. of Editions Input Box */}
                      {contractType === 'erc1155' && (
                        <div className="flex items-center justify-between p-3.5 bg-[#0F172A] border border-[#232B3E] rounded-xl">
                          <span className="text-base font-normal font-['Space_Grotesk',sans-serif] text-white">
                            No. of Editions
                          </span>
                          <input
                            type="number"
                            min="1"
                            value={editionsCount}
                            onChange={(e) => setEditionsCount(e.target.value)}
                            placeholder="100"
                            className="w-28 h-12 px-3 bg-[#192134] border-2 border-[#606060] focus:border-[#8A2BE2] rounded-lg text-right text-base font-['Space_Grotesk',sans-serif] text-white focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Frame 10: Royalty Split Box (688px x 232px) */}
                <div className="bg-[#192134] border border-[#2D3548] rounded-xl p-5 space-y-4">
                  <h3 className="text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                    Royalty Split
                  </h3>

                  {/* Royalty Percentage Row */}
                  <div className="flex items-center justify-between">
                    <span className="text-base font-normal font-['Space_Grotesk',sans-serif] text-[#959595]">
                      Royalty
                    </span>
                    <span className="text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                      {royaltyPercentage}%
                    </span>
                  </div>

                  {/* Creator Splits Row & Add Button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-base font-normal font-['Space_Grotesk',sans-serif] text-[#959595]">
                      Creator Splits
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCollabModal(true)}
                      className="inline-flex items-center gap-2 text-base font-bold font-['Space_Grotesk',sans-serif] text-white hover:text-[#8A2BE2] transition-colors cursor-pointer"
                    >
                      <Plus size={18} />
                      <span>Add Collaborator</span>
                    </button>
                  </div>

                  {/* Collaborators Box */}
                  <div className="p-4 bg-[#0F172A] border border-[#232B3E] rounded-xl min-h-[80px] flex flex-col justify-center">
                    {collaborators.length > 0 ? (
                      <div className="space-y-2.5">
                        {collaborators.map((c, i) => (
                          <div key={i} className="flex items-center justify-between text-base font-['Space_Grotesk',sans-serif] py-1 border-b border-[#232B3E] last:border-0">
                            <div>
                              <span className="font-bold text-white">@{c.username}</span>
                              <span className="text-zinc-400 ml-2 text-sm">({c.role || 'collaborator'})</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[#8A2BE2] font-bold">{c.percentage}%</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCollaborator(i)}
                                className="text-[#FF0044] hover:opacity-80 cursor-pointer"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-base font-normal font-['Space_Grotesk',sans-serif] text-white py-2">
                        No Collaborators Added Yet
                      </p>
                    )}
                  </div>
                </div>

                {/* Frame 11: Metadata Storage Box (688px x 144px) */}
                <div className="bg-[#192134] border border-[#2D3548] rounded-xl p-5 space-y-4">
                  <h3 className="text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                    Metadata Storage
                  </h3>

                  <div className="flex flex-wrap items-center gap-6">
                    {/* Option 1: IPFS (Recommended) */}
                    <label 
                      onClick={() => setStorage('IPFS')}
                      className="flex items-center gap-3 cursor-pointer select-none"
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        storage === 'IPFS' ? 'border-[#8A2BE2]' : 'border-[#959595]'
                      }`}>
                        {storage === 'IPFS' && <div className="w-3 h-3 rounded-full bg-[#8A2BE2]" />}
                      </div>
                      <span className="text-base font-normal font-['Space_Grotesk',sans-serif] text-white">
                        IPFS
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#232B3E] text-[#00FFC6] text-xs font-normal font-['Space_Grotesk',sans-serif]">
                        Recommended
                      </span>
                    </label>

                    {/* Option 2: On-Chain */}
                    <label 
                      onClick={() => setStorage('On-Chain')}
                      className="flex items-center gap-3 cursor-pointer select-none"
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        storage === 'On-Chain' ? 'border-[#8A2BE2]' : 'border-[#959595]'
                      }`}>
                        {storage === 'On-Chain' && <div className="w-3 h-3 rounded-full bg-[#8A2BE2]" />}
                      </div>
                      <span className="text-base font-normal font-['Space_Grotesk',sans-serif] text-white">
                        On-Chain (Advanced)
                      </span>
                    </label>
                  </div>
                </div>

              </div>

            </div>

            {/* ───────────────────────────────────────────────────────────────── */}
            {/* RIGHT COLUMN: Track Summary & Wallet Fee (Figma Desktop: 448px)   */}
            {/* ───────────────────────────────────────────────────────────────── */}
            <div className="lg:col-span-5 space-y-6">

              {/* CARD 2: TRACK SUMMARY (Figma Desktop: 448px x 224px, #0F172A) */}
              <div className="bg-[#0F172A] border border-[#555D70] rounded-[24px] p-6 space-y-5">
                <h2 className="text-xl font-semibold font-['Clash_Display',sans-serif] text-white">
                  Track Summary
                </h2>

                <div className="bg-[#0F172A] border border-[#2D3548] rounded-xl p-4 flex items-center gap-4">
                  {/* Cover Art Box (100x100) */}
                  <div className="w-24 h-24 rounded-md bg-[#192134] border border-[#2D3548] overflow-hidden shrink-0 flex items-center justify-center">
                    {trackCover ? (
                      <img src={trackCover} alt="Track Cover" className="w-full h-full object-cover" />
                    ) : (
                      <Disc size={36} className="text-zinc-500" />
                    )}
                  </div>

                  {/* Info Box (Frame 20: 268px x 106px) */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-xl font-bold font-['Clash_Display',sans-serif] text-white truncate">
                          {trackTitle}
                        </h3>
                        <p className="text-base font-['Space_Grotesk',sans-serif] text-zinc-300">
                          {trackGenre}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-['Space_Grotesk',sans-serif] text-white">
                          AUDIO
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-start pt-1">
                      <span className="inline-flex items-center px-3 py-1 bg-[#192134] rounded-full text-[#00FFC6] text-base font-bold font-['Space_Grotesk',sans-serif]">
                        Ready to mint
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 3: WALLET & GAS FEE (Figma Desktop: 448px x 182px, #0F172A) */}
              <div className="bg-[#0F172A] border border-[#555D70] rounded-[24px] p-6 space-y-5">
                <h2 className="text-xl font-bold font-['Clash_Display',sans-serif] text-white">
                  Wallet &amp; Gas Fee
                </h2>

                <div className="bg-[#0F172A] border border-[#2D3548] rounded-xl p-4 space-y-3">
                  {/* Connected Wallet */}
                  <div className="flex items-center justify-between text-base font-['Space_Grotesk',sans-serif]">
                    <span className="text-[#959595]">Wallet</span>
                    <span className="font-bold text-white">
                      {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not Connected'}
                    </span>
                  </div>

                  {/* Gas Fee */}
                  <div className="flex items-center justify-between text-base font-['Space_Grotesk',sans-serif]">
                    <span className="text-[#959595]">Gas Fee (est.)</span>
                    <span className="font-bold text-white">$0.38</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </main>

        {/* ========================================================================= */}
        {/* FIXED BOTTOM ACTION BAR (Figma CTA Bar: height 88px, 1256px, #0F172A)     */}
        {/* ========================================================================= */}
        <footer className="h-[88px] bg-[#0F172A] border-t border-[#464646] px-6 sm:px-10 flex items-center justify-end gap-4 shrink-0 z-30">
          <button
            type="button"
            onClick={() => router.push('/dashboard/upload')}
            className="h-14 px-8 bg-[#192134] hover:bg-[#232B3E] text-white rounded-lg text-base font-bold font-['Space_Grotesk',sans-serif] transition-all cursor-pointer"
          >
            Save as draft
          </button>

          <button
            type="button"
            onClick={handleStartMinting}
            disabled={mintStatus === 'minting'}
            className="h-14 px-10 bg-[#8A2BE2] hover:bg-[#7823c9] disabled:opacity-50 text-white rounded-lg text-base font-bold font-['Space_Grotesk',sans-serif] shadow-[0_0_20px_rgba(138,43,226,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {mintStatus === 'minting' ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Minting...</span>
              </>
            ) : (
              <>
                <span>Mint Track</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </footer>

      </div>

      {/* ========================================================================= */}
      {/* COLLABORATOR ADD MODAL                                                    */}
      {/* ========================================================================= */}
      {showCollabModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-[#2D3548] rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold font-['Clash_Display',sans-serif] text-white">
              Add Collaborator
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1 font-['Space_Grotesk',sans-serif]">
                  Username (without @)
                </label>
                <input
                  type="text"
                  value={collabUsername}
                  onChange={(e) => setCollabUsername(e.target.value)}
                  placeholder="e.g. producer_jane"
                  className="w-full h-12 bg-[#192134] border border-[#2D3548] focus:border-[#8A2BE2] rounded-lg px-3 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1 font-['Space_Grotesk',sans-serif]">
                    Split %
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={collabPercentage}
                    onChange={(e) => setCollabPercentage(Number(e.target.value))}
                    className="w-full h-12 bg-[#192134] border border-[#2D3548] focus:border-[#8A2BE2] rounded-lg px-3 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1 font-['Space_Grotesk',sans-serif]">
                    Role
                  </label>
                  <select
                    value={collabRole}
                    onChange={(e) => setCollabRole(e.target.value)}
                    className="w-full h-12 bg-[#192134] border border-[#2D3548] focus:border-[#8A2BE2] rounded-lg px-3 text-sm text-white focus:outline-none cursor-pointer"
                  >
                    <option value="producer">Producer</option>
                    <option value="writer">Writer</option>
                    <option value="vocalist">Vocalist</option>
                    <option value="engineer">Engineer</option>
                    <option value="composer">Composer</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCollabModal(false)}
                className="h-10 px-4 bg-[#192134] text-zinc-300 rounded-lg text-sm font-bold font-['Space_Grotesk',sans-serif]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCollabClick}
                disabled={isSearchingCollab}
                className="h-10 px-6 bg-[#8A2BE2] text-white rounded-lg text-sm font-bold font-['Space_Grotesk',sans-serif] flex items-center gap-2"
              >
                {isSearchingCollab ? <Loader2 size={16} className="animate-spin" /> : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <MintConfirmationModal
        isOpen={isModalOpen && mintStatus === 'confirming'}
        onClose={() => { setIsModalOpen(false); setMintStatus('idle'); }}
        onConfirm={handleMintConfirmed}
        songDetails={{
          title: trackTitle,
          coverImage: trackCover,
          price: licensePrice,
          royalty: royaltyPercentage,
          paymentModel: paymentModel,
          genre: trackGenre,
          tags: trackTags,
          rights: trackRights,
        }}
      />

      {/* Mint Success Modal */}
      <MintSuccessModal
        isOpen={mintStatus === 'success'}
        onClose={() => { setMintStatus('idle'); router.push('/dashboard'); }}
        txHash={txHash}
        tokenId={tokenId}
        songDetails={{
          title: trackTitle,
          coverImage: trackCover,
          price: licensePrice,
          royalty: royaltyPercentage,
          paymentModel: paymentModel,
          genre: trackGenre,
        }}
      />

    </div>
  );
}
