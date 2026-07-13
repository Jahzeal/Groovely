'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import {
  Radio,
  Users,
  Headphones,
  Globe,
  Music,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

import { apiFetch, API_BASE } from '@/lib/api';

interface CreatorProfile {
  id: number;
  user_id: number;
  display_name: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  creator_type: string[];
  twitter: string | null;
  instagram: string | null;
  soundcloud: string | null;
  stats?: {
    all_time_plays: number;
    followers: number;
    monthly_listeners: number;
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('groovely_token');
        const userRole = localStorage.getItem('groovely_role') || 'creator';
        setRole(userRole);

        if (!token) {
          setError('Not authenticated. Please log in.');
          setLoading(false);
          return;
        }

        const endpoint = userRole === 'fan' ? '/api/fan/profile' : '/api/creator/profile';
        const res = await apiFetch(endpoint);
        if (!res) return; // handleLogout already called

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message || json.error || 'Failed to load profile');
        }

        setProfile(json.data ?? json);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const avatarSrc =
    profile?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username ?? 'creator'}`;

  return (
    <div className="flex h-screen overflow-hidden bg-[#050510] text-white font-sans selection:bg-accent-cyan selection:text-black">
      <Sidebar activePage="profile" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />

        <main className="flex-1 p-10 overflow-y-auto mesh-gradient">
          <div className="max-w-6xl mx-auto space-y-12 pb-20">

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 size={40} className="text-accent-purple animate-spin" />
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading profile…</p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-40 gap-4">
                <AlertCircle size={40} className="text-red-500" />
                <p className="text-red-400 font-bold text-sm">{error}</p>
                <Link href="/login" className="text-accent-purple text-xs font-black uppercase tracking-widest hover:underline">
                  Go to Login
                </Link>
              </div>
            )}

            {/* No Profile Yet */}
            {!loading && !error && !profile && (
              <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Music size={40} className="text-zinc-700" />
                <p className="text-zinc-500 font-bold text-sm">No creator profile found.</p>
                <Link href="/onboarding" className="text-accent-purple text-xs font-black uppercase tracking-widest hover:underline">
                  Create your profile
                </Link>
              </div>
            )}

            {/* Profile Content */}
            {!loading && !error && profile && (
              <>
                {/* Header Section */}
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-32 rounded-full border-[4px] border-[#0A0A15] shadow-2xl overflow-hidden shrink-0">
                      <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-black tracking-tight text-white">
                          {profile.display_name || (role === 'fan' ? 'Unnamed User' : 'Unnamed Creator')}
                        </h1>
                        <span className="text-zinc-500 font-bold text-sm">@{profile.username}</span>
                      </div>
                      {role === 'fan' ? (
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-block bg-[#00FF85]/10 border border-[#00FF85]/20 px-4 py-1.5 rounded-full text-xs font-bold text-[#00FF85] uppercase tracking-wider">
                            Fan / Listener
                          </span>
                        </div>
                      ) : (
                        profile.creator_type && profile.creator_type.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {profile.creator_type.map((type: string) => (
                              <span
                                key={type}
                                className="inline-block bg-accent-purple/10 border border-accent-purple/20 px-4 py-1.5 rounded-full text-xs font-bold text-accent-purple capitalize"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  <Link href="/dashboard/settings">
                    <button className="bg-accent-purple hover:bg-opacity-90 text-white font-black py-4 px-8 rounded-xl transition-all shadow-[0_0_30px_rgba(157,0,255,0.3)] hover:scale-105 active:scale-95 text-sm uppercase tracking-widest shrink-0">
                      Edit Profile
                    </button>
                  </Link>
                </div>

                {/* About Section */}
                {profile.bio && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <h3 className="text-xl font-black uppercase tracking-widest text-white">About</h3>
                    <p className="text-zinc-400 font-medium leading-relaxed max-w-4xl text-sm">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* Socials Section */}
                {(profile.twitter || profile.instagram || profile.soundcloud) && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                    <h3 className="text-xl font-black uppercase tracking-widest text-white">Socials</h3>
                    <div className="flex flex-wrap items-center gap-4">
                      {profile.twitter && (
                        <a
                          href={profile.twitter.startsWith('http') ? profile.twitter : `https://twitter.com/${profile.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-5 h-12 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 rounded-xl text-zinc-400 hover:text-white transition-all font-bold text-xs tracking-widest uppercase"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 4.09H5.078z" />
                          </svg>
                          {profile.twitter.replace(/^@/, '')}
                        </a>
                      )}
                      {profile.instagram && (
                        <a
                          href={profile.instagram.startsWith('http') ? profile.instagram : `https://instagram.com/${profile.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-5 h-12 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 rounded-xl text-zinc-400 hover:text-white transition-all font-bold text-xs tracking-widest uppercase"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                          </svg>
                          {profile.instagram.replace(/^@/, '')}
                        </a>
                      )}
                      {profile.soundcloud && (
                        <a
                          href={profile.soundcloud.startsWith('http') ? profile.soundcloud : `https://soundcloud.com/${profile.soundcloud}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-5 h-12 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 rounded-xl text-zinc-400 hover:text-white transition-all font-bold text-xs tracking-widest uppercase"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path d="M1.175 12.225c-.017 0-.034.002-.05.003C.484 12.32 0 12.88 0 13.549c0 .67.484 1.228 1.125 1.32.016.002.033.003.05.003h.35v-2.647h-.35zm2.025-.1c-.033 0-.066.003-.099.007C2.35 12.26 1.9 12.82 1.9 13.5c0 .68.45 1.24 1.2 1.367.033.004.066.007.1.007h.35v-2.75h-.35zm16.3.867c0 1.29-1.028 2.333-2.3 2.333-1.27 0-2.3-1.044-2.3-2.333s1.03-2.333 2.3-2.333c.53 0 1.015.185 1.397.49l-.028-.022V6.75c.3-.107.615-.167.93-.167C21.07 6.583 22 7.527 22 8.667c0 .593-.235 1.129-.617 1.52A3.9 3.9 0 0 1 22 12c0 .543-.11 1.06-.307 1.527A3.9 3.9 0 0 1 22 14.75c0 1.017-.768 1.846-1.75 1.95V16.7c-.2.033-.404.05-.61.05-1.658 0-3.023-1.09-3.41-2.576A3.437 3.437 0 0 1 15 13.992c0-.512.11-1 .307-1.44A3.44 3.44 0 0 1 15 11c0-.55.128-1.071.353-1.533-.52-.49-.866-1.166-.933-1.917H14c-.48 0-.924.126-1.303.347l.003-.002V6.75c-.3-.107-.615-.167-.93-.167-1.37 0-2.52.968-2.77 2.25H8.65c-.8 0-1.45.665-1.45 1.484 0 .82.65 1.483 1.45 1.483h.35V9.333h.35c.8 0 1.45.664 1.45 1.484 0 .82-.65 1.483-1.45 1.483H8.65c-.8 0-1.45.664-1.45 1.483s.65 1.484 1.45 1.484h1.4c0 .82.65 1.483 1.45 1.483h.35V14.3h-.35c-.8 0-1.45-.664-1.45-1.483v-1.484c0-.82.65-1.483 1.45-1.483h.35V8.1c0-.82.65-1.483 1.45-1.483h1.05c.267-1.58 1.617-2.784 3.25-2.784.8 0 1.533.278 2.1.735C19.17 4.96 20.033 4.583 21 4.583c1.933 0 3.5 1.597 3.5 3.567 0 .663-.178 1.283-.49 1.817A3.585 3.585 0 0 1 24.5 13c0 1.98-1.567 3.583-3.5 3.583a3.43 3.43 0 0 1-1.5-.343v.01z" />
                          </svg>
                          {profile.soundcloud.replace(/^@/, '')}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                  {[
                    { icon: Radio, label: 'All-Time Plays', value: profile.stats?.all_time_plays?.toLocaleString() ?? '0' },
                    { icon: Users, label: 'Followers', value: profile.stats?.followers?.toLocaleString() ?? '0' },
                    { icon: Headphones, label: 'Monthly Listeners', value: profile.stats?.monthly_listeners?.toLocaleString() ?? '0' },
                  ].map((stat, i) => (
                    <div key={i} className="glass-card p-8 flex flex-col gap-6 relative overflow-hidden group hover:border-accent-purple/30 transition-all duration-500">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <stat.icon size={100} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 bg-[#0F0F1A] border border-white/10 rounded-xl flex items-center justify-center">
                          <stat.icon className="text-zinc-500 group-hover:text-accent-purple transition-colors" size={24} />
                        </div>
                        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center cursor-help">
                          <span className="text-[10px] font-bold text-zinc-500">i</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{stat.label}</p>
                        <p className="text-5xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
