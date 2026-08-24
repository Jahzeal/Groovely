'use client';

import React, { useState, useRef } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import {
  ChevronLeft,
  Cloud,
  ChevronDown,
  RefreshCw,
  Plus,
  Trash2,
  Lock,
  Globe,
  Music,
  Disc,
  Check,
  CheckCircle2,
  Upload as UploadIcon,
  Play,
  Pause,
  ArrowRight,
  Loader2,
  FileAudio
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Music', 'Podcast', 'Beat', 'Skit'];
const GENRES = [
  'Afrobeats',
  'Amapiano',
  'Hip-Hop',
  'R&B',
  'Pop',
  'Electronic / Dance',
  'Rock',
  'Alternative',
  'Jazz',
  'Reggae / Dancehall',
  'Classical',
  'Other'
];
const KEYS = [
  'C Major', 'C Minor', 'C# Major', 'C# Minor',
  'D Major', 'D Minor', 'D# Major', 'D# Minor',
  'E Major', 'E Minor', 'F Major', 'F Minor',
  'F# Major', 'F# Minor', 'G Major', 'G Minor',
  'G# Major', 'G# Minor', 'A Major', 'A Minor',
  'A# Major', 'A# Minor', 'B Major', 'B Minor'
];

export default function UploadPage() {
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioDuration, setAudioDuration] = useState<string>('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [explicit, setExplicit] = useState(false);
  const [category, setCategory] = useState('Music');
  const [genre, setGenre] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Advanced metadata
  const [bpm, setBpm] = useState('');
  const [key, setKey] = useState('');
  const [isrc, setIsrc] = useState('');

  // Licensing state
  const [usageRights, setUsageRights] = useState<string[]>([
    'Personal Use',
    'Commercial use'
  ]);
  const [paymentModel, setPaymentModel] = useState<'fixed' | 'royalty' | 'none'>('fixed');
  const [licensePrice, setLicensePrice] = useState('0.00');
  const [royaltyPercentage, setRoyaltyPercentage] = useState(10);
  const [creditRequired, setCreditRequired] = useState(true);
  const [allowDerivatives, setAllowDerivatives] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingAudio, setIsDraggingAudio] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | null = null;
    if ('files' in e.target && e.target.files?.[0]) {
      file = e.target.files[0];
    } else if ('dataTransfer' in e && e.dataTransfer.files?.[0]) {
      file = e.dataTransfer.files[0];
    }
    
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      // Determine duration
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        const mins = Math.floor(audio.duration / 60);
        const secs = Math.floor(audio.duration % 60);
        setAudioDuration(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      };
    } else if (file) {
      toast.error('Please upload a valid audio file (.mp3, .wav, .flac)');
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
      toast.error('Please upload a valid image file (.jpg, .png, .webp)');
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
      const clean = tagInput.trim().toLowerCase().replace(/^#/, '');
      if (!tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleNext = async (isDraft = false) => {
    if (!audioFile) {
      toast.error('Please upload an audio file');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter a track title');
      return;
    }
    if (!agreedToTerms && !isDraft) {
      toast.error('You must confirm ownership and agree to the Terms & Conditions');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description || '');
    formData.append('audio', audioFile);
    if (coverFile) formData.append('cover', coverFile);
    formData.append('visibility', isPublic ? 'public' : 'private');
    formData.append('explicit', String(explicit));
    formData.append('category', category.toLowerCase());
    formData.append('genre', genre || 'Other');
    formData.append('tags', JSON.stringify(tags));
    if (bpm) formData.append('bpm', bpm);
    if (key) formData.append('key', key);
    if (isrc) formData.append('isrc', isrc);
    formData.append('usage_rights', JSON.stringify(usageRights));
    formData.append('payment_model', paymentModel);
    formData.append('license_price', licensePrice || '0.00');
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

      // Store track data for minting step
      localStorage.setItem('pending_track_id', json.data?.id || json.id);
      localStorage.setItem('pending_track_title', json.data?.title || title);
      localStorage.setItem('pending_track_cover', json.data?.cover_url || coverPreview || '');
      localStorage.setItem('pending_track_genre', genre);
      localStorage.setItem('pending_track_tags', JSON.stringify(tags));
      localStorage.setItem('pending_track_rights', JSON.stringify(usageRights));
      localStorage.setItem('pending_track_payment', paymentModel);
      localStorage.setItem('pending_track_price', licensePrice);
      localStorage.setItem('pending_track_royalty', String(royaltyPercentage));

      toast.success(isDraft ? 'Track saved as draft!' : 'Track uploaded successfully!');
      router.push('/dashboard/upload/mint');
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#192134] text-white font-sans selection:bg-[#8A2BE2] selection:text-white">
      {/* Sidebar */}
      <Sidebar activePage="dashboard" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#192134]">
        
        {/* ========================================================================= */}
        {/* TOP BAR HEADER (Figma Segmented Picker Header - height: 60px)             */}
        {/* ========================================================================= */}
        <header className="flex items-center justify-between px-6 sm:px-8 py-3.5 bg-[#0F172A] border-b border-[#232B3E] shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1.5 rounded-lg text-white hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-base sm:text-lg font-bold font-['Space_Grotesk',sans-serif] text-white tracking-tight">
              Upload &amp; Mint Audio
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-['Space_Grotesk',sans-serif] text-[#E5E5E5]">
            <CheckCircle2 size={16} className="text-[#00FF88]" />
            <span>Autosaved</span>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* STEP BREADCRUMB BAR (Figma Step 1 & 2 - height: 64px)                     */}
        {/* ========================================================================= */}
        <div className="flex items-center px-6 sm:px-8 py-4 bg-[#192134] border-b border-[#232B3E] shrink-0 gap-6 overflow-x-auto no-scrollbar">
          {/* Step 1: Active */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#8A2BE2] flex items-center justify-center text-white font-bold font-['Space_Grotesk',sans-serif] text-sm shadow-[0_0_10px_rgba(138,43,226,0.5)]">
              1
            </div>
            <span className="text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-[#8A2BE2]">
              Upload Audio, Add Metadata &amp; Licensing
            </span>
          </div>

          {/* Chevron Separator */}
          <div className="text-[#B0B0B0] shrink-0">
            <ChevronLeft size={18} className="rotate-180" />
          </div>

          {/* Step 2: Inactive */}
          <div className="flex items-center gap-3 shrink-0 opacity-70">
            <div className="w-8 h-8 rounded-full border border-[#B0B0B0] flex items-center justify-center text-[#B0B0B0] font-normal font-['Space_Grotesk',sans-serif] text-sm">
              2
            </div>
            <span className="text-sm sm:text-base font-normal font-['Space_Grotesk',sans-serif] text-[#B0B0B0]">
              Mint Track
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SCROLLABLE MAIN FORM (Desktop Dual Column Layout)                         */}
        {/* ========================================================================= */}
        <main className="flex-1 overflow-y-auto pb-32 px-4 sm:px-8 py-6 sm:py-8 bg-[#192134]">
          <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* ───────────────────────────────────────────────────────────────── */}
            {/* LEFT COLUMN (Cols 1 to 7): Audio, Cover Art, Details, Genre, Category */}
            {/* ───────────────────────────────────────────────────────────────── */}
            <div className="lg:col-span-7 space-y-6">

              {/* CARD 1: AUDIO UPLOAD (Figma: height 598px, #0F172A, radius 24px) */}
              <div className="bg-[#0F172A] border border-[#2D3548] rounded-[24px] p-6 space-y-5">
                <h2 className="text-xl font-semibold font-['Clash_Display',sans-serif] text-white">
                  Audio
                </h2>

                {/* Dashed Dropzone */}
                <input
                  type="file"
                  ref={audioInputRef}
                  onChange={handleAudioChange}
                  accept="audio/*"
                  className="hidden"
                />

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingAudio(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDraggingAudio(false); }}
                  onDrop={(e) => { e.preventDefault(); setIsDraggingAudio(false); handleAudioChange(e); }}
                  onClick={() => audioInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDraggingAudio
                      ? 'border-[#8A2BE2] bg-[#8A2BE2]/5'
                      : 'border-[#2D3548] hover:border-[#8A2BE2]/50 bg-[#192134]/30'
                  }`}
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#8A2BE2]/10 flex items-center justify-center text-[#8A2BE2] mb-4">
                    <Cloud size={48} />
                  </div>

                  <p className="text-lg sm:text-xl font-bold font-['Clash_Display',sans-serif] text-white max-w-sm">
                    Drag &amp; drop your audio file here or
                  </p>

                  <button
                    type="button"
                    className="mt-2 text-lg sm:text-xl font-bold font-['Clash_Display',sans-serif] text-[#8A2BE2] hover:underline"
                  >
                    Browse
                  </button>
                  <p className="text-xs text-zinc-400 mt-2 font-['Space_Grotesk',sans-serif]">
                    Supported formats: MP3, WAV, FLAC, AAC (up to 100MB)
                  </p>
                </div>

                {/* Audio Status & Preview Box */}
                <div className="bg-[#192134] border border-[#2D3548] rounded-xl p-4 flex items-center justify-between min-h-[90px]">
                  {audioFile ? (
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-[#8A2BE2]/20 border border-[#8A2BE2]/40 flex items-center justify-center text-[#8A2BE2] shrink-0">
                        <FileAudio size={24} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold font-['Space_Grotesk',sans-serif] text-white truncate">
                          {audioFile.name}
                        </p>
                        <p className="text-xs font-['Space_Grotesk',sans-serif] text-[#CACACA]">
                          {(audioFile.size / (1024 * 1024)).toFixed(2)} MB {audioDuration && `• ${audioDuration}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setAudioFile(null); }}
                        className="text-[#FF0044] hover:opacity-80 p-2"
                        aria-label="Remove audio"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full text-center py-2">
                      <p className="text-base font-bold font-['Space_Grotesk',sans-serif] text-[#E5E5E5]">
                        No Audio Uploaded Yet
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ROW: COVER ART + VISIBILITY SETTINGS */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                
                {/* CARD 2: COVER ART (Cols 1 to 7) */}
                <div className="sm:col-span-7 bg-[#0F172A] border border-[#2D3548] rounded-[24px] p-6 space-y-4">
                  <h2 className="text-xl font-semibold font-['Clash_Display',sans-serif] text-white">
                    Cover Art
                  </h2>

                  <input
                    type="file"
                    ref={coverInputRef}
                    onChange={handleCoverChange}
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* Image Preview Container (214x214) */}
                    <div 
                      onClick={() => coverInputRef.current?.click()}
                      className="w-40 h-40 sm:w-48 sm:h-48 rounded-xl bg-[#192134] border border-[#2D3548] flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-[#8A2BE2]/50 transition-colors relative"
                    >
                      {coverPreview ? (
                        <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-zinc-500 p-4 text-center">
                          <Disc size={36} className="text-zinc-600 mb-2" />
                          <span className="text-xs font-['Space_Grotesk',sans-serif]">Click to upload</span>
                        </div>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-3 w-full sm:w-auto flex-1">
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="h-14 px-6 bg-[#8A2BE2] hover:bg-[#7823c9] text-white rounded-lg text-base font-bold font-['Space_Grotesk',sans-serif] transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <UploadIcon size={18} />
                        <span>Upload</span>
                      </button>

                      {coverPreview && (
                        <button
                          type="button"
                          onClick={() => { setCoverFile(null); setCoverPreview(null); }}
                          className="h-12 px-6 text-[#FF0044] hover:bg-[#FF0044]/10 rounded-lg text-base font-bold font-['Space_Grotesk',sans-serif] transition-all cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* CARD 3: VISIBILITY SETTINGS (Cols 8 to 12) */}
                <div className="sm:col-span-5 bg-[#0F172A] border border-[#2D3548] rounded-[24px] p-6 space-y-4 flex flex-col justify-between">
                  <h2 className="text-xl font-semibold font-['Clash_Display',sans-serif] text-white">
                    Visibility Settings
                  </h2>

                  <div className="space-y-3">
                    {/* Public Option */}
                    <label 
                      onClick={() => setIsPublic(true)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#192134] border border-[#2D3548] cursor-pointer hover:border-[#8A2BE2]/50 transition-all"
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isPublic ? 'border-[#8A2BE2]' : 'border-[#959595]'
                      }`}>
                        {isPublic && <div className="w-2.5 h-2.5 rounded-full bg-[#8A2BE2]" />}
                      </div>
                      <span className="text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                        Public
                      </span>
                    </label>

                    {/* Private Option */}
                    <label 
                      onClick={() => setIsPublic(false)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#192134] border border-[#2D3548] cursor-pointer hover:border-[#8A2BE2]/50 transition-all"
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        !isPublic ? 'border-[#8A2BE2]' : 'border-[#959595]'
                      }`}>
                        {!isPublic && <div className="w-2.5 h-2.5 rounded-full bg-[#8A2BE2]" />}
                      </div>
                      <span className="text-sm sm:text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                        Private
                      </span>
                    </label>
                  </div>
                </div>

              </div>

              {/* CARD 4: TRACK DETAILS (Figma Metadata Section) */}
              <div className="bg-[#0F172A] border border-[#2D3548] rounded-[24px] p-6 space-y-5">
                <h2 className="text-xl font-semibold font-['Clash_Display',sans-serif] text-white">
                  Track Details
                </h2>

                {/* Title */}
                <div className="space-y-2">
                  <label className="block text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    className="w-full h-14 bg-transparent border-2 border-[#606060] focus:border-[#8A2BE2] rounded-lg px-4 text-base font-['Space_Grotesk',sans-serif] text-white placeholder-[#606060] focus:outline-none transition-colors"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write a short description"
                    className="w-full bg-transparent border-2 border-[#606060] focus:border-[#8A2BE2] rounded-lg p-4 text-base font-['Space_Grotesk',sans-serif] text-white placeholder-[#606060] focus:outline-none transition-colors"
                  />
                </div>

                {/* Explicit Content Toggle */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-base font-normal font-['Space_Grotesk',sans-serif] text-white">
                    Explicit Content
                  </span>
                  <button
                    type="button"
                    onClick={() => setExplicit(prev => !prev)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      explicit ? 'bg-[#8A2BE2]' : 'bg-[#959595]'
                    }`}
                    aria-label="Toggle explicit content"
                  >
                    <div className={`w-6 h-6 rounded-full bg-white transition-transform shadow-md ${
                      explicit ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* CARD 5: GENRE & TAGS */}
              <div className="bg-[#0F172A] border border-[#2D3548] rounded-[24px] p-6 space-y-5">
                <h2 className="text-xl font-semibold font-['Clash_Display',sans-serif] text-white">
                  Genre &amp; Tags
                </h2>

                {/* Genre Select */}
                <div className="space-y-2">
                  <label className="block text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                    Genre
                  </label>
                  <div className="relative">
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full h-14 bg-[#192134] border-2 border-[#606060] focus:border-[#8A2BE2] rounded-lg px-4 pr-10 text-base font-['Space_Grotesk',sans-serif] text-white placeholder-[#606060] focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Select a genre</option>
                      {GENRES.map((g) => (
                        <option key={g} value={g} className="bg-[#192134] text-white">
                          {g}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-white pointer-events-none" />
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="block text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                    Tags (Optional)
                  </label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Choose your tags (press Enter)"
                    className="w-full h-14 bg-transparent border-2 border-[#606060] focus:border-[#8A2BE2] rounded-lg px-4 text-base font-['Space_Grotesk',sans-serif] text-white placeholder-[#606060] focus:outline-none transition-colors"
                  />

                  {/* Tags Container */}
                  <div className="bg-[#192134] border border-[#2D3548] rounded-xl p-4 min-h-[90px] flex flex-wrap items-center gap-2">
                    {tags.length > 0 ? (
                      tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#232B3E] border border-[#2D3548] rounded-full text-xs font-bold font-['Space_Grotesk',sans-serif] text-white"
                        >
                          #{t}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            className="hover:text-[#FF0044]"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <p className="w-full text-center text-sm font-bold font-['Space_Grotesk',sans-serif] text-[#CACACA]">
                        No Tags Added Yet
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* CARD 6: CATEGORY */}
              <div className="bg-[#0F172A] border border-[#2D3548] rounded-[24px] p-6 space-y-4">
                <h2 className="text-xl font-semibold font-['Clash_Display',sans-serif] text-white">
                  Category
                </h2>

                <div className="flex flex-wrap gap-3">
                  {CATEGORIES.map((cat) => {
                    const active = category.toLowerCase() === cat.toLowerCase();
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-5 py-2.5 rounded-full text-base font-bold font-['Space_Grotesk',sans-serif] transition-all cursor-pointer ${
                          active
                            ? 'bg-[#8A2BE2]/10 border-2 border-[#8A2BE2] text-white shadow-[0_0_12px_rgba(138,43,226,0.3)]'
                            : 'bg-[#192134] border border-[#2D3548] text-[#CACACA] hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CARD 7: ADVANCED DETAILS (Optional) */}
              <div className="bg-[#0F172A] border border-[#2D3548] rounded-[24px] p-6 space-y-5">
                <h2 className="text-xl font-semibold font-['Clash_Display',sans-serif] text-white">
                  Advanced Details (Optional)
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* BPM */}
                  <div className="space-y-2">
                    <label className="block text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                      BPM (for producers)
                    </label>
                    <input
                      type="number"
                      value={bpm}
                      onChange={(e) => setBpm(e.target.value)}
                      placeholder="0-300"
                      className="w-full h-14 bg-transparent border-2 border-[#606060] focus:border-[#8A2BE2] rounded-lg px-4 text-base font-['Space_Grotesk',sans-serif] text-white placeholder-[#606060] focus:outline-none"
                    />
                  </div>

                  {/* Key */}
                  <div className="space-y-2">
                    <label className="block text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                      Key
                    </label>
                    <div className="relative">
                      <select
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        className="w-full h-14 bg-[#192134] border-2 border-[#606060] focus:border-[#8A2BE2] rounded-lg px-4 pr-10 text-base font-['Space_Grotesk',sans-serif] text-white placeholder-[#606060] focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Select a key</option>
                        {KEYS.map((k) => (
                          <option key={k} value={k} className="bg-[#192134] text-white">
                            {k}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-white pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* ISRC */}
                <div className="space-y-2">
                  <label className="block text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                    ISRC (if available)
                  </label>
                  <input
                    type="text"
                    value={isrc}
                    onChange={(e) => setIsrc(e.target.value)}
                    placeholder="AB-123-456-7890"
                    className="w-full h-14 bg-transparent border-2 border-[#606060] focus:border-[#8A2BE2] rounded-lg px-4 text-base font-['Space_Grotesk',sans-serif] text-white placeholder-[#606060] focus:outline-none"
                  />
                </div>
              </div>

            </div>

            {/* ───────────────────────────────────────────────────────────────── */}
            {/* RIGHT COLUMN (Cols 8 to 12): Licensing Card (Figma width 448px)     */}
            {/* ───────────────────────────────────────────────────────────────── */}
            <div className="lg:col-span-5 space-y-6">

              <div className="bg-[#0F172A]/80 border border-[#555D70] rounded-[24px] p-6 space-y-6">
                <h2 className="text-xl font-semibold font-['Clash_Display',sans-serif] text-white">
                  Licensing
                </h2>

                {/* Usage Rights */}
                <div className="bg-[#0F172A] border border-[#2D3548] rounded-xl p-5 space-y-4">
                  <h3 className="text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                    Usage Rights
                  </h3>

                  <div className="space-y-3">
                    {[
                      'Personal Use',
                      'Remix Allowed',
                      'Commercial use',
                      'Distribution Allowed'
                    ].map((right) => {
                      const checked = usageRights.includes(right);
                      return (
                        <label
                          key={right}
                          onClick={() => toggleUsageRight(right)}
                          className="flex items-center gap-3 cursor-pointer select-none"
                        >
                          <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                            checked ? 'bg-[#8A2BE2] border-[#8A2BE2] text-white' : 'border-[#959595] bg-transparent'
                          }`}>
                            {checked && <Check size={16} strokeWidth={3} />}
                          </div>
                          <span className="text-base font-normal font-['Space_Grotesk',sans-serif] text-white">
                            {right}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Model */}
                <div className="bg-[#0F172A] border border-[#2D3548] rounded-xl p-5 space-y-5">
                  <h3 className="text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                    Payment Model
                  </h3>

                  {/* Option 1: Fixed Price */}
                  <div className="flex items-center justify-between gap-4">
                    <label 
                      onClick={() => setPaymentModel('fixed')}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentModel === 'fixed' ? 'border-[#8A2BE2]' : 'border-[#959595]'
                      }`}>
                        {paymentModel === 'fixed' && <div className="w-2.5 h-2.5 rounded-full bg-[#8A2BE2]" />}
                      </div>
                      <span className="text-base font-normal font-['Space_Grotesk',sans-serif] text-white">
                        Fixed License Price
                      </span>
                    </label>

                    <div className="flex items-center border-2 border-[#606060] rounded-lg px-3 py-1.5 bg-[#192134] w-28">
                      <span className="text-white font-bold mr-1">$</span>
                      <input
                        type="number"
                        step="any"
                        disabled={paymentModel !== 'fixed'}
                        value={licensePrice}
                        onChange={(e) => setLicensePrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-transparent text-sm font-['Space_Grotesk',sans-serif] text-white focus:outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Option 2: Royalty */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <label 
                        onClick={() => setPaymentModel('royalty')}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentModel === 'royalty' ? 'border-[#8A2BE2]' : 'border-[#959595]'
                        }`}>
                          {paymentModel === 'royalty' && <div className="w-2.5 h-2.5 rounded-full bg-[#8A2BE2]" />}
                        </div>
                        <span className="text-base font-normal font-['Space_Grotesk',sans-serif] text-white">
                          Royalty
                        </span>
                      </label>

                      <div className="flex items-center border-2 border-[#606060] rounded-lg px-3 py-1.5 bg-[#192134] w-28">
                        <span className="text-white font-bold mr-1">%</span>
                        <input
                          type="number"
                          disabled={paymentModel !== 'royalty'}
                          value={royaltyPercentage}
                          onChange={(e) => setRoyaltyPercentage(Number(e.target.value))}
                          placeholder="10"
                          className="w-full bg-transparent text-sm font-['Space_Grotesk',sans-serif] text-white focus:outline-none disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* Royalty Slider */}
                    {paymentModel === 'royalty' && (
                      <div className="pt-2 space-y-2">
                        <input
                          type="range"
                          min="1"
                          max="50"
                          value={royaltyPercentage}
                          onChange={(e) => setRoyaltyPercentage(Number(e.target.value))}
                          className="w-full accent-[#8A2BE2] cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-zinc-400 font-['Space_Grotesk',sans-serif]">
                          <span>1%</span>
                          <span className="text-[#8A2BE2] font-bold">{royaltyPercentage}% Royalty</span>
                          <span>50%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Option 3: No License Fee */}
                  <label 
                    onClick={() => setPaymentModel('none')}
                    className="flex items-center gap-3 cursor-pointer pt-1"
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentModel === 'none' ? 'border-[#8A2BE2]' : 'border-[#959595]'
                    }`}>
                      {paymentModel === 'none' && <div className="w-2.5 h-2.5 rounded-full bg-[#8A2BE2]" />}
                    </div>
                    <span className="text-base font-normal font-['Space_Grotesk',sans-serif] text-white">
                      No License Fee
                    </span>
                  </label>
                </div>

                {/* Additional Settings */}
                <div className="bg-[#0F172A] border border-[#2D3548] rounded-xl p-5 space-y-4">
                  <h3 className="text-base font-bold font-['Space_Grotesk',sans-serif] text-white">
                    Additional Settings
                  </h3>

                  <div className="flex items-center justify-between">
                    <span className="text-base font-normal font-['Space_Grotesk',sans-serif] text-white">
                      Credit Required
                    </span>
                    <button
                      type="button"
                      onClick={() => setCreditRequired(prev => !prev)}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        creditRequired ? 'bg-[#8A2BE2]' : 'bg-[#959595]'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white transition-transform shadow-md ${
                        creditRequired ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-base font-normal font-['Space_Grotesk',sans-serif] text-white">
                      Allow Derivatives
                    </span>
                    <button
                      type="button"
                      onClick={() => setAllowDerivatives(prev => !prev)}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        allowDerivatives ? 'bg-[#8A2BE2]' : 'bg-[#959595]'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full bg-white transition-transform shadow-md ${
                        allowDerivatives ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Consent Checkbox */}
                <label 
                  onClick={() => setAgreedToTerms(prev => !prev)}
                  className="flex items-start gap-3 cursor-pointer pt-2"
                >
                  <div className={`w-6 h-6 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                    agreedToTerms ? 'bg-[#8A2BE2] border-[#8A2BE2] text-white' : 'border-[#959595] bg-transparent'
                  }`}>
                    {agreedToTerms && <Check size={16} strokeWidth={3} />}
                  </div>
                  <span className="text-sm font-normal font-['Space_Grotesk',sans-serif] text-white leading-snug">
                    I confirm I own the rights to this audio and agree to Groovely’s Terms &amp; Conditions
                  </span>
                </label>

              </div>

            </div>

          </div>
        </main>

        {/* ========================================================================= */}
        {/* FIXED BOTTOM ACTION BAR (Figma: height 88px, #0F172A, border-top)         */}
        {/* ========================================================================= */}
        <footer className="h-[88px] bg-[#0F172A] border-t border-[#2D3548] px-6 sm:px-10 flex items-center justify-end gap-4 shrink-0 z-30">
          <button
            type="button"
            onClick={() => handleNext(true)}
            disabled={isUploading}
            className="h-14 px-8 bg-[#192134] hover:bg-[#232B3E] text-white rounded-lg text-base font-bold font-['Space_Grotesk',sans-serif] transition-all cursor-pointer"
          >
            Save As Draft
          </button>

          <button
            type="button"
            onClick={() => handleNext(false)}
            disabled={isUploading}
            className="h-14 px-10 bg-[#8A2BE2] hover:bg-[#7823c9] disabled:opacity-50 text-white rounded-lg text-base font-bold font-['Space_Grotesk',sans-serif] shadow-[0_0_20px_rgba(138,43,226,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <span>Next</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </footer>

      </div>
    </div>
  );
}
