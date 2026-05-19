'use client';

import React, { useState, useEffect } from 'react';
import { use } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MarketTopBar } from '@/components/marketplace/MarketTopBar';
import { TrackCard } from '@/components/marketplace/TrackCard';
import { MusicPlayer } from '@/components/marketplace/MusicPlayer';
import { 
  Users, 
  Headphones, 
  Radio, 
  Loader2, 
  Share2, 
  ExternalLink
} from 'lucide-react';
import { Twitter, Instagram } from '@/components/ui/SocialIcons';
import { apiFetch } from '@/lib/api';
import { CartProvider } from '@/components/marketplace/CartContext';

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await apiFetch(`/api/profile/${username}`);
        if (res && res.ok) {
          const json = await res.json();
          if (json.success) {
            setProfile(json.data);
          } else {
            setError(json.message || 'Profile not found');
          }
        } else {
          setError('Failed to load profile');
        }
      } catch (err) {
        console.error('Fetch profile error:', err);
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent-purple animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-black mb-4">Oops! {error || 'Profile not found'}</h1>
        <a href="/marketplace" className="text-accent-purple font-bold hover:underline">Back to Marketplace</a>
      </div>
    );
  }

  const avatarSrc = profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`;

  return (
    <CartProvider>
      <div className="flex min-h-screen bg-[#050510] text-white font-sans selection:bg-accent-cyan selection:text-black">
        <Sidebar activePage="market" />

        <div className="flex-1 flex flex-col min-w-0">
          <MarketTopBar />

          <main className="flex-1 overflow-y-auto pb-32 mesh-gradient">
            {/* Profile Header */}
            <div className="px-10 py-12 border-b border-white/5 bg-black/20 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                  <div className="w-40 h-40 rounded-full border-4 border-white/5 overflow-hidden shadow-2xl shrink-0">
                    <img src={avatarSrc} alt={profile.display_name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="space-y-1">
                      <h1 className="text-5xl font-black tracking-tight">{profile.display_name}</h1>
                      <p className="text-zinc-500 font-bold text-lg">@{profile.username}</p>
                    </div>

                    {profile.creator_type && profile.creator_type.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {profile.creator_type.map((type: string) => (
                          <span key={type} className="px-4 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-xs font-black uppercase tracking-widest">
                            {type}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-zinc-400 max-w-2xl leading-relaxed">
                      {profile.bio || 'This creator hasn\'t added a bio yet.'}
                    </p>

                    <div className="flex items-center gap-6 pt-4">
                      <div className="flex items-center gap-2">
                        <Radio size={18} className="text-accent-purple" />
                        <span className="text-sm font-black">{profile.stats?.all_time_plays?.toLocaleString() || 0}</span>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Plays</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={18} className="text-accent-purple" />
                        <span className="text-sm font-black">{profile.stats?.followers?.toLocaleString() || 0}</span>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Followers</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 shrink-0">
                    <button className="bg-accent-purple hover:bg-opacity-90 text-white font-black py-4 px-10 rounded-xl transition-all shadow-[0_0_30px_rgba(157,0,255,0.3)] hover:scale-105 active:scale-95 text-sm uppercase tracking-widest">
                      Follow Creator
                    </button>
                    <div className="flex items-center justify-center gap-4">
                      {profile.twitter && <Twitter size={18} className="text-zinc-500 hover:text-white cursor-pointer" />}
                      {profile.instagram && <Instagram size={18} className="text-zinc-500 hover:text-white cursor-pointer" />}
                      <Share2 size={18} className="text-zinc-500 hover:text-white cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracks Section */}
            <div className="px-10 py-12">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-black uppercase tracking-widest text-white">Released Tracks</h2>
                </div>

                {/* This would normally fetch tracks for this user, but for now we'll show a placeholder or empty state if no tracks linked */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {/* We can fetch tracks for this creator here in a real scenario */}
                  <div className="col-span-full py-20 bg-white/5 border border-white/5 border-dashed rounded-3xl flex flex-col items-center justify-center text-center">
                    <Headphones size={40} className="text-zinc-800 mb-4" />
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Tracks coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        <MusicPlayer />
      </div>
    </CartProvider>
  );
}
