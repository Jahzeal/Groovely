'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Plus
} from 'lucide-react';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href?: string;
  active?: boolean;
  comingSoon?: boolean;
}

const NavItem = ({ icon: Icon, label, href, active, comingSoon }: NavItemProps) => {
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

export const Sidebar = ({ activePage, role = 'creator' }: SidebarProps = {}) => {
  const pathname = usePathname();
  const isMarket = activePage === 'market' || pathname?.startsWith('/dashboard/marketplace');
  const isDashboard = !isMarket && (activePage === 'dashboard' || pathname === '/dashboard');

  return (
    <aside className="w-64 min-h-screen bg-[#0F0F1A] border-r border-white/5 flex flex-col py-8 shrink-0">
      <div className="px-8 mb-10">
        <Logo />
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

      <nav className="flex-1 space-y-1">
        {role === 'creator' ? (
          <>
            <NavItem icon={LayoutDashboard} label="Dashboard"        href="/dashboard"              active={isDashboard} />
            <NavItem icon={Library}        label="My Library"        href="/dashboard/library"      active={pathname === '/dashboard/library'} />
            <NavItem icon={Wallet}         label="Earnings"          href="/dashboard/earnings"     active={pathname === '/dashboard/earnings'} />

            <div className="h-px bg-white/5 my-6 mx-6" />

            <NavItem icon={Store}          label="Groovely Market"   href="/dashboard/marketplace"  active={isMarket} />
            <NavItem icon={BarChart3}      label="Analytics"         href="/dashboard/analytics"    active={pathname === '/dashboard/analytics'} />
            <NavItem icon={Sparkles}       label="AI Tools"          comingSoon />
            <NavItem icon={Headphones}     label="Listening Rooms"   href="/dashboard/rooms" />

            <div className="h-px bg-white/5 my-6 mx-6" />

            <NavItem icon={User}           label="Profile"           href="/dashboard/profile"      active={pathname === '/dashboard/profile'} />
            <NavItem icon={FileText}       label="Licenses"          href="/dashboard/licenses" />
            <NavItem icon={MessageSquare}  label="Community &amp; Support" href="/dashboard/community" />
            <NavItem icon={Settings}       label="Settings"          href="/dashboard/settings"     active={pathname === '/dashboard/settings'} />
          </>
        ) : (
          <>
            <NavItem icon={LayoutDashboard} label="Discover"         href="/dashboard/explore"      active={activePage === 'explore' || pathname === '/dashboard/explore'} />
            <NavItem icon={Library}         label="My Library"       href="/dashboard/library"      active={pathname === '/dashboard/library'} />
            <NavItem icon={Store}           label="Groovely Market"  href="/dashboard/marketplace"  active={isMarket} />
          </>
        )}
      </nav>

      <div className="mt-auto px-4 pb-4">
        <button className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl border border-white/5 transition-all">
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
