'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { ChevronDown } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Profile');

  return (
    <div className="flex min-h-screen bg-[#050510] text-white font-sans selection:bg-accent-cyan selection:text-black">
      <Sidebar activePage="settings" />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* We need to pass a title to TopBar if it accepts it, but looking at previous usages, it only handles Search, Notifications, Profile. 
            The mockup shows "Settings" text near the search bar. We can just use the standard TopBar and render a header underneath.
            Actually, the mockup shows "Settings" where the "Logo" or TopBar title would be. But TopBar doesn't have a title prop in our usage.
            We will just add an H1 header in our main content like we did in Listening Rooms.
        */}
        <header className="flex items-center px-10 py-8 border-b border-white/5 bg-[#0A0A15]">
          <h1 className="text-2xl font-black tracking-tight text-white mr-10">Settings</h1>
          <div className="flex-1 max-w-md relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
               <circle cx="11" cy="11" r="8"></circle>
               <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full bg-[#0F0F1A] border border-white/5 rounded-xl py-3 px-12 text-sm focus:outline-none focus:border-accent-purple/30 transition-all text-white placeholder-zinc-600"
            />
          </div>
          <div className="ml-auto flex items-center gap-6">
            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-zinc-400">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
               </svg>
            </div>
            <div className="flex items-center gap-3 cursor-pointer">
              <img src="https://metamask.io/images/metamask-logo.png" alt="MetaMask" className="w-6 h-6 object-contain" />
              <span className="text-sm font-bold text-zinc-300">0xc...y69</span>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Inner Content Area */}
          <main className="flex-1 overflow-y-auto p-10 mesh-gradient relative">
            <div className="max-w-2xl">
               
               {/* Profile Section */}
               <section className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-xl font-black tracking-tight text-white mb-8">Profile</h2>
                  
                  <div className="flex flex-col gap-6">
                     <div className="flex items-center gap-6">
                        <img 
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop" 
                          alt="Avatar" 
                          className="w-20 h-20 rounded-full border-2 border-[#151525] shadow-lg object-cover" 
                        />
                        <button className="bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-3 px-6 rounded-xl border border-white/5 transition-all">
                           Change Photo
                        </button>
                     </div>

                     <div className="space-y-2">
                        <label className="text-sm font-bold text-white">Display Name</label>
                        <input 
                          type="text" 
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
                             placeholder="Username" 
                             className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-accent-purple/50 transition-all placeholder-white/20"
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-sm font-bold text-white">Creator Type</label>
                        <div className="relative">
                           <select className="w-full appearance-none bg-[#0F0F1A] border border-white/10 rounded-xl py-3 px-4 text-sm text-zinc-400 focus:outline-none focus:border-accent-purple/50 transition-all cursor-pointer">
                              <option value="">I'm a...</option>
                              <option value="musician">Musician</option>
                              <option value="podcaster">Podcaster</option>
                              <option value="producer">Producer</option>
                           </select>
                           <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-sm font-bold text-white">Bio</label>
                        <textarea 
                          rows={6}
                          placeholder="Tell the world what kind of sound you make" 
                          className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-accent-purple/50 transition-all placeholder-white/20 resize-none"
                        />
                     </div>

                     <div className="pt-2">
                        <button className="bg-accent-purple hover:bg-opacity-90 text-white text-xs font-bold py-3 px-8 rounded-xl shadow-[0_0_15px_rgba(157,0,255,0.3)] hover:scale-105 active:scale-95 transition-all">
                           Save Changes
                        </button>
                     </div>
                  </div>
               </section>

               {/* Wallet Settings */}
               <section className="mb-16 border-t border-white/5 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <h2 className="text-xl font-black tracking-tight text-white mb-6">Wallet Settings</h2>
                  
                  <div className="space-y-8">
                     <div className="flex items-start gap-4">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-12 h-12 object-contain" />
                        <div>
                           <h3 className="text-base font-black text-white">MetaMask</h3>
                           <p className="text-xs font-medium text-zinc-400 font-mono mt-1">0xf3f0e35b4efd0b6c76c54e3cc02c2bb4f41de21d</p>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-sm font-bold text-white block">Network</label>
                        <div className="flex items-center gap-2 text-[#8247E5] font-black tracking-tight text-lg">
                           <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                              <path d="M16.3 9.4l-3.8 2.2-3.8-2.2V5l3.8-2.2 3.8 2.2zM21 12l-3.8 2.2v4.4L21 16.4zM12.5 21.6l-3.8-2.2v-4.4l3.8 2.2zm-5.7-9.8L3 9.6v4.4l3.8 2.2zm4.7 0l3.8-2.2v4.4l-3.8 2.2z"/>
                           </svg>
                           Polygon
                        </div>
                     </div>

                     <div>
                        <button className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-3 px-8 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all">
                           Disconnect Wallet
                        </button>
                     </div>
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
                              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
                           </label>
                        </div>
                     ))}
                  </div>
               </section>

               <footer className="mt-20 pt-10 border-t border-white/5 flex flex-wrap items-center gap-x-6 gap-y-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <a href="#" className="hover:text-white transition-colors">About Groovely</a>
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
          <aside className="w-64 bg-[#0A0A15] border-l border-white/5 p-6 flex flex-col hidden lg:flex">
             <nav className="space-y-1">
                {['Profile', 'Wallet', 'Notifications'].map(item => (
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
