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
    <div className="flex h-screen overflow-hidden bg-[#192134] text-white font-sans selection:bg-accent-cyan selection:text-black">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#192134]">
        <TopBar displayName={displayName} />

        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 overflow-y-auto custom-scrollbar flex flex-col justify-between min-h-[calc(100vh-100px)]">
          <div>
            {/* Welcome Message (Hidden on mobile because it's in the mobile header, visible on desktop) */}
            <div className="hidden lg:block mb-8 translate-y-0 opacity-100 transition-all duration-500">
            <h1 className="font-['Clash_Display',sans-serif] text-3xl md:text-4xl font-bold tracking-tight text-white mb-1.5">
              Hello, {displayName}! 👋
            </h1>
            <p className="font-['Space_Grotesk',sans-serif] text-sm text-zinc-400 font-medium">
              Welcome back to your creator command center.
            </p>
          </div>

          {/* Stats Grid: Figma Frame 200 (1 Big Full-Width Streams + 2 Side-by-Side Earnings/Uploads on Mobile) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isLoadingStats ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
              </div>
            ) : (
              <>
                {/* Streams Card: Full width on mobile (col-span-full), 1 col on desktop */}
                <StatCard
                  icon={Radio}
                  label="Streams"
                  value={stats?.streams?.total || "0"}
                  change={stats?.streams?.change ? parseFloat(stats.streams.change) : null}
                  changeType={stats?.streams?.changeType}
                  className="col-span-2 lg:col-span-1"
                />

                {/* Earnings Card: Half width on mobile (col-span-1) */}
                <StatCard
                  icon={Wallet}
                  label="Earnings"
                  value={stats?.earnings?.total ? `$${parseFloat(stats.earnings.total).toFixed(2)}` : "$0.00"}
                  change={stats?.earnings?.change ? parseFloat(stats.earnings.change) : null}
                  changeType={stats?.earnings?.changeType}
                  className="col-span-1"
                />

                {/* Uploads Card: Half width on mobile (col-span-1) */}
                <StatCard
                  icon={UploadCloud}
                  label="Uploads"
                  value={stats?.uploads?.total || "0"}
                  change={stats?.uploads?.change ? parseFloat(stats.uploads.change) : null}
                  changeType={stats?.uploads?.changeType}
                  className="col-span-1"
                />

                {/* Listening Rooms Card: Desktop / 4th item */}
                <StatCard
                  icon={Headphones}
                  label="Listening Rooms"
                  value="0"
                  comingSoon
                  className="col-span-2 lg:col-span-1 hidden lg:flex"
                />
              </>
            )}
          </div>

          {/* Tracks and Active Room Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <TracksTable />
            <div className="lg:col-span-1">
              <ActiveRoomCard />
            </div>
          </div>

          {/* Promo Section */}
          <PromoCards />
          </div>

          {/* Footer (Figma Frame 310 & 309) */}
          <footer className="mt-auto pt-8 pb-20 sm:pb-8 border-t border-[#232B3E] flex flex-col md:flex-row justify-between items-center gap-6 text-[#CACACA]">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-[10px] font-['Space_Grotesk',sans-serif] text-center md:text-left">
              <div className="flex items-center gap-2">
                <a href="#" className="hover:text-white transition-colors">About Groovely</a>
                <span className="w-0.5 h-0.5 bg-[#CACACA] rounded-full" />
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <span className="w-0.5 h-0.5 bg-[#CACACA] rounded-full" />
                <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline w-0.5 h-0.5 bg-[#CACACA] rounded-full" />
                <a href="#" className="hover:text-white transition-colors">Docs/Developer API</a>
                <span className="w-0.5 h-0.5 bg-[#CACACA] rounded-full" />
                <a href="#" className="hover:text-white transition-colors text-accent-cyan">Feedback</a>
              </div>
            </div>

            <div className="flex items-center gap-6 text-[#CACACA]">
              <a href="#" className="hover:text-white transition-all transform hover:scale-110"><Twitter size={18} /></a>
              <a href="#" className="hover:text-white transition-all transform hover:scale-110"><Disc size={18} /></a>
              <a href="#" className="hover:text-white transition-all transform hover:scale-110"><Send size={18} /></a>
              <a href="#" className="hover:text-white transition-all transform hover:scale-110"><Instagram size={18} /></a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
