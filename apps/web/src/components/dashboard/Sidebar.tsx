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
    const activeToken = localStorage.getItem('grooveli_token') || localStorage.getItem('groovely_token');
    setToken(activeToken);

    if (initialRole) {
      setRole(initialRole);
    } else {
      let storedRole = localStorage.getItem('grooveli_role') || localStorage.getItem('groovely_role');
      if (!storedRole && activeToken) {
        try {
          const payload = JSON.parse(atob(activeToken.split('.')[1]));
          storedRole = payload.role;
        } catch {}
      }
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

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsMobileOpen(prev => !prev);
    const handleClose = () => setIsMobileOpen(false);
    window.addEventListener('toggle_mobile_sidebar', handleToggle);
    window.addEventListener('close_mobile_sidebar', handleClose);
    return () => {
      window.removeEventListener('toggle_mobile_sidebar', handleToggle);
      window.removeEventListener('close_mobile_sidebar', handleClose);
    };
  }, []);

  // Close mobile drawer on route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  if (!mounted) return null;
  if (!token && isPublicRoute) {
    return null;
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-6 mb-8 flex items-center justify-between">
        <Link href="/" onClick={() => setIsMobileOpen(false)}>
          <Logo />
        </Link>
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg bg-white/5 border border-white/10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="6" />
            </svg>
          </button>
        )}
      </div>

      <div className="px-4 mb-6">
        {role === 'creator' ? (
          <Link href="/dashboard/upload" className="w-full" onClick={() => setIsMobileOpen(false)}>
            <button className="w-full bg-accent-purple hover:bg-opacity-90 text-white font-bold py-3.5 sm:py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(157,0,255,0.2)] text-sm sm:text-base">
              <Upload size={18} />
              <span>Upload &amp; Mint</span>
            </button>
          </Link>
        ) : (
          <button className="w-full bg-accent-purple hover:bg-opacity-90 text-white font-bold py-3.5 sm:py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(157,0,255,0.2)] text-sm sm:text-base">
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

            <div className="h-px bg-white/5 my-4 mx-6" />

            <NavItem icon={Store} label="Grooveli Market" href="/marketplace" active={isMarket} />
            <NavItem icon={BarChart3} label="Analytics" href="/dashboard/analytics" active={pathname === '/dashboard/analytics'} />
            <NavItem icon={Sparkles} label="AI Tools" comingSoon />
            <NavItem icon={Headphones} label="Listening Rooms" comingSoon />

            <div className="h-px bg-white/5 my-4 mx-6" />

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

      <div className="mt-auto px-4 pt-4 pb-2">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 rounded-xl border border-white/5 transition-all text-sm"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
        <p className="text-[10px] text-zinc-700 text-center mt-4 uppercase font-black tracking-widest">
          © Copyright 2025
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile, visible on lg screens) */}
      <aside className="hidden lg:flex w-64 h-screen sticky top-0 bg-[#0F0F1A] border-r border-white/5 flex-col py-8 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (visible when isMobileOpen is true) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-[280px] sm:w-[320px] max-w-[85vw] h-full bg-[#0F0F1A] border-r border-white/10 py-6 z-10 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
