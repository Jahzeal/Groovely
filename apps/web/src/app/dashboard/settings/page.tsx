'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { apiFetch, API_BASE } from '@/lib/api';

const PRESET_CREATOR_TYPES = ['skit makers', 'podcasters', 'artists', 'producers'];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Profile');

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [creatorTypes, setCreatorTypes] = useState<string[]>([]);
  const [customTypeInput, setCustomTypeInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [soundcloud, setSoundcloud] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI state
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const abbrevWallet = walletAddress ? `${walletAddress.slice(0, 10)}...${walletAddress.slice(-8)}` : '—';

  // Load existing profile on mount
  useEffect(() => {
    setWalletAddress(localStorage.getItem('grooveli_wallet'));
    const userRole = localStorage.getItem('grooveli_role') || 'creator';
    setRole(userRole);
    
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('grooveli_token');
        if (!token) { setFetchError('Not authenticated'); setLoadingProfile(false); return; }

        const endpoint = userRole === 'fan' ? '/api/fan/profile' : '/api/creator/profile';
        const res = await apiFetch(endpoint);
        if (!res) return;
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || json.error || 'Failed to load profile');

        const p = json.data ?? json;
        setDisplayName(p.display_name ?? '');
        setUsername(p.username ?? '');
        setBio(p.bio ?? '');
        setCreatorTypes(p.creator_types ?? p.creator_type ?? []);
        setTwitter(p.twitter ?? '');
        setInstagram(p.instagram ?? '');
        setSoundcloud(p.soundcloud ?? '');
        setAvatarPreview(p.avatar_url ?? null);
        if (p.avatar_url) setAvatarPreview(p.avatar_url);
      } catch (err: any) {
        setFetchError(err.message || 'Could not load profile');
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const toggleCreatorType = (type: string) => {
    setCreatorTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const addCustomType = () => {
    const trimmed = customTypeInput.trim().toLowerCase();
    if (!trimmed || creatorTypes.includes(trimmed)) {
      setCustomTypeInput('');
      setShowCustomInput(false);
      return;
    }
    setCreatorTypes((prev) => [...prev, trimmed]);
    setCustomTypeInput('');
    setShowCustomInput(false);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // In a real scenario, you'd upload this to the server here or in handleSave
      toast.success('Photo selected!');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const token = localStorage.getItem('grooveli_token');
      if (!token) throw new Error('Not authenticated. Please log in.');

      const isFan = role === 'fan';
      const endpoint = isFan ? '/api/fan/profile' : '/api/creator/profile';
      const bodyPayload = isFan 
        ? { displayName, username }
        : {
            displayName,
            username,
            bio,
            creatorTypes,
            twitter: twitter || null,
            instagram: instagram || null,
            soundcloud: soundcloud || null,
          };

      const res = await apiFetch(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(bodyPayload),
      });

      if (!res) return;
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || json.error || 'Failed to save profile');

      toast.success('Profile updated successfully!');
    } catch (err: any) {
      const msg = err.message || 'Something went wrong';
      setSaveError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleGlobalSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('grooveli_token');
    localStorage.removeItem('grooveli_user_id');
    localStorage.removeItem('grooveli_wallet');
    localStorage.removeItem('grooveli_role');
    router.push('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#050510] text-white font-sans selection:bg-accent-cyan selection:text-black">
      <Sidebar activePage="settings" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center px-10 py-8 border-b border-white/5 bg-[#0A0A15]">
          <h1 className="text-2xl font-black tracking-tight text-white mr-10">Settings</h1>
          <div className="flex-1 max-w-md relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input 
              type="text" 
              placeholder="Search" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleGlobalSearch}
              className="w-full bg-[#0F0F1A] border border-white/5 rounded-xl py-3 px-12 text-sm focus:outline-none focus:border-accent-purple/30 transition-all text-white placeholder-zinc-600" 
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="Wallet" className="w-6 h-6 object-contain" />
            <span className="text-sm font-bold text-zinc-300 font-mono">{abbrevWallet}</span>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-10 mesh-gradient relative">
            <div className="max-w-2xl">

              {/* Profile Section */}
              <section className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-black tracking-tight text-white mb-8">Profile</h2>

                {fetchError && (
                  <div className="mb-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold">
                    <AlertCircle size={16} /> {fetchError}
                  </div>
                )}
                {saveError && (
                  <div className="mb-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold">
                    <AlertCircle size={16} /> {saveError}
                  </div>
                )}

                {loadingProfile ? (
                  <div className="flex items-center gap-3 py-12 text-zinc-500">
                    <Loader2 size={20} className="animate-spin text-accent-purple" />
                    <span className="text-sm font-bold uppercase tracking-widest">Loading profile…</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-6">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <img
                        src={avatarPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || 'creator'}`}
                        alt="Avatar"
                        className="w-20 h-20 rounded-full border-2 border-[#151525] shadow-lg object-cover bg-[#0F0F1A]"
                      />
                      <button 
                        onClick={handleFileClick}
                        className="bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-3 px-6 rounded-xl border border-white/5 transition-all"
                      >
                        Change Photo
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-white">Display Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-accent-purple/50 transition-all placeholder-white/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-white">Username</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">@</span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="username"
                          className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-accent-purple/50 transition-all placeholder-white/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-white">Creator Types</label>
                      <div className="flex flex-wrap gap-2">
                        {/* Preset types */}
                        {PRESET_CREATOR_TYPES.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => toggleCreatorType(type)}
                            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${
                              creatorTypes.includes(type)
                                ? 'bg-accent-purple text-white border-accent-purple shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                                : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            {type}
                          </button>
                        ))}

                        {/* Custom types added by user */}
                        {creatorTypes
                          .filter((t) => !PRESET_CREATOR_TYPES.includes(t))
                          .map((type) => (
                            <span
                              key={type}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-accent-purple text-white border border-accent-purple shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                            >
                              {type}
                              <button
                                type="button"
                                onClick={() => toggleCreatorType(type)}
                                className="ml-1 opacity-70 hover:opacity-100 transition-opacity text-white leading-none"
                              >
                                ✕
                              </button>
                            </span>
                          ))}

                        {/* Add More toggle */}
                        {!showCustomInput && (
                          <button
                            type="button"
                            onClick={() => setShowCustomInput(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-dashed border-white/20 text-zinc-500 hover:border-accent-purple/50 hover:text-accent-purple transition-all"
                          >
                            + Add More
                          </button>
                        )}
                      </div>

                      {/* Custom type input */}
                      {showCustomInput && (
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="text"
                            autoFocus
                            value={customTypeInput}
                            onChange={(e) => setCustomTypeInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') { e.preventDefault(); addCustomType(); }
                              if (e.key === 'Escape') { setShowCustomInput(false); setCustomTypeInput(''); }
                            }}
                            placeholder="e.g. beat maker"
                            className="flex-1 max-w-[200px] bg-[#0F0F1A] border border-accent-purple/40 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-accent-purple transition-all placeholder-zinc-600"
                          />
                          <button
                            type="button"
                            onClick={addCustomType}
                            className="px-4 py-2 rounded-xl bg-accent-purple text-white text-xs font-black uppercase tracking-widest hover:bg-opacity-90 transition-all"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => { setShowCustomInput(false); setCustomTypeInput(''); }}
                            className="px-3 py-2 rounded-xl bg-white/5 text-zinc-400 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-white">Bio</label>
                      <textarea
                        rows={5}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell the world what kind of sound you make"
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-accent-purple/50 transition-all placeholder-white/20 resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-white">Twitter / X</label>
                      <input type="text" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="@handle or full URL" className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-accent-purple/50 transition-all placeholder-white/20" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-white">Instagram</label>
                      <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@handle or full URL" className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-accent-purple/50 transition-all placeholder-white/20" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-white">SoundCloud</label>
                      <input type="text" value={soundcloud} onChange={(e) => setSoundcloud(e.target.value)} placeholder="@handle or full URL" className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-accent-purple/50 transition-all placeholder-white/20" />
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-accent-purple hover:bg-opacity-90 disabled:opacity-60 text-white text-xs font-bold py-3 px-8 rounded-xl shadow-[0_0_15px_rgba(157,0,255,0.3)] hover:scale-105 active:scale-95 transition-all"
                      >
                        {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Wallet Settings */}
              <section className="mb-16 border-t border-white/5 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-xl font-black tracking-tight text-white mb-6">Wallet Settings</h2>
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-12 h-12 object-contain" />
                    <div>
                      <h3 className="text-base font-black text-white">Connected Wallet</h3>
                      <p className="text-xs font-medium text-zinc-400 font-mono mt-1">{walletAddress ?? '—'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white block">Network</label>
                    <div className="flex items-center gap-2 text-[#8247E5] font-black tracking-tight text-lg">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path d="M16.3 9.4l-3.8 2.2-3.8-2.2V5l3.8-2.2 3.8 2.2zM21 12l-3.8 2.2v4.4L21 16.4zM12.5 21.6l-3.8-2.2v-4.4l3.8 2.2zm-5.7-9.8L3 9.6v4.4l3.8 2.2zm4.7 0l3.8-2.2v4.4l-3.8 2.2z" />
                      </svg>
                      Polygon
                    </div>
                  </div>
                  <button onClick={handleDisconnect} className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-3 px-8 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all">
                    Disconnect Wallet
                  </button>
                </div>
              </section>

              {/* Notification Preference */}
              <section className="border-t border-white/5 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <h2 className="text-xl font-black tracking-tight text-white mb-6">Notification Preference</h2>
                <div className="space-y-6">
                  {[
                    { label: 'Receive notifications for new followers', defaultChecked: true },
                    { label: 'Receive notifications for purchases/sales', defaultChecked: true },
                    { label: 'Email Notifications', defaultChecked: true },
                    { label: 'Push Notifications', defaultChecked: false },
                  ].map((pref, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-300">{pref.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={pref.defaultChecked} />
                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-purple"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </section>

              <footer className="mt-20 pt-10 border-t border-white/5 flex flex-wrap items-center gap-x-6 gap-y-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <a href="#" className="hover:text-white transition-colors">About Grooveli</a>
                <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
                <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                <a href="#" className="hover:text-white transition-colors">Docs/Developer API</a>
                <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                <a href="#" className="hover:text-white transition-colors">Feedback</a>
              </footer>
            </div>
          </main>

          {/* Secondary Sidebar */}
          <aside className="w-64 bg-[#0A0A15] border-l border-white/5 p-6 hidden lg:flex flex-col">
            <nav className="space-y-1">
              {['Profile', 'Wallet', 'Notifications'].map((item) => (
                <div
                  key={item}
                  onClick={() => setActiveTab(item)}
                  className={`px-4 py-3 text-xs font-bold rounded-lg cursor-pointer transition-colors ${activeTab === item ? 'bg-white/5 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/[0.02]'}`}
                >
                  {item}
                </div>
              ))}
            </nav>
          </aside>
        </div>
      </div>
    </div>
  );
}
