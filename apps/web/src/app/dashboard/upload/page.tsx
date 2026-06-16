'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import {
  ChevronLeft,
  Cloud,
  HelpCircle,
  Info,
  ChevronDown,
  RefreshCw,
  Plus,
  Trash2,
  Lock,
  Globe,
  Music,
  Mic2,
  Radio,
  Drum,
  Search,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

export default function UploadPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPublic, setIsPublic] = useState(true);
  const [explicit, setExplicit] = useState(false);
  const [category, setCategory] = useState('Music');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [genre, setGenre] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [usageRights, setUsageRights] = useState<string[]>(['Personal Use']);
  const [bpm, setBpm] = useState('');
  const [key, setKey] = useState('');
  const [isrc, setIsrc] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Payment Model state
  const [paymentModel, setPaymentModel] = useState<'fixed' | 'royalty' | 'none'>('fixed');
  const [licensePrice, setLicensePrice] = useState('0.00');
  const [royaltyPercentage, setRoyaltyPercentage] = useState(10);

  const [isDraggingAudio, setIsDraggingAudio] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | null = null;
    if ('files' in e.target && e.target.files?.[0]) {
      file = e.target.files[0];
    } else if ('dataTransfer' in e && e.dataTransfer.files?.[0]) {
      file = e.dataTransfer.files[0];
    }
    
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
    } else if (file) {
      toast.error('Please upload a valid audio file');
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | null = null;
    if ('files' in (e.target as any) && (e.target as any).files?.[0]) {
      file = (e.target as any).files[0];
    } else if ('dataTransfer' in e && (e as React.DragEvent).dataTransfer.files?.[0]) {
      file = (e as React.DragEvent).dataTransfer.files[0];
    }

    if (file && file.type.startsWith('image/')) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      toast.error('Please upload a valid image file');
    }
  };

  const handleDragOver = (e: React.DragEvent, type: 'audio' | 'cover') => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'audio') setIsDraggingAudio(true);
    else setIsDraggingCover(true);
  };

  const handleDragLeave = (e: React.DragEvent, type: 'audio' | 'cover') => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'audio') setIsDraggingAudio(false);
    else setIsDraggingCover(false);
  };

  const handleDrop = (e: React.DragEvent, type: 'audio' | 'cover') => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'audio') {
      setIsDraggingAudio(false);
      handleAudioChange(e);
    } else {
      setIsDraggingCover(false);
      handleCoverChange(e);
    }
  };

  const toggleUsageRight = (right: string) => {
    setUsageRights(prev =>
      prev.includes(right) ? prev.filter(r => r !== right) : [...prev, right]
    );
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim().toLowerCase())) {
        setTags([...tags, tagInput.trim().toLowerCase()]);
      }
      setTagInput('');
    }
  };

  const handleNext = async () => {
    if (!audioFile) {
      toast.error('Please upload an audio file');
      return;
    }
    if (!title) {
      toast.error('Please enter a track title');
      return;
    }
    if (!agreedToTerms) {
      toast.error('You must confirm ownership and agree to the Terms & Conditions');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('audio', audioFile);
    if (coverFile) formData.append('cover', coverFile);
    formData.append('visibility', isPublic ? 'public' : 'private');
    formData.append('explicit', String(explicit));
    formData.append('category', category.toLowerCase());
    formData.append('genre', genre);
    formData.append('tags', JSON.stringify(tags));
    if (bpm) formData.append('bpm', bpm);
    if (key) formData.append('key', key);
    if (isrc) formData.append('isrc', isrc);
    formData.append('usage_rights', JSON.stringify(usageRights));
    formData.append('payment_model', paymentModel);
    formData.append('license_price', licensePrice);
    formData.append('royalty_percentage', String(royaltyPercentage));

    try {
      const res = await apiFetch('/api/creator/tracks', {
        method: 'POST',
        body: formData,
      });

      if (!res) return;

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || json.error || 'Failed to upload track');
      }

      // Store track data for next steps
      localStorage.setItem('pending_track_id', json.data.id);
      localStorage.setItem('pending_track_title', json.data.title);
      localStorage.setItem('pending_track_cover', json.data.cover_url);
      localStorage.setItem('pending_track_genre', genre);
      localStorage.setItem('pending_track_tags', JSON.stringify(tags));
      localStorage.setItem('pending_track_rights', JSON.stringify(usageRights));
      localStorage.setItem('pending_track_payment', paymentModel);
      localStorage.setItem('pending_track_price', licensePrice);
      localStorage.setItem('pending_track_royalty', String(royaltyPercentage));

      toast.success('Track uploaded successfully!');
      router.push('/dashboard/upload/mint');
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#050510] text-white font-sans selection:bg-accent-cyan selection:text-black">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative pb-24 overflow-y-auto">
        {/* Top Header */}
        <header className="flex items-center justify-between px-10 py-6 border-b border-white/5 bg-[#050510]/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest group">
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold">
              <RefreshCw size={14} className="animate-spin-slow" />
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

        {/* Step Progress */}
        <div className="max-w-6xl mx-auto w-full px-10 pt-10">
          <div className="flex items-center gap-12 mb-12">
            {[
              { id: 1, label: 'Upload Audio, Add Metadata & Licensing' },
              { id: 2, label: 'Mint Track' }
            ].map((s) => (
              <div key={s.id} className="flex items-center gap-4 group cursor-pointer" onClick={() => setStep(s.id)}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-[0_0_15px_rgba(157,0,255,0.1)] 
                  ${step >= s.id ? 'bg-accent-purple text-white shadow-[0_0_20px_rgba(157,0,255,0.4)]' : 'bg-white/5 text-zinc-500 border border-white/10'}
                `}>
                  {s.id}
                </div>
                <span className={`text-sm font-bold tracking-wide transition-colors ${step >= s.id ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                  {s.label}
                </span>
                {s.id < 2 && <div className="ml-8 text-zinc-800 font-light select-none">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-800"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            {/* Left Column: Audio and Metadata */}
            <div className="xl:col-span-4 space-y-10">
              {/* Audio Upload */}
              <div className="bg-white/5 border border-white/5 rounded-[32px] p-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#00FF85] mb-6 flex items-center gap-2">
                  Audio
                  <Info size={14} className="text-zinc-600" />
                </h3>
                <div
                  onClick={() => document.getElementById('audio-input')?.click()}
                  onDragOver={(e) => handleDragOver(e, 'audio')}
                  onDragLeave={(e) => handleDragLeave(e, 'audio')}
                  onDrop={(e) => handleDrop(e, 'audio')}
                  className={`aspect-square border-2 border-dashed rounded-[24px] flex flex-col items-center justify-center text-center p-8 transition-all hover:bg-white/5 group cursor-pointer overflow-hidden
                    ${isDraggingAudio ? 'border-accent-purple bg-accent-purple/10 scale-[1.02]' : 'border-white/10 hover:border-accent-purple/50'}
                  `}
                >
                  <input
                    type="file"
                    id="audio-input"
                    accept="audio/*"
                    onChange={handleAudioChange}
                    className="hidden"
                  />
                  {audioFile ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-20 bg-[#00FF85] rounded-xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,255,133,0.4)] transition-transform">
                        <Music size={32} className="text-black" />
                      </div>
                      <p className="text-lg font-bold mb-2 truncate max-w-full px-4">{audioFile.name}</p>
                      <p className="text-zinc-500 font-medium text-xs">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-20 bg-accent-purple rounded-xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(157,0,255,0.6)] group-hover:scale-110 transition-transform">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                      </div>
                      <p className="text-lg font-bold mb-2">Drag & drop your audio file here</p>
                      <p className="text-zinc-500 font-medium mb-2">or</p>
                      <span className="text-accent-purple font-black text-xl hover:text-[#B14BFF] transition-colors">Browse files</span>
                    </>
                  )}
                </div>
                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                  <p className="text-zinc-500 font-medium text-sm italic">
                    {audioFile ? 'Audio Ready for Upload' : 'No Audio Uploaded Yet'}
                  </p>
                </div>
              </div>

              {/* Track Details */}
              <div className="bg-white/5 border border-white/5 rounded-[32px] p-8 space-y-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                  Track Details
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Title"
                      className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-5 py-4 text-sm font-medium placeholder:text-zinc-700 outline-none focus:border-accent-purple/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">Description (Optional)</label>
                    <textarea
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Write a short description"
                      className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-5 py-3 text-sm font-medium placeholder:text-zinc-700 outline-none focus:border-accent-purple/50 transition-all resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-bold text-zinc-300">Explicit Content</span>
                    <button
                      onClick={() => setExplicit(!explicit)}
                      className={`w-12 h-6 rounded-full transition-all relative ${explicit ? 'bg-accent-purple' : 'bg-zinc-800'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${explicit ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column: Cover Art and More */}
            <div className="xl:col-span-4 space-y-10">
              {/* Cover Art */}
              <div className="bg-white/5 border border-white/5 rounded-[32px] p-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#00FF85] mb-6 flex items-center justify-between">
                  Cover Art
                  <Info size={14} className="text-zinc-600" />
                </h3>
                <div 
                  onClick={() => document.getElementById('cover-input')?.click()}
                  onDragOver={(e) => handleDragOver(e, 'cover')}
                  onDragLeave={(e) => handleDragLeave(e, 'cover')}
                  onDrop={(e) => handleDrop(e, 'cover')}
                  className={`aspect-square bg-[#0F0F1A] rounded-[24px] flex items-center justify-center p-12 mb-6 overflow-hidden border-2 border-transparent transition-all cursor-pointer group
                    ${isDraggingCover ? 'border-accent-purple bg-accent-purple/10 scale-[1.02]' : 'hover:border-white/10'}
                  `}
                >
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <div className="w-full h-full rounded-full border-[10px] border-zinc-900 border-t-zinc-800 flex items-center justify-center group-hover:border-t-zinc-700 transition-colors">
                      <div className="w-4 h-4 bg-zinc-800 group-hover:bg-zinc-700 rounded-full" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="file"
                    id="cover-input"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                  <Button
                    onClick={() => document.getElementById('cover-input')?.click()}
                    className="w-full bg-accent-purple hover:bg-[#B14BFF] py-4"
                  >
                    Upload image
                  </Button>
                  <button
                    onClick={() => { setCoverFile(null); setCoverPreview(null); }}
                    className="text-red-500 font-bold text-sm py-2 hover:opacity-80 transition-opacity"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Visibility Settings */}
              <div className="bg-white/5 border border-white/5 rounded-[32px] p-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Visibility Settings</h3>
                <div className="flex gap-8">
                  <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsPublic(true)}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isPublic ? 'border-accent-purple bg-accent-purple/20' : 'border-zinc-700 bg-transparent group-hover:border-zinc-500'}`}>
                      {isPublic && <div className="w-2 h-2 bg-accent-purple rounded-full" />}
                    </div>
                    <Globe size={18} className={isPublic ? 'text-accent-purple' : 'text-zinc-600'} />
                    <span className={`text-sm font-bold ${isPublic ? 'text-white' : 'text-zinc-500'}`}>Public</span>
                  </div>
                  <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsPublic(false)}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${!isPublic ? 'border-accent-purple bg-accent-purple/20' : 'border-zinc-700 bg-transparent group-hover:border-zinc-500'}`}>
                      {!isPublic && <div className="w-2 h-2 bg-accent-purple rounded-full" />}
                    </div>
                    <Lock size={18} className={!isPublic ? 'text-accent-purple' : 'text-zinc-600'} />
                    <span className={`text-sm font-bold ${!isPublic ? 'text-white' : 'text-zinc-500'}`}>Private</span>
                  </div>
                </div>
              </div>

              {/* Genre & Tags */}
              <div className="bg-white/5 border border-white/5 rounded-[32px] p-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#00FF85] mb-6 flex items-center justify-between">
                  Genre & Tags
                  <Info size={14} className="text-zinc-600" />
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">Genre</label>
                    <div className="relative">
                      <select
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl pl-5 pr-10 py-4 text-sm font-medium text-zinc-400 outline-none focus:border-accent-purple/50 appearance-none cursor-pointer"
                      >
                        <option value="">Select a genre</option>
                        <option value="afrobeats">Afrobeats</option>
                        <option value="hip-hop">Hip Hop</option>
                        <option value="r&b">R&B</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder="Type and press Enter"
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-5 py-4 text-sm font-medium text-zinc-400 outline-none focus:border-accent-purple/50 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[100px] p-4 border-2 border-dashed border-white/5 rounded-2xl">
                    {tags.length > 0 ? tags.map((tag) => (
                      <span key={tag} className="bg-accent-purple/20 border border-accent-purple/30 text-accent-purple px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                        {tag}
                        <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-white">×</button>
                      </span>
                    )) : (
                      <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest m-auto">No Tags Added Yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Licensing and Cat */}
            <div className="xl:col-span-4 space-y-10">
              {/* Licensing */}
              <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-8">Licensing</h3>

                <div className="space-y-8">
                  {/* Usage Rights */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-5 ml-1">Usage Rights</p>
                    <div className="space-y-4">
                      {['Personal Use', 'Remix Allowed', 'Commercial use', 'Distribution Allowed'].map((right) => (
                        <div
                          key={right}
                          onClick={() => toggleUsageRight(right)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${usageRights.includes(right) ? 'bg-accent-purple border-accent-purple' : 'border-zinc-700 bg-[#0F0F1A] group-hover:border-zinc-500'}`}>
                            {usageRights.includes(right) && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          <span className={`text-sm font-bold ${usageRights.includes(right) ? 'text-white' : 'text-zinc-300'}`}>{right}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Model */}
                  <div className="pt-8 border-t border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 ml-1">Payment Model</p>
                    <div className="space-y-6 font-sans">
                      {/* Fixed License Price */}
                      <div 
                        className="flex items-center justify-between gap-4 cursor-pointer"
                        onClick={() => setPaymentModel('fixed')}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentModel === 'fixed' ? 'border-accent-purple bg-accent-purple/20' : 'border-zinc-700 bg-transparent'}`}>
                            {paymentModel === 'fixed' && <div className="w-2 h-2 bg-accent-purple rounded-full" />}
                          </div>
                          <span className={`text-sm font-bold transition-colors ${paymentModel === 'fixed' ? 'text-white' : 'text-zinc-500'}`}>Fixed License Price</span>
                        </div>
                        <div className="w-24 relative" onClick={(e) => e.stopPropagation()}>
                          <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm transition-colors ${paymentModel === 'fixed' ? 'text-zinc-400' : 'text-zinc-600'}`}>$</span>
                          <input 
                            type="text" 
                            value={licensePrice}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9.]/g, '');
                              setLicensePrice(val);
                            }}
                            disabled={paymentModel !== 'fixed'}
                            className={`w-full bg-transparent border border-white/10 rounded-lg pl-6 pr-3 py-2 text-sm font-bold text-right outline-none focus:border-accent-purple/50 transition-colors ${paymentModel === 'fixed' ? 'text-white' : 'text-zinc-500'}`} 
                          />
                        </div>
                      </div>

                      {/* Royalty */}
                      <div className="space-y-4">
                        <div 
                          className="flex items-center justify-between gap-4 cursor-pointer"
                          onClick={() => setPaymentModel('royalty')}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentModel === 'royalty' ? 'border-accent-purple bg-accent-purple/20' : 'border-zinc-700 bg-transparent'}`}>
                              {paymentModel === 'royalty' && <div className="w-2 h-2 bg-accent-purple rounded-full" />}
                            </div>
                            <span className={`text-sm font-bold transition-colors ${paymentModel === 'royalty' ? 'text-white' : 'text-zinc-500'}`}>Royalty</span>
                          </div>
                          <div className="w-24 relative" onClick={(e) => e.stopPropagation()}>
                            <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm transition-colors ${paymentModel === 'royalty' ? 'text-zinc-400' : 'text-zinc-600'}`}>%</span>
                            <input 
                              type="text" 
                              value={royaltyPercentage}
                              onChange={(e) => {
                                let val = parseInt(e.target.value.replace(/[^0-9]/g, ''));
                                if (isNaN(val)) val = 0;
                                if (val > 100) val = 100;
                                setRoyaltyPercentage(val);
                              }}
                              disabled={paymentModel !== 'royalty'}
                              className={`w-full bg-transparent border border-white/10 rounded-lg pl-6 pr-3 py-2 text-sm font-bold text-right outline-none focus:border-accent-purple/50 transition-colors ${paymentModel === 'royalty' ? 'text-white' : 'text-zinc-500'}`} 
                            />
                          </div>
                        </div>
                        <div className="px-2 relative pt-2">
                          <div className={`h-2 rounded-full w-full relative ${paymentModel === 'royalty' ? 'bg-zinc-800' : 'bg-zinc-900 opacity-50'}`}>
                            <div 
                              className="h-full bg-accent-purple rounded-full relative transition-all duration-75"
                              style={{ width: `${royaltyPercentage}%` }}
                            >
                              {paymentModel === 'royalty' && (
                                <div className="absolute -right-3 -top-8 bg-zinc-800 border border-white/10 px-1.5 py-1 rounded-md text-[10px] font-black text-white shadow-xl pointer-events-none">
                                  {royaltyPercentage}%
                                  <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-1.5 h-1.5 bg-zinc-800 border-r border-b border-white/10 rotate-45" />
                                </div>
                              )}
                              <div className={`absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] pointer-events-none ${paymentModel === 'royalty' ? 'bg-white' : 'bg-zinc-600'}`} />
                            </div>
                          </div>
                          {paymentModel === 'royalty' && (
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={royaltyPercentage}
                              onChange={(e) => setRoyaltyPercentage(Number(e.target.value))}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          )}
                        </div>
                      </div>

                      {/* No License Fee */}
                      <div 
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => setPaymentModel('none')}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${paymentModel === 'none' ? 'border-accent-purple bg-accent-purple/20' : 'border-zinc-700 bg-transparent'}`}>
                          {paymentModel === 'none' && <div className="w-2 h-2 bg-accent-purple rounded-full" />}
                        </div>
                        <span className={`text-sm font-bold transition-colors ${paymentModel === 'none' ? 'text-white' : 'text-zinc-500'}`}>No License Fee</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/5">
                    <div 
                      onClick={() => setAgreedToTerms(!agreedToTerms)}
                      className="flex items-start gap-4 cursor-pointer group"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${agreedToTerms ? 'bg-accent-purple border-accent-purple' : 'border-zinc-700 bg-[#0F0F1A] group-hover:border-zinc-500'} mt-0.5`}>
                        {agreedToTerms && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <p className="text-[10px] font-bold text-zinc-500 leading-normal">
                        I confirm I own the rights to this audio and agree to Groovely's <span className="text-accent-purple">Terms & Conditions</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="bg-white/5 border border-white/5 rounded-[32px] p-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {['Music', 'Podcast', 'Skit', 'Beat'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${category === cat ? 'bg-accent-purple text-white' : 'bg-white/5 text-zinc-500 border border-white/5 hover:bg-white/10'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Details */}
              <div className="bg-white/5 border border-white/5 rounded-[32px] p-8 space-y-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center justify-between">
                  Advanced Details (Optional)
                  <ChevronDown size={16} className="text-zinc-600" />
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">BPM (for producers)</label>
                    <input
                      type="number"
                      value={bpm}
                      onChange={(e) => setBpm(e.target.value)}
                      placeholder="0-300"
                      className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-5 py-4 text-sm font-medium placeholder:text-zinc-700 outline-none focus:border-accent-purple/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">Key</label>
                    <div className="relative">
                      <select
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl pl-5 pr-10 py-4 text-sm font-medium text-zinc-400 outline-none focus:border-accent-purple/50 appearance-none cursor-pointer"
                      >
                        <option value="">Select a key</option>
                        <option value="C Major">C Major</option>
                        <option value="A Minor">A Minor</option>
                        <option value="G Major">G Major</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">ISRC (If available)</label>
                    <input
                      type="text"
                      value={isrc}
                      onChange={(e) => setIsrc(e.target.value)}
                      placeholder="AB-123-456-7890"
                      className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-5 py-4 text-sm font-medium placeholder:text-zinc-700 outline-none focus:border-accent-purple/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <footer className="fixed bottom-0 right-0 left-64 bg-[#0F0F1A]/80 backdrop-blur-xl border-t border-white/5 px-10 py-6 flex items-center justify-end gap-4 z-40">
          <Button variant="secondary" className="px-10" disabled={isUploading}>Save as Draft</Button>
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={isUploading}
            className="px-12 bg-accent-purple shadow-[0_0_20px_rgba(157,0,255,0.3)] min-w-[140px]"
          >
            {isUploading ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : 'Next'}
          </Button>
        </footer>
      </div>
    </div>
  );
}
