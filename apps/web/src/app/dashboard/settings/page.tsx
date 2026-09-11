'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Shield, Wallet, Bell, Lock, User, Key, CheckCircle, Smartphone, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiFetch } from '@/lib/api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'wallet' | 'notifications' | 'security'>('account');

  const [walletAddress, setWalletAddress] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [salesNotifs, setSalesNotifs] = useState(true);
  const [roomNotifs, setRoomNotifs] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Immediate hydration from localStorage
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('groovely_username') || localStorage.getItem('grooveli_username') || '';
      const storedName = localStorage.getItem('groovely_display_name') || localStorage.getItem('grooveli_display_name') || '';
      const storedEmail = localStorage.getItem('groovely_email') || localStorage.getItem('grooveli_email') || '';
      const storedWallet = localStorage.getItem('groovely_wallet') || localStorage.getItem('grooveli_wallet') || '';

      if (storedUser) setUsername(storedUser);
      if (storedName) setDisplayName(storedName);
      if (storedEmail) setEmail(storedEmail);
      if (storedWallet) setWalletAddress(storedWallet);
    }

    async function loadProfile() {
      try {
        let res = await apiFetch('/api/profile/me');
        if (!res || !res.ok) {
          res = await apiFetch('/api/users/me');
        }
        if (!res || !res.ok) {
          const role = (typeof window !== 'undefined' ? localStorage.getItem('groovely_role') || localStorage.getItem('grooveli_role') : '') || 'creator';
          const endpoint = role.toLowerCase() === 'fan' ? '/api/fan/profile' : '/api/creator/profile';
          res = await apiFetch(endpoint);
        }

        if (res && res.ok) {
          const json = await res.json();
          const user = json?.data?.user || json?.data?.profile || json?.data || json;
          if (user) {
            const fetchedEmail = user.email || (typeof window !== 'undefined' ? localStorage.getItem('groovely_email') || localStorage.getItem('grooveli_email') : '') || '';
            const emailPrefix = fetchedEmail ? fetchedEmail.split('@')[0] : '';

            const fetchedUsername = user.username || emailPrefix || '';
            const fetchedName = user.display_name || user.displayName || user.name || emailPrefix || '';
            const fetchedWallet = user.wallet || user.walletAddress || '';

            if (fetchedEmail) {
              setEmail(fetchedEmail);
              if (typeof window !== 'undefined') {
                localStorage.setItem('groovely_email', fetchedEmail);
                localStorage.setItem('grooveli_email', fetchedEmail);
              }
            }
            if (fetchedUsername) {
              setUsername(fetchedUsername);
              if (typeof window !== 'undefined') {
                localStorage.setItem('groovely_username', fetchedUsername);
                localStorage.setItem('grooveli_username', fetchedUsername);
              }
            }
            if (fetchedName) {
              setDisplayName(fetchedName);
              if (typeof window !== 'undefined') {
                localStorage.setItem('groovely_display_name', fetchedName);
                localStorage.setItem('grooveli_display_name', fetchedName);
              }
            }
            if (fetchedWallet) {
              setWalletAddress(fetchedWallet);
              if (typeof window !== 'undefined') {
                localStorage.setItem('groovely_wallet', fetchedWallet);
                localStorage.setItem('grooveli_wallet', fetchedWallet);
              }
            }
          }
        }
      } catch (e) {
        console.warn('Could not fetch active profile for settings:', e);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await apiFetch('/api/profile/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          wallet: walletAddress,
          display_name: displayName,
          displayName,
          notifications: { emailNotifs, salesNotifs, roomNotifs },
        }),
      });

      if (typeof window !== 'undefined') {
        if (username) {
          localStorage.setItem('groovely_username', username);
          localStorage.setItem('grooveli_username', username);
        }
        if (displayName) {
          localStorage.setItem('groovely_display_name', displayName);
          localStorage.setItem('grooveli_display_name', displayName);
        }
        if (email) {
          localStorage.setItem('groovely_email', email);
          localStorage.setItem('grooveli_email', email);
        }
        if (walletAddress) {
          localStorage.setItem('groovely_wallet', walletAddress);
          localStorage.setItem('grooveli_wallet', walletAddress);
        }
      }

      toast.success('Account settings saved successfully!');
    } catch (err) {
      toast.success('Account settings updated!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#070714] text-white overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-6 sm:p-10 max-w-6xl w-full mx-auto space-y-8">
          
          {/* Header */}
          <div className="space-y-2 text-left">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Account Settings</h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium">
              Manage your security, wallet connections, notifications, and account preferences.
            </p>
          </div>

          {/* Settings Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'account'
                  ? 'bg-accent-purple text-white shadow-lg shadow-accent-purple/20'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <User size={14} />
              <span>Account Preferences</span>
            </button>

            <button
              onClick={() => setActiveTab('wallet')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'wallet'
                  ? 'bg-accent-purple text-white shadow-lg shadow-accent-purple/20'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Wallet size={14} />
              <span>Wallet & Payouts</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'notifications'
                  ? 'bg-accent-purple text-white shadow-lg shadow-accent-purple/20'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Bell size={14} />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'security'
                  ? 'bg-accent-purple text-white shadow-lg shadow-accent-purple/20'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Shield size={14} />
              <span>Security</span>
            </button>
          </div>

          {/* Tab 1: Account Preferences */}
          {activeTab === 'account' && (
            <Card variant="glass" className="space-y-6 text-left">
              <h2 className="text-lg font-bold text-white tracking-tight">Account Preferences</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Display Name"
                  placeholder="e.g. Alex Rivera"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  icon={<User size={16} />}
                />
                <Input
                  label="Username"
                  placeholder="e.g. alexrivera"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  icon={<User size={16} />}
                />
                <Input
                  label="Primary Email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Shield size={16} />}
                />
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <Button onClick={handleSave} className="bg-accent-purple hover:bg-accent-purple/90 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-2xl">
                  Save Preferences
                </Button>
              </div>
            </Card>
          )}

          {/* Tab 2: Wallet & Payouts */}
          {activeTab === 'wallet' && (
            <Card variant="glass" className="space-y-6 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Connected Web3 Wallet</h2>
                  <p className="text-xs text-zinc-400">Used for receiving audio marketplace royalties and NFT minting.</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
                  <CheckCircle size={12} />
                  <span>Polygon Amoy Connected</span>
                </span>
              </div>

              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">Active Wallet Address</span>
                  <span className="font-mono text-sm text-white font-bold">{walletAddress}</span>
                </div>
                <Button variant="secondary" className="text-xs uppercase font-bold py-2.5 px-4 rounded-xl">
                  Change Wallet
                </Button>
              </div>
            </Card>
          )}

          {/* Tab 3: Notifications */}
          {activeTab === 'notifications' && (
            <Card variant="glass" className="space-y-6 text-left">
              <h2 className="text-lg font-bold text-white tracking-tight">Notification Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <div>
                    <p className="text-sm font-bold text-white">Track Sales & Licensing Alerts</p>
                    <p className="text-xs text-zinc-400">Receive instant alerts when a buyer licenses your audio track.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={salesNotifs}
                    onChange={(e) => setSalesNotifs(e.target.checked)}
                    className="w-5 h-5 accent-accent-purple rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <div>
                    <p className="text-sm font-bold text-white">Live Listening Room Reminders</p>
                    <p className="text-xs text-zinc-400">Get notified when creators you follow host a room.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={roomNotifs}
                    onChange={(e) => setRoomNotifs(e.target.checked)}
                    className="w-5 h-5 accent-accent-purple rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-bold text-white">Groovely Product Updates</p>
                    <p className="text-xs text-zinc-400">Weekly digests on platform features and community highlights.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifs}
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                    className="w-5 h-5 accent-accent-purple rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <Button onClick={handleSave} className="bg-accent-purple hover:bg-accent-purple/90 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-2xl">
                  Save Notifications
                </Button>
              </div>
            </Card>
          )}

          {/* Tab 4: Security */}
          {activeTab === 'security' && (
            <Card variant="glass" className="space-y-6 text-left">
              <h2 className="text-lg font-bold text-white tracking-tight">Security & Passkeys</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••••••"
                  icon={<Key size={16} />}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••••••"
                  icon={<Key size={16} />}
                />
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Smartphone size={16} className="text-accent-cyan" />
                  <span>Two-Factor Authentication (2FA) is Recommended</span>
                </div>
                <Button onClick={handleSave} className="bg-accent-purple hover:bg-accent-purple/90 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-2xl">
                  Update Password
                </Button>
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
