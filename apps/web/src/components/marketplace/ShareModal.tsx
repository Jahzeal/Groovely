'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Share2, Twitter, Send, Download, Code, Lock, Music } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: {
    id: number | string;
    title: string;
    artist: string;
    image: string;
    audioUrl?: string;
    isPurchased?: boolean;
    isCreator?: boolean;
  };
  onOpenMintModal?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  track,
  onOpenMintModal,
}) => {
  const [activeTab, setActiveTab] = useState<'share' | 'embed' | 'export'>('share');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://grooveli.com';
  const trackUrl = `${baseUrl}/marketplace/${track.id}`;
  const embedUrl = `${baseUrl}/embed/${track.id}`;
  const embedCode = `<iframe src="${embedUrl}" width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style="border-radius: 16px;"></iframe>`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(trackUrl);
      setCopiedLink(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      toast.success('Embed code copied!');
      setTimeout(() => setCopiedEmbed(false), 2000);
    } catch {
      toast.error('Failed to copy embed code');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${track.title} by ${track.artist}`,
          text: `Listen to "${track.title}" by ${track.artist} on Grooveli!`,
          url: trackUrl,
        });
        toast.success('Shared successfully!');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`Listen to "${track.title}" by ${track.artist} on @Grooveli 🎵\n\n${trackUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareTelegram = () => {
    const text = encodeURIComponent(`Listen to "${track.title}" by ${track.artist} on Grooveli 🎵`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(trackUrl)}&text=${text}`, '_blank');
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Listen to "${track.title}" by ${track.artist} on Grooveli: ${trackUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleExportAudio = async () => {
    if (!track.audioUrl) {
      toast.error('Audio file not available for download');
      return;
    }

    setIsExporting(true);
    try {
      let resolvedUrl = track.audioUrl;
      if (resolvedUrl.startsWith('ipfs://')) {
        resolvedUrl = `https://gateway.pinata.cloud/ipfs/${resolvedUrl.replace('ipfs://', '')}`;
      }

      const response = await fetch(resolvedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${track.artist} - ${track.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Master audio export started!');
    } catch (err) {
      console.error('Audio export error:', err);
      // Fallback: open in new tab
      let resolvedUrl = track.audioUrl;
      if (resolvedUrl.startsWith('ipfs://')) {
        resolvedUrl = `https://gateway.pinata.cloud/ipfs/${resolvedUrl.replace('ipfs://', '')}`;
      }
      window.open(resolvedUrl, '_blank');
    } finally {
      setIsExporting(false);
    }
  };

  const hasAccessToExport = track.isPurchased || track.isCreator;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#0c101c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
              <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-white truncate">{track.title}</h3>
              <p className="text-xs text-zinc-400 font-medium truncate">{track.artist}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/5 px-6 pt-2 gap-4">
          <button
            onClick={() => setActiveTab('share')}
            className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'share'
                ? 'text-accent-purple border-accent-purple'
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            Share
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'embed'
                ? 'text-accent-purple border-accent-purple'
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            Embed Player
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
              activeTab === 'export'
                ? 'text-accent-purple border-accent-purple'
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            Export Audio
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'share' && (
            <div className="space-y-5">
              {/* Copy URL Row */}
              <div>
                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-2 block">
                  Track URL
                </label>
                <div className="flex items-center gap-2 bg-[#050811] border border-white/10 rounded-2xl p-1.5 pl-3">
                  <input
                    readOnly
                    value={trackUrl}
                    className="bg-transparent text-xs text-zinc-300 font-mono flex-1 outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 rounded-xl bg-accent-purple hover:bg-accent-purple/90 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-lg"
                  >
                    {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Social Channels */}
              <div>
                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-2.5 block">
                  Share To
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    onClick={shareTwitter}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#050811] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                      <Twitter size={15} className="text-white" />
                    </div>
                    <span className="text-[11px] font-bold text-zinc-300">X (Twitter)</span>
                  </button>

                  <button
                    onClick={shareTelegram}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#050811] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#229ED9]/20 border border-[#229ED9]/30 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                      <Send size={15} className="text-[#229ED9]" />
                    </div>
                    <span className="text-[11px] font-bold text-zinc-300">Telegram</span>
                  </button>

                  <button
                    onClick={shareWhatsApp}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#050811] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#25D366]/20 border border-[#25D366]/30 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                      <Share2 size={15} className="text-[#25D366]" />
                    </div>
                    <span className="text-[11px] font-bold text-zinc-300">WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Native Share Sheet Shortcut */}
              <button
                onClick={handleNativeShare}
                className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 size={14} />
                <span>More Options (Native Share)</span>
              </button>
            </div>
          )}

          {activeTab === 'embed' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Embed this interactive music player on your blog, personal website, or portfolio.
              </p>

              {/* Embed Preview */}
              <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40">
                <iframe
                  src={embedUrl}
                  width="100%"
                  height="130"
                  style={{ border: 'none' }}
                  title="Embed Preview"
                />
              </div>

              {/* Code Snippet Box */}
              <div>
                <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-1.5 block">
                  HTML Embed Code
                </label>
                <div className="relative">
                  <textarea
                    readOnly
                    rows={3}
                    value={embedCode}
                    className="w-full bg-[#050811] border border-white/10 rounded-2xl p-3 text-[11px] font-mono text-zinc-300 resize-none outline-none"
                  />
                  <button
                    onClick={handleCopyEmbed}
                    className="absolute right-2.5 bottom-3 px-3 py-1.5 rounded-xl bg-accent-purple hover:bg-accent-purple/90 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    {copiedEmbed ? <Check size={12} /> : <Code size={12} />}
                    <span>{copiedEmbed ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-5">
              {hasAccessToExport ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Music size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wide">License Active</h4>
                      <p className="text-xs text-zinc-300 mt-0.5">
                        You have permission to download and export the full lossless master audio file from IPFS.
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={isExporting}
                    onClick={handleExportAudio}
                    className="w-full py-3.5 rounded-2xl bg-accent-cyan hover:bg-accent-cyan/90 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.01]"
                  >
                    <Download size={16} />
                    <span>{isExporting ? 'Downloading Master File...' : 'Download Master Audio (.mp3)'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#050811] border border-white/5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-accent-purple/10 text-accent-purple flex items-center justify-center shrink-0">
                      <Lock size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wide">Master Audio Locked</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Acquiring a license grants immediate on-chain ownership and unlocks the original uncompressed audio file for direct download.
                      </p>
                    </div>
                  </div>

                  {onOpenMintModal && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenMintModal();
                      }}
                      className="w-full py-3.5 rounded-2xl bg-accent-purple hover:bg-accent-purple/90 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:scale-[1.01]"
                    >
                      <span>Buy License to Unlock Export</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
