'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Upload, Music, Sparkles, Lock, Globe, Mic, Users, DollarSign, Calendar, Clock, Plus, Trash2, Check, Radio, Play, Radio as RadioIcon } from 'lucide-react';
import { apiFetch, cachedApiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated?: (roomData: any) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose, onRoomCreated }) => {
  const [modalStep, setModalStep] = useState<1 | 2 | 3>(1); // 1 = Setup, 2 = Review, 3 = "Your Room is Now Live"
  const [loading, setLoading] = useState(false);
  const [createdRoom, setCreatedRoom] = useState<any>(null);
  const router = useRouter();
  
  // Step 1 Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('Afrobeat');
  const [coverUrl, setCoverUrl] = useState('');
  const [roomType, setRoomType] = useState<'public' | 'private'>('public');
  const [hasListenerLimit, setHasListenerLimit] = useState(false);
  const [maxListeners, setMaxListeners] = useState(50);
  
  // Advanced Features
  const [isRecorded, setIsRecorded] = useState(true);
  const [enableTipping, setEnableTipping] = useState(true);
  const [allowHandRaise, setAllowHandRaise] = useState(true);
  const [stemsEnabled, setStemsEnabled] = useState(false);
  const [coHostInput, setCoHostInput] = useState('');
  const [coHosts, setCoHosts] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [startTimeType, setStartTimeType] = useState<'now' | 'scheduled'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [dbCreators, setDbCreators] = useState<any[]>([]);

  // Fetch Real Creator Profiles from PostgreSQL Database API
  useEffect(() => {
    if (!isOpen) return;
    async function loadCreators() {
      try {
        const { data } = await cachedApiFetch('/api/fan/creators');
        if (data?.creators && Array.isArray(data.creators)) {
          const mapped = data.creators.map((u: any) => ({
            handle: u.username || u.name?.replace(/\s+/g, '') || `user${u.id}`,
            name: u.display_name || u.name || 'Platform Creator',
            avatar: u.profile_url || u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            role: u.creator_type || 'Verified Creator',
          }));
          setDbCreators(mapped);
        }
      } catch (err) {
        console.warn('Could not fetch DB creators for suggestions:', err);
      }
    }
    loadCreators();
  }, [isOpen]);

  // Fallback Popular Creator Suggestions List if DB is initializing
  const defaultSuggestedCreators = [
    { handle: 'Uzor', name: 'Uzor Producer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', role: 'Verified Creator' },
    { handle: 'Darrell', name: 'Darrell Beats', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', role: 'Executive Producer' },
    { handle: 'JahzealDave', name: 'Jahzeal Dave', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', role: 'Afrobeats Artist' },
    { handle: 'NightWhisper', name: 'Night Whisper', avatar: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=200&q=80', role: 'Sound Engineer' },
    { handle: 'SlickBeats', name: 'Slick Beats', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80', role: 'Mixing Master' },
    { handle: 'Kaelo', name: 'Kaelo Vibes', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', role: 'Lo-Fi Producer' },
  ];

  const activeCreatorList = dbCreators.length > 0 ? dbCreators : defaultSuggestedCreators;

  const filteredSuggestions = activeCreatorList.filter(c => {
    const query = coHostInput.trim().toLowerCase().replace(/^@/, '');
    if (!query) return true;
    return c.handle.toLowerCase().includes(query) || c.name.toLowerCase().includes(query);
  }).filter(c => !coHosts.includes(c.handle));

  if (!isOpen) return null;

  const handleSelectCreator = (handle: string) => {
    if (!coHosts.includes(handle)) {
      setCoHosts([...coHosts, handle]);
    }
    setCoHostInput('');
    setShowSuggestions(false);
  };

  const handleAddCoHost = () => {
    if (!coHostInput.trim()) return;
    const handle = coHostInput.trim().replace(/^@/, '');
    if (!coHosts.includes(handle)) {
      setCoHosts([...coHosts, handle]);
    }
    setCoHostInput('');
  };

  const handleRemoveCoHost = (handle: string) => {
    setCoHosts(coHosts.filter(h => h !== handle));
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a room title');
      return;
    }
    setModalStep(2);
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        genre,
        cover_url: coverUrl || 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?auto=format&fit=crop&w=600&q=80',
        room_type: roomType,
        max_listeners: hasListenerLimit ? Number(maxListeners) : 500,
        is_recorded: isRecorded,
        enable_tipping: enableTipping,
        allow_hand_raise: allowHandRaise,
        stems_enabled: stemsEnabled,
        co_host_handles: coHosts,
        scheduled_for: startTimeType === 'scheduled' && scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
      };

      const res = await apiFetch('/api/rooms', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!res || !res.ok) {
        const err = await res?.json();
        throw new Error(err?.message || 'Failed to create room');
      }

      const { data } = await res.json();
      setCreatedRoom(data);
      if (onRoomCreated) onRoomCreated(data);
      
      // Advance to Step 3: "Your Room is Now Live"
      setModalStep(3);
    } catch (err: any) {
      console.error('Room creation error:', err);
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEnterRoom = () => {
    if (createdRoom?.id) {
      router.push(`/rooms/${createdRoom.id}`);
    } else {
      router.push('/rooms');
    }
    onClose();
    setModalStep(1);
  };

  const genres = ['Afrobeat', 'Hip Hop', 'Amapiano', 'R&B', 'Lo-Fi / Chill', 'Dancehall', 'Pop', 'Podcast / Discussion', 'Studio Session'];

  // Sample playlist cover art for Review Step 2 (matching Figma spec 46x46px thumbnails)
  const sampleCovers = [
    coverUrl || 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1478737270197-497851a1f29d?auto=format&fit=crop&w=200&q=80'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* ── STEP 1: SETUP YOUR LISTENING ROOM ── */}
      {modalStep === 1 && (
        <div className="relative w-full max-w-[880px] max-h-[92vh] bg-[#0F172A] border border-[#232B3E] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col font-['Space_Grotesk',sans-serif] text-white animate-in zoom-in-95 duration-150">
          
          {/* Header Bar */}
          <div className="relative h-[68px] px-8 bg-[#0F172A]/80 border-b border-[#232B3E] backdrop-blur-md flex items-center justify-between shrink-0">
            <button 
              type="button"
              onClick={onClose} 
              className="flex items-center gap-2 text-white hover:text-accent-purple font-bold text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>

            <h2 className="font-['Clash_Display',sans-serif] font-bold text-xl sm:text-2xl text-white tracking-wide">
              Setup Your Listening Room
            </h2>

            <button 
              type="button"
              onClick={onClose} 
              className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <form onSubmit={handleProceedToReview} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
            
            {/* Main Title & Description */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Room Title <span className="text-accent-pink">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VIP Studio Session: Previewing Unreleased Stems!"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full bg-[#192134] border border-[#2D3548] focus:border-[#8A2BE2] rounded-xl px-4 py-3 text-white placeholder-zinc-500 font-medium focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Genre / Category
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-[#192134] border border-[#2D3548] focus:border-[#8A2BE2] rounded-xl px-4 py-3 text-white font-medium focus:outline-none transition-colors"
                  >
                    {genres.map(g => (
                      <option key={g} value={g} className="bg-[#0F172A] text-white">{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Description / Topic Teaser
                  </label>
                  <textarea
                    placeholder="Tell listeners what this room is about, what stems you are breaking down, or guest announcements..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-[#192134] border border-[#2D3548] focus:border-[#8A2BE2] rounded-xl p-4 text-white placeholder-zinc-500 font-medium focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Cover Upload Card (120x120px style) */}
              <div className="flex flex-col items-center justify-center p-6 bg-[#192134] border border-[#2D3548] rounded-2xl text-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                  Room Cover Art
                </label>
                <div className="relative w-32 h-32 rounded-xl bg-[#0F172A] border border-[#2D3548] overflow-hidden flex flex-col items-center justify-center group cursor-pointer shadow-md mb-3">
                  {coverUrl ? (
                    <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-zinc-400 group-hover:text-accent-purple transition-colors">
                      <Upload size={24} />
                      <span className="text-[10px] font-bold">Image URL</span>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Paste Cover Image URL"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#2D3548] rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="h-px bg-[#232B3E] my-2" />

            {/* Visibility, Listener Limit & Scheduling Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Visibility Options */}
              <div className="bg-[#192134] p-4 rounded-xl border border-[#2D3548] space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Visibility
                </label>
                <div className="space-y-2">
                  <label 
                    onClick={() => setRoomType('public')}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${roomType === 'public' ? 'bg-[#8A2BE2]/10 border-[#8A2BE2] text-white' : 'bg-[#0F172A] border-[#2D3548] text-zinc-400'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Globe size={16} className={roomType === 'public' ? 'text-accent-purple' : ''} />
                      <span className="text-sm font-bold">Public</span>
                    </div>
                    {roomType === 'public' && <Check size={16} className="text-accent-purple" />}
                  </label>

                  <label 
                    onClick={() => setRoomType('private')}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${roomType === 'private' ? 'bg-[#8A2BE2]/10 border-[#8A2BE2] text-white' : 'bg-[#0F172A] border-[#2D3548] text-zinc-400'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Lock size={16} className={roomType === 'private' ? 'text-accent-purple' : ''} />
                      <span className="text-sm font-bold">Private (Link)</span>
                    </div>
                    {roomType === 'private' && <Check size={16} className="text-accent-purple" />}
                  </label>
                </div>
              </div>

              {/* Listener Limit Toggle */}
              <div className="bg-[#192134] p-4 rounded-xl border border-[#2D3548] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Set Listener Limit
                  </label>
                  <button
                    type="button"
                    onClick={() => setHasListenerLimit(!hasListenerLimit)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${hasListenerLimit ? 'bg-[#8A2BE2]' : 'bg-[#959595]'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${hasListenerLimit ? 'translate-x-6' : ''}`} />
                  </button>
                </div>

                {hasListenerLimit ? (
                  <div className="pt-2">
                    <input
                      type="number"
                      min={5}
                      max={500}
                      value={maxListeners}
                      onChange={(e) => setMaxListeners(Number(e.target.value))}
                      className="w-full bg-[#0F172A] border border-[#2D3548] rounded-lg px-4 py-2.5 text-white font-mono text-center font-bold focus:outline-none"
                    />
                    <p className="text-[10px] text-zinc-500 text-center mt-1">Cap at 500 maximum live listeners</p>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 py-3 text-center">Unlimited live listeners (Default)</p>
                )}
              </div>

              {/* Start Time Selector */}
              <div className="bg-[#192134] p-4 rounded-xl border border-[#2D3548] space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Start Time
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setStartTimeType('now')}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-bold transition-all ${startTimeType === 'now' ? 'bg-[#8A2BE2]/10 border-[#8A2BE2] text-white' : 'bg-[#0F172A] border-[#2D3548] text-zinc-400'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>Go Live Now</span>
                    </div>
                    {startTimeType === 'now' && <Check size={14} className="text-accent-purple" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStartTimeType('scheduled')}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-bold transition-all ${startTimeType === 'scheduled' ? 'bg-[#8A2BE2]/10 border-[#8A2BE2] text-white' : 'bg-[#0F172A] border-[#2D3548] text-zinc-400'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>Schedule Later</span>
                    </div>
                    {startTimeType === 'scheduled' && <Check size={14} className="text-accent-purple" />}
                  </button>

                  {startTimeType === 'scheduled' && (
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full bg-[#0F172A] border border-[#2D3548] rounded-lg p-2 text-xs text-white font-mono focus:outline-none"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="h-px bg-[#232B3E] my-2" />

            {/* Co-Host Invites & Exclusivity Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Invite Co-Hosts */}
              <div className="bg-[#192134] p-4 rounded-xl border border-[#2D3548] space-y-3 relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Invite Co-Hosts (Creators)
                </label>
                <div className="relative">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="@username or handle..."
                      value={coHostInput}
                      onFocus={() => setShowSuggestions(true)}
                      onChange={(e) => {
                        setCoHostInput(e.target.value);
                        setShowSuggestions(true);
                      }}
                      className="flex-1 bg-[#0F172A] border border-[#2D3548] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8A2BE2]"
                    />
                    <button
                      type="button"
                      onClick={handleAddCoHost}
                      className="px-3 py-2 bg-[#8A2BE2] hover:bg-[#7823c9] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Plus size={14} />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Creator Suggestions Dropdown */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0F172A] border border-[#2D3548] rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50 p-1 custom-scrollbar">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-[#2D3548]">
                        Suggested Platform Creators
                      </div>
                      {filteredSuggestions.map(creator => (
                        <div
                          key={creator.handle}
                          onClick={() => handleSelectCreator(creator.handle)}
                          className="flex items-center justify-between p-2 hover:bg-[#192134] rounded-lg cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={creator.avatar}
                              alt={creator.name}
                              className="w-7 h-7 rounded-full object-cover border border-[#2D3548]"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white group-hover:text-accent-purple truncate">
                                {creator.name}
                              </p>
                              <p className="text-[10px] text-zinc-400 font-mono">@{creator.handle}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-accent-purple bg-[#8A2BE2]/10 px-2 py-0.5 rounded-full border border-[#8A2BE2]/20">
                            {creator.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {coHosts.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {coHosts.map(handle => (
                      <span key={handle} className="inline-flex items-center gap-1.5 bg-[#8A2BE2]/20 border border-[#8A2BE2]/40 text-accent-purple px-2.5 py-1 rounded-full text-xs font-bold">
                        @{handle}
                        <button type="button" onClick={() => handleRemoveCoHost(handle)} className="hover:text-white cursor-pointer">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Interactive Feature Toggles */}
              <div className="bg-[#192134] p-4 rounded-xl border border-[#2D3548] space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Room Features & Controls
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer bg-[#0F172A] p-2.5 rounded-lg border border-[#2D3548]">
                    <input
                      type="checkbox"
                      checked={isRecorded}
                      onChange={(e) => setIsRecorded(e.target.checked)}
                      className="accent-[#8A2BE2] w-4 h-4"
                    />
                    <span className="font-bold text-white">Record Session</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-[#0F172A] p-2.5 rounded-lg border border-[#2D3548]">
                    <input
                      type="checkbox"
                      checked={enableTipping}
                      onChange={(e) => setEnableTipping(e.target.checked)}
                      className="accent-[#8A2BE2] w-4 h-4"
                    />
                    <span className="font-bold text-white">USDC Tipping</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-[#0F172A] p-2.5 rounded-lg border border-[#2D3548]">
                    <input
                      type="checkbox"
                      checked={allowHandRaise}
                      onChange={(e) => setAllowHandRaise(e.target.checked)}
                      className="accent-[#8A2BE2] w-4 h-4"
                    />
                    <span className="font-bold text-white">Hand Raising</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-[#0F172A] p-2.5 rounded-lg border border-[#2D3548]">
                    <input
                      type="checkbox"
                      checked={stemsEnabled}
                      onChange={(e) => setStemsEnabled(e.target.checked)}
                      className="accent-[#8A2BE2] w-4 h-4"
                    />
                    <span className="font-bold text-white">Stems Mode</span>
                  </label>
                </div>
              </div>

            </div>

            {/* Footer Submit Button (Matching #8A2BE2 Figma Spec) */}
            <div className="pt-4 flex items-center justify-end gap-4 border-t border-[#232B3E]">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl border border-[#2D3548] text-zinc-400 hover:text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-8 py-3.5 bg-[#8A2BE2] hover:bg-[#7823c9] text-white font-bold text-base rounded-xl transition-all shadow-[0_0_25px_rgba(138,43,226,0.5)] flex items-center gap-2 cursor-pointer"
              >
                <Sparkles size={18} />
                <span>Next: Review Room</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ── STEP 2: REVIEW MODAL ("Are You Ready To Go Live?") Matching Figma Spec (544px x 506px) ── */}
      {modalStep === 2 && (
        <div className="relative w-full max-w-[544px] bg-[#0F172A] border border-[#232B3E] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col font-['Space_Grotesk',sans-serif] text-white animate-in zoom-in-95 duration-150">
          
          {/* Header Bar */}
          <div className="relative h-[68px] px-6 bg-[#0F172A]/80 border-b border-[#232B3E] backdrop-blur-md flex items-center justify-between shrink-0">
            <button 
              type="button"
              onClick={() => setModalStep(1)} 
              className="flex items-center gap-1.5 text-white hover:text-accent-purple font-bold text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>

            <h2 className="font-['Clash_Display',sans-serif] font-bold text-lg sm:text-xl text-white tracking-wide text-center flex-1 mx-2">
              Are You Ready To Go Live?
            </h2>

            <button 
              type="button"
              onClick={onClose} 
              className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Review Details Body */}
          <div className="p-6 sm:p-8 space-y-6 flex flex-col items-center">
            
            {/* Review Summary Card (Frame 86: 326px width border #232B3E) */}
            <div className="w-full max-w-[326px] bg-[#0F172A] border border-[#232B3E] rounded-[12px] p-4 space-y-4 text-sm font-bold">
              
              {/* Room Title Row */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#959595]">Room Title</span>
                <span className="text-white truncate text-right max-w-[180px]">{title || 'Untitled Session'}</span>
              </div>

              {/* Holding Limit Row */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#959595]">Holding Limit</span>
                <span className="text-white">{hasListenerLimit ? `${maxListeners} Users` : 'Unlimited'}</span>
              </div>

              {/* Room Playlist Thumbnails Row (Frame 89: 46x46px rectangles + overflow count) */}
              <div className="space-y-2 pt-1 border-t border-[#232B3E]/60">
                <div className="flex items-center justify-between">
                  <span className="text-[#959595]">Room Playlist</span>
                  <span className="text-accent-purple text-xs cursor-pointer hover:underline">View Playlist</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {sampleCovers.map((src, i) => (
                    <div key={i} className="w-[46px] h-[46px] rounded-[8px] overflow-hidden bg-[#D9D9D9] border border-white/10 shrink-0">
                      <img src={src} alt={`Cover ${i+1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="w-[46px] h-[46px] rounded-[8px] bg-black/60 border border-white/10 shrink-0 flex items-center justify-center text-xs font-bold text-white">
                    +13
                  </div>
                </div>
              </div>

              {/* Visibility Row */}
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-[#232B3E]/60">
                <span className="text-[#959595]">Visibility</span>
                <span className="text-white capitalize">{roomType}</span>
              </div>

              {/* Start Time Row */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#959595]">Start Time</span>
                <span className="text-white capitalize">{startTimeType === 'now' ? 'Now' : 'Scheduled'}</span>
              </div>
            </div>

            {/* Primary Action Button (Frame 94: #8A2BE2 326px width) */}
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={loading}
              className="w-full max-w-[326px] py-4 bg-[#8A2BE2] hover:bg-[#7823c9] text-white font-bold text-base rounded-[8px] transition-all shadow-[0_0_25px_rgba(138,43,226,0.5)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Launching...</span>
              ) : (
                <>
                  <Play size={18} fill="currentColor" />
                  <span>Go Live</span>
                </>
              )}
            </button>

          </div>
        </div>
      )}

      {/* ── STEP 3: LIVE CONFIRMATION MODAL ("Your Room is Now Live") Matching Figma Spec Frame 96 (544px x 374px) ── */}
      {modalStep === 3 && (
        <div className="relative w-full max-w-[544px] h-[374px] bg-[#0F172A] border border-[#232B3E] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col items-center justify-center p-8 font-['Space_Grotesk',sans-serif] text-white animate-in zoom-in-95 duration-200">
          
          {/* Outer Close Button */}
          <button 
            type="button"
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          {/* Frame 95: Content Stack (326px width x 224px height) */}
          <div className="flex flex-col items-center justify-center text-center gap-6 w-full max-w-[326px]">
            
            {/* Frame 94: Avatar Circle + Title */}
            <div className="flex flex-col items-center gap-3 w-full">
              
              {/* Ellipse 1: 100x100px Circle Badge */}
              <div className="relative w-[100px] h-[100px] rounded-full bg-[#192134] border-2 border-[#8A2BE2] p-1 flex items-center justify-center shadow-[0_0_30px_rgba(138,43,226,0.5)]">
                <img
                  src={coverUrl || 'https://images.unsplash.com/photo-1514525253361-bee8d48800d5?auto=format&fit=crop&w=300&q=80'}
                  alt="Room Cover"
                  className="w-full h-full rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#00FF85] border-2 border-[#0F172A] flex items-center justify-center text-black">
                  <RadioIcon size={14} className="animate-pulse" />
                </div>
              </div>

              {/* Title: "Your Room is Now Live" (Clash Display, 24px bold) */}
              <h2 className="font-['Clash_Display',sans-serif] font-bold text-2xl text-white tracking-wide mt-2">
                Your Room is Now Live
              </h2>
            </div>

            {/* Primary Action Button (Frame 94: #8A2BE2 326px width x 56px height) */}
            <button
              type="button"
              onClick={handleEnterRoom}
              className="w-full h-[56px] bg-[#8A2BE2] hover:bg-[#7823c9] text-white font-bold text-base rounded-[8px] transition-all shadow-[0_0_25px_rgba(138,43,226,0.5)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles size={18} />
              <span>Enter Room</span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
