'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { StatCard } from '@/components/dashboard/StatCard';
import { TracksTable } from '@/components/dashboard/TracksTable';
import { ActiveRoomCard } from '@/components/dashboard/ActiveRoomCard';
import { PromoCards } from '@/components/dashboard/PromoCards';
import {
  Radio,
  Wallet,
  UploadCloud,
  Headphones,
  Send,
  Disc,
  Loader2
} from 'lucide-react';
import { Twitter, Instagram } from '@/components/ui/SocialIcons';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface DashboardStats {
  streams: {
    total: string;
    change: string | null;
    changeType: 'up' | 'down' | null;
  };
  earnings: {
    total: string;
    change: string | null;
    changeType: 'up' | 'down' | null;
  };
  uploads: {
    total: string;
    change: string | null;
    changeType: 'up' | 'down' | null;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [displayName, setDisplayName] = useState<string>('Creator');

  useEffect(() => {
    const token = localStorage.getItem('groovely_token') || localStorage.getItem('grooveli_token');
    console.log('[ROLE_DEBUG] Dashboard page check triggered.');
    console.log('[ROLE_DEBUG] Active Token in localStorage:', token ? `${token.substring(0, 20)}...` : 'NONE');

    if (!token) {
      console.warn('[ROLE_DEBUG] No active authentication token found. Redirecting to /login.');
      router.push('/login');
      return;
    }

    // Decode role directly from active JWT token first
    let role = '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('[ROLE_DEBUG] Decoded Token Payload:', payload);
      role = payload.role ?? '';
      if (role) {
        localStorage.setItem('groovely_role', role);
        localStorage.setItem('grooveli_role', role);
      }
    } catch (e) {
      console.error('[ROLE_DEBUG] Token parse error:', e);
    }

    if (!role) {
      role = localStorage.getItem('groovely_role') || localStorage.getItem('grooveli_role') || '';
      console.log('[ROLE_DEBUG] Fallback Role from localStorage:', role);
    }
    
    console.log(`[ROLE_DEBUG] Final Resolved Role: "${role}". Will redirect to /explore? ${role === 'fan'}`);

    if (role === 'fan') {
      console.warn('[ROLE_DEBUG] Redirecting user from /dashboard to /explore because role is "fan".');
      router.push('/explore');
      return;
    }

    async function fetchStats() {
      try {
        const res = await apiFetch('/api/creator/dashboard/stats');
        if (res && res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setStats(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setIsLoadingStats(false);
      }
    }

    async function fetchProfile() {
      try {
        const res = await apiFetch('/api/creator/profile');
        if (res && res.ok) {
          const data = await res.json();
          const profile = data.data ?? data;
          if (profile.display_name) {
            setDisplayName(profile.display_name);
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    }

    fetchStats();
    fetchProfile();
  }, [router]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#050510] text-white font-sans selection:bg-accent-cyan selection:text-black">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto custom-scrollbar">
          {/* Welcome Message */}
          <div className="mb-6 sm:mb-10 translate-y-0 opacity-100 transition-all duration-500">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white mb-1.5 sm:mb-2">Hello, {displayName}! 👋</h1>
            <p className="text-xs sm:text-sm md:text-base text-zinc-500 font-medium">Welcome back to your creator command center.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isLoadingStats ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
              </div>
            ) : (
              <>
                <StatCard
                  icon={Radio}
                  label="Streams"
                  value={stats?.streams?.total || "0"}
                  change={stats?.streams?.change ? parseFloat(stats.streams.change) : null}
                  changeType={stats?.streams?.changeType}
                />
                <StatCard
                  icon={Wallet}
                  label="Earnings"
                  value={stats?.earnings?.total ? `$${parseFloat(stats.earnings.total).toFixed(4)}` : "$0.00"}
                  change={stats?.earnings?.change ? parseFloat(stats.earnings.change) : null}
                  changeType={stats?.earnings?.changeType}
                />
                <StatCard
                  icon={UploadCloud}
                  label="Uploads"
                  value={stats?.uploads?.total || "0"}
                  change={stats?.uploads?.change ? parseFloat(stats.uploads.change) : null}
                  changeType={stats?.uploads?.changeType}
                />
                <StatCard
                  icon={Headphones}
                  label="Listening Rooms"
                  value="0"
                  comingSoon
                />
              </>
            )}
          </div>

          {/* Tracks and Active Room Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <TracksTable />
            <div className="lg:col-span-1 border-white/5">
              <ActiveRoomCard />
            </div>
          </div>

          {/* Promo Section */}
          <PromoCards />

          {/* Footer */}
          <footer className="mt-12 sm:mt-20 py-8 sm:py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-10 opacity-70 hover:opacity-100 transition-opacity">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 sm:gap-x-8 gap-y-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center md:text-left">
              <a href="#" className="hover:text-accent-purple transition-colors">About Groovely</a>
              <span className="w-1 h-1 bg-zinc-800 rounded-full" />
              <a href="#" className="hover:text-accent-purple transition-colors">Privacy Policy</a>
              <span className="w-1 h-1 bg-zinc-800 rounded-full" />
              <a href="#" className="hover:text-accent-purple transition-colors">Terms of Use</a>
              <span className="w-1 h-1 bg-zinc-800 rounded-full" />
              <a href="#" className="hover:text-accent-purple transition-colors">Docs/Developer API</a>
              <span className="w-1 h-1 bg-zinc-800 rounded-full" />
              <a href="#" className="hover:text-accent-purple transition-colors text-accent-cyan">Feedback</a>
            </div>

            <div className="flex items-center gap-6 sm:gap-8 text-zinc-500">
              <a href="#" className="hover:text-white transition-all transform hover:scale-110 active:scale-90"><Twitter size={18} /></a>
              <a href="#" className="hover:text-white transition-all transform hover:scale-110 active:scale-90"><Disc size={18} /></a>
              <a href="#" className="hover:text-white transition-all transform hover:scale-110 active:scale-90"><Send size={18} /></a>
              <a href="#" className="hover:text-white transition-all transform hover:scale-110 active:scale-90"><Instagram size={18} /></a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
