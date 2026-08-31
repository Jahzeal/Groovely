'use client';

import React, { useState } from 'react';
import { X, ArrowLeft, Upload, Music, Sparkles, Lock, Globe, Mic, Users, DollarSign, Calendar, Clock, Plus, Trash2, Check, Radio } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated?: (roomData: any) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose, onRoomCreated }) => {
  const [loading, setLoading] = useState(false);
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
  const [startTimeType, setStartTimeType] = useState<'now' | 'scheduled'>('now');
  const [scheduledDate, setScheduledDate] = useState('');

  if (!isOpen) return null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a room title');
      return;
    }

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
      toast.success(startTimeType === 'scheduled' ? 'Room scheduled successfully!' : 'Listening Room is now LIVE!');
      
      if (onRoomCreated) onRoomCreated(data);
      onClose();
    } catch (err: any) {
      console.error('Room creation error:', err);
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const genres = ['Afrobeat', 'Hip Hop', 'Amapiano', 'R&B', 'Lo-Fi / Chill', 'Dancehall', 'Pop', 'Podcast / Discussion', 'Studio Session'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Container matching Figma Spec (width ~900px, max height scrollable) */}
      <div className="relative w-full max-w-[880px] max-h-[92vh] bg-[#0F172A] border border-[#232B3E] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col font-['Space_Grotesk',sans-serif] text-white">
        
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
          
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
                  placeholder="Tell listeners what this room is about, what stems you're breaking down, or guest announcements..."
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
            <div className="bg-[#192134] p-4 rounded-xl border border-[#2D3548] space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Invite Co-Hosts (Creators)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="@username or handle"
                  value={coHostInput}
                  onChange={(e) => setCoHostInput(e.target.value)}
                  className="flex-1 bg-[#0F172A] border border-[#2D3548] rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCoHost}
                  className="px-3 py-2 bg-[#8A2BE2] hover:bg-[#7823c9] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </div>

              {coHosts.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {coHosts.map(handle => (
                    <span key={handle} className="inline-flex items-center gap-1 bg-[#8A2BE2]/20 border border-[#8A2BE2]/40 text-accent-purple px-2.5 py-1 rounded-full text-xs font-bold">
                      @{handle}
                      <button type="button" onClick={() => handleRemoveCoHost(handle)} className="hover:text-white">
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
              disabled={loading}
              className="px-8 py-3.5 bg-[#8A2BE2] hover:bg-[#7823c9] text-white font-bold text-base rounded-xl transition-all shadow-[0_0_25px_rgba(138,43,226,0.5)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles size={18} />
              <span>{loading ? 'Creating...' : (startTimeType === 'scheduled' ? 'Schedule Room' : 'Start Room Now')}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
