'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '../ui/Logo';
import {
  LayoutDashboard,
  Library,
  Wallet,
  Store,
  BarChart3,
  Sparkles,
  Headphones,
  User,
  FileText,
  MessageSquare,
  LogOut,
  Upload,
  Settings,
  Plus,
  UserCheck
} from 'lucide-react';
import { handleLogout, apiFetch } from '@/lib/api';
import { useLogout } from '@privy-io/react-auth';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href?: string;
  active?: boolean;
  comingSoon?: boolean;
  badgeCount?: number;
}

const NavItem = ({ icon: Icon, label, href, active, comingSoon, badgeCount }: NavItemProps) => {
  const inner = (
    <div className={`
      flex items-center gap-3 px-6 py-3.5 cursor-pointer transition-all duration-300
      ${active
        ? 'bg-accent-purple/10 border-r-4 border-accent-purple text-white font-bold'
        : 'text-zinc-500 hover:text-white hover:bg-white/5'
      }
    `}>
      <Icon size={20} className={active ? 'text-accent-purple' : ''} />
      <span className="text-sm tracking-wide">{label}</span>
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="ml-auto flex items-center justify-center h-5 w-5 rounded-full bg-accent-purple text-[10px] font-black text-white shadow-[0_0_10px_rgba(157,0,255,0.4)]">
          {badgeCount}
        </span>
      )}
      {comingSoon && (
        <span className="ml-auto text-[8px] font-black uppercase bg-[#00FF85] text-black px-1.5 py-0.5 rounded-sm">
          Coming soon
        </span>
      )}
    </div>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
};

interface SidebarProps {
  activePage?: 'dashboard' | 'market' | 'library' | 'earnings' | 'analytics' | 'explore' | string;
  role?: 'creator' | 'fan';
}

export const Sidebar = ({ activePage, role: initialRole }: SidebarProps = {}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = React.useState<string | null>(null);
  const [role, setRole] = React.useState<'creator' | 'fan'>(initialRole || 'creator');
  const { logout } = useLogout();

  const [inviteCount, setInviteCount] = useState(0);

  React.useEffect(() => {
    setMounted(true);
    setToken(localStorage.getItem('grooveli_token'));

    if (initialRole) {
      setRole(initialRole);
    } else {
      const storedRole = localStorage.getItem('grooveli_role');
      if (storedRole === 'fan' || storedRole === 'creator') {
        setRole(storedRole);
      }
    }
  }, [initialRole]);

  useEffect(() => {
    if (!mounted || !token || role !== 'creator') return;
    const fetchInvites = async () => {
      try {
        const res = await apiFetch('/api/creator/invitations');
        if (res && res.ok) {
          const json = await res.json();
          const invites = json.data || [];
          setInviteCount(invites.length);
        }
      } catch (err) {
        console.error('Failed to fetch invitations count:', err);
      }
    };
    fetchInvites();
    const interval = setInterval(fetchInvites, 30000);
    return () => clearInterval(interval);
  }, [mounted, token, role]);

  const isMarket = activePage === 'market' || pathname?.startsWith('/marketplace');
  const isDashboard = !isMarket && (activePage === 'dashboard' || pathname === '/dashboard');

  const handleSignOut = async () => {
    await logout();   // Clear Privy session so wallet doesn't auto-reconnect
    handleLogout();   // Clear app tokens and redirect to /login
  };

  const isPublicRoute = pathname?.startsWith('/marketplace') || pathname?.startsWith('/explore') || pathname?.includes('/login') || pathname?.includes('/onboarding') || pathname === '/';

  useEffect(() => {
    if (mounted && !token && !isPublicRoute) {
      // If we're in the dashboard and there's no token, redirect to login
      router.push('/login');
    }
  }, [pathname, router, token, isPublicRoute, mounted]);

  if (!mounted) return null;
  if (!token && isPublicRoute) {
    return null;
  }

  return (
    <aside className="w-64 h-screen sticky top-0 bg-[#0F0F1A] border-r border-white/5 flex flex-col py-8 shrink-0">
      <div className="px-8 mb-10">
        <Link href="/">
          <Logo />
        </Link>
      </div>

      <div className="px-4 mb-8">
        {role === 'creator' ? (
          <Link href="/dashboard/upload" className="w-full">
            <button className="w-full bg-accent-purple hover:bg-opacity-90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(157,0,255,0.2)]">
              <Upload size={18} />
              <span>Upload &amp; Mint</span>
            </button>
          </Link>
        ) : (
          <button className="w-full bg-accent-purple hover:bg-opacity-90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(157,0,255,0.2)]">
            <Plus size={18} />
            <span>Create Playlist</span>
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
        {role === 'creator' ? (
          <>
            <NavItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" active={isDashboard} />
            <NavItem icon={Library} label="My Library" href="/library" active={pathname === '/library'} />
            <NavItem icon={UserCheck} label="Split Invites" href="/dashboard/invitations" active={pathname === '/dashboard/invitations'} badgeCount={inviteCount} />
            <NavItem icon={Wallet} label="Earnings" href="/dashboard/earnings" active={pathname === '/dashboard/earnings'} />

            <div className="h-px bg-white/5 my-6 mx-6" />

            <NavItem icon={Store} label="Grooveli Market" href="/marketplace" active={isMarket} />
            <NavItem icon={BarChart3} label="Analytics" href="/dashboard/analytics" active={pathname === '/dashboard/analytics'} />
            <NavItem icon={Sparkles} label="AI Tools" comingSoon />
            <NavItem icon={Headphones} label="Listening Rooms" comingSoon />

            <div className="h-px bg-white/5 my-6 mx-6" />

            <NavItem icon={User} label="Profile" href="/dashboard/profile" active={pathname === '/dashboard/profile'} />
            <NavItem icon={FileText} label="Licenses" href="/dashboard/licenses" active={pathname === '/dashboard/licenses'} />
            <NavItem icon={MessageSquare} label="Community & Support" href="/dashboard/community" active={pathname === '/dashboard/community'} />
            <NavItem icon={Settings} label="Settings" href="/dashboard/settings" active={pathname === '/dashboard/settings'} />
          </>
        ) : (
          <>
            <NavItem icon={LayoutDashboard} label="Discover" href="/explore" active={activePage === 'explore' || pathname === '/explore'} />
            <NavItem icon={Library} label="My Library" href="/library" active={pathname === '/library'} />
            <NavItem icon={Store} label="Grooveli Market" href="/marketplace" active={isMarket} />
          </>
        )}
      </nav>

      <div className="mt-auto px-4 pb-4">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl border border-white/5 transition-all"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
        <p className="text-[10px] text-zinc-700 text-center mt-6 uppercase font-black tracking-widest">
          © Copyright 2025
        </p>
      </div>
    </aside>
  );
};
