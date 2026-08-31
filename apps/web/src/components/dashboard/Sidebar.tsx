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
import { useLogout, usePrivy } from '@privy-io/react-auth';
import { useAccount, useDisconnect } from 'wagmi';

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
      flex items-center gap-3 px-6 py-3.5 cursor-pointer transition-all duration-200 font-['Space_Grotesk',sans-serif]
      ${active
        ? 'bg-[#8A2BE2]/10 border-r-4 border-[#8A2BE2] text-white font-bold'
        : 'text-[#CACACA] hover:text-white hover:bg-white/5 font-medium'
      }
    `}>
      <Icon size={20} className={active ? 'text-[#8A2BE2]' : 'text-[#CACACA]'} />
      <span className="text-sm tracking-wide">{label}</span>
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="ml-auto flex items-center justify-center h-5 w-5 rounded-full bg-[#8A2BE2] text-[10px] font-black text-white shadow-[0_0_10px_rgba(138,43,226,0.5)]">
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
  const [role, setRole] = React.useState<'creator' | 'fan'>(initialRole || 'fan');
  const { logout, authenticated, ready: privyReady, user } = usePrivy();
  const { isConnected: wagmiConnected, address: wagmiAddress } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();

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
      } else {
        setRole('fan');
      }
    }

    // Fetch user profile from backend to ensure role is 100% accurate
    const syncProfileRole = async () => {
      try {
        const res = await apiFetch('/api/users/me', { skipAuthRedirect: true });
        if (res && res.ok) {
          const data = await res.json();
          const backendRole = data.user?.role || data.data?.role || data.role;
          if (backendRole === 'fan' || backendRole === 'creator') {
            setRole(backendRole);
            localStorage.setItem('groovely_role', backendRole);
            localStorage.setItem('grooveli_role', backendRole);
          }
        }
      } catch (_) {}
    };

    if (activeToken || authenticated) {
      syncProfileRole();
    }
  }, [initialRole, authenticated, wagmiConnected]);

  useEffect(() => {
    if (!token) return;
    const fetchInvites = async () => {
      try {
        const res = await apiFetch('/api/creator/invitations', { skipAuthRedirect: true });
        if (res && res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data)) {
            setInviteCount(json.data.length);
          }
        }
      } catch (err) {
        console.error('Failed to fetch pending invites for sidebar badge:', err);
      }
    };
    fetchInvites();
  }, [token]);

  const isMarket = activePage === 'market' || pathname === '/marketplace' || pathname?.startsWith('/marketplace/');
  const isDashboard = !isMarket && (activePage === 'dashboard' || pathname === '/dashboard');

  const handleSignOut = async () => {
    try { await logout(); } catch (_) {}
    try { await wagmiDisconnect(); } catch (_) {}
    handleLogout();   // Clear app tokens and redirect to /login
  };

  const isPublicRoute = pathname?.startsWith('/marketplace') || pathname?.startsWith('/explore') || pathname?.includes('/login') || pathname?.includes('/onboarding') || pathname === '/';

  const isLoggedIn = Boolean(token || (privyReady && authenticated) || (wagmiConnected && !!wagmiAddress));

  useEffect(() => {
    if (mounted && !isLoggedIn && !isPublicRoute) {
      // If we're in the dashboard and there's no token/auth, redirect to login
      router.push('/login');
    }
  }, [pathname, router, isLoggedIn, isPublicRoute, mounted]);

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
  if (!isLoggedIn && isPublicRoute) {
    return null;
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#192134]">
      <div className="px-6 mb-8 flex items-center justify-between">
        <Link href="/" onClick={() => setIsMobileOpen(false)}>
          <Logo />
        </Link>
        {isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg bg-white/5 border border-[#2D3548]"
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
            <button className="w-full bg-[#8A2BE2] hover:bg-[#7823c9] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(138,43,226,0.3)] text-sm font-['Space_Grotesk',sans-serif] cursor-pointer">
              <Upload size={18} />
              <span>Upload &amp; Mint</span>
            </button>
          </Link>
        ) : (
          <button className="w-full bg-[#8A2BE2] hover:bg-[#7823c9] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(138,43,226,0.3)] text-sm font-['Space_Grotesk',sans-serif] cursor-pointer">
            <Plus size={18} />
            <span>Create Playlist</span>
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
        {role === 'creator' ? (
          <>
            <NavItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" active={isDashboard} />
            <NavItem icon={Library} label="My Library" href="/library" active={pathname === '/library' || pathname === '/dashboard/library'} />
            <NavItem icon={UserCheck} label="Split Invites" href="/dashboard/invitations" active={pathname === '/dashboard/invitations'} badgeCount={inviteCount} />
            <NavItem icon={Wallet} label="Earnings" href="/dashboard/earnings" active={pathname === '/dashboard/earnings'} />

            <div className="h-px bg-[#2D3548] my-4 mx-6" />

            <NavItem icon={Store} label="Grooveli Market" href="/marketplace" active={isMarket} />
            <NavItem icon={BarChart3} label="Analytics" href="/dashboard/analytics" active={pathname === '/dashboard/analytics'} />
            <NavItem icon={Headphones} label="Listening Rooms" href="/rooms" active={pathname === '/rooms' || pathname?.startsWith('/rooms/')} />
            <NavItem icon={Sparkles} label="AI Tools" comingSoon />

            <div className="h-px bg-[#2D3548] my-4 mx-6" />

            <NavItem icon={User} label="Profile" href="/dashboard/profile" active={pathname === '/dashboard/profile'} />
            <NavItem icon={FileText} label="Licenses" href="/dashboard/licenses" active={pathname === '/dashboard/licenses'} />
            <NavItem icon={MessageSquare} label="Community & Support" href="/dashboard/community" active={pathname === '/dashboard/community'} />
            <NavItem icon={Settings} label="Settings" href="/dashboard/settings" active={pathname === '/dashboard/settings'} />
          </>
        ) : (
          <>
            <NavItem icon={LayoutDashboard} label="Discover" href="/explore" active={activePage === 'explore' || pathname === '/explore'} />
            <NavItem icon={Library} label="My Library" href="/library" active={pathname === '/library' || pathname === '/dashboard/library'} />
            <NavItem icon={Store} label="Grooveli Market" href="/marketplace" active={isMarket} />
            <NavItem icon={Headphones} label="Listening Rooms" href="/rooms" active={pathname === '/rooms' || pathname?.startsWith('/rooms/')} />
          </>
        )}
      </nav>

      <div className="mt-auto px-4 pt-4 pb-2">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 bg-[#232B3E] hover:bg-[#2d374f] text-white font-bold py-3 rounded-xl border border-[#2D3548] transition-all text-xs sm:text-sm font-['Space_Grotesk',sans-serif] cursor-pointer"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
        <p className="text-[10px] text-zinc-500 text-center mt-3 uppercase font-bold tracking-widest font-['Space_Grotesk',sans-serif]">
          © Copyright 2025
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile, visible on lg screens) */}
      <aside className="hidden lg:flex w-64 h-screen sticky top-0 bg-[#192134] border-r border-[#2D3548] flex-col py-6 shrink-0 z-30">
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
          <div className="relative w-[280px] sm:w-[320px] max-w-[85vw] h-full bg-[#192134] border-r border-[#2D3548] py-6 z-10 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
