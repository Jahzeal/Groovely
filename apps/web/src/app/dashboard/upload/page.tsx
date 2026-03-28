'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { 
  ChevronLeft, 
  Cloud, 
  HelpCircle, 
  Info, 
  ChevronDown, 
  RefreshCw,
  Plus,
  Trash2,
  Lock,
  Globe,
  Music,
  Mic2,
  Radio,
  Drum,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function UploadPage() {
  const [step, setStep] = useState(1);
  const [isPublic, setIsPublic] = useState(true);
  const [explicit, setExplicit] = useState(false);
  const [category, setCategory] = useState('Music');

  return (
    <div className="flex min-h-screen bg-[#050510] text-white font-sans selection:bg-accent-cyan selection:text-black">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative pb-24">
        {/* Top Header */}
        <header className="flex items-center justify-between px-10 py-6 border-b border-white/5 bg-[#050510]/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest group">
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold">
              <RefreshCw size={14} className="animate-spin-slow" />
              Autosaving
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center cursor-pointer hover:bg-accent-purple/30 transition-all overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Uzor" alt="User Profile" className="w-full h-full object-cover" />
             </div>
             <ChevronDown size={16} className="text-zinc-500" />
          </div>
        </header>

        {/* Step Progress */}
        <div className="max-w-6xl mx-auto w-full px-10 pt-10">
          <div className="flex items-center gap-12 mb-12">
            {[
              { id: 1, label: 'Upload Audio' },
              { id: 2, label: 'Add Metadata & Licensing' },
              { id: 3, label: 'Mint Track' }
            ].map((s) => (
              <div key={s.id} className="flex items-center gap-4 group cursor-pointer" onClick={() => setStep(s.id)}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-[0_0_15px_rgba(157,0,255,0.1)] 
                  ${step >= s.id ? 'bg-accent-purple text-white shadow-[0_0_20px_rgba(157,0,255,0.4)]' : 'bg-white/5 text-zinc-500 border border-white/10'}
                `}>
                  {s.id}
                </div>
                <span className={`text-sm font-bold tracking-wide transition-colors ${step >= s.id ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                  {s.label}
                </span>
                {s.id < 3 && <div className="ml-8 text-zinc-800 font-light select-none">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-800"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            {/* Left Column: Audio and Metadata */}
            <div className="xl:col-span-4 space-y-10">
              {/* Audio Upload */}
              <div className="bg-white/5 border border-white/5 rounded-[32px] p-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#00FF85] mb-6 flex items-center gap-2">
                  Audio
                  <Info size={14} className="text-zinc-600" />
                </h3>
                <div className="aspect-square border-2 border-dashed border-white/10 rounded-[24px] flex flex-col items-center justify-center text-center p-8 transition-all hover:bg-white/5 hover:border-accent-purple/50 group cursor-pointer">
                  <div className="w-16 h-20 bg-accent-purple rounded-xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(157,0,255,0.6)] group-hover:scale-110 transition-transform">
                     <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                  </div>
                  <p className="text-lg font-bold mb-2">Drag & drop your audio file here</p>
                  <p className="text-zinc-500 font-medium mb-2">or</p>
                  <button className="text-accent-purple font-black text-xl hover:text-[#B14BFF] transition-colors">Browse files</button>
                </div>
                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                  <p className="text-zinc-500 font-medium text-sm italic">No Audio Uploaded Yet</p>
                </div>
              </div>

              {/* Track Details */}
              <div className="bg-white/5 border border-white/5 rounded-[32px] p-8 space-y-8">
                 <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                   Track Details
                 </h3>
                 <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">Title</label>
                      <input 
                        type="text" 
                        placeholder="Title" 
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-5 py-4 text-sm font-medium placeholder:text-zinc-700 outline-none focus:border-accent-purple/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">Description (Optional)</label>
                      <textarea 
                        rows={5} 
                        placeholder="Write a short description" 
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-5 py-3 text-sm font-medium placeholder:text-zinc-700 outline-none focus:border-accent-purple/50 transition-all resize-none"
                      />
                    </div>
                    <div className="flex items-center justify-between py-2">
                       <span className="text-sm font-bold text-zinc-300">Explicit Content</span>
                       <button 
                         onClick={() => setExplicit(!explicit)}
                         className={`w-12 h-6 rounded-full transition-all relative ${explicit ? 'bg-accent-purple' : 'bg-zinc-800'}`}
                       >
                         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${explicit ? 'left-7' : 'left-1'}`} />
                       </button>
                    </div>
                 </div>
              </div>
            </div>

            {/* Middle Column: Cover Art and More */}
            <div className="xl:col-span-4 space-y-10">
              {/* Cover Art */}
              <div className="bg-white/5 border border-white/5 rounded-[32px] p-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#00FF85] mb-6 flex items-center justify-between">
                  Cover Art
                  <Info size={14} className="text-zinc-600" />
                </h3>
                <div className="aspect-square bg-[#0F0F1A] rounded-[24px] flex items-center justify-center p-12 mb-6">
                   <div className="w-full h-full rounded-full border-[10px] border-zinc-900 border-t-zinc-800 flex items-center justify-center">
                      <div className="w-4 h-4 bg-zinc-800 rounded-full" />
                   </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <Button className="w-full bg-accent-purple hover:bg-[#B14BFF] py-4">Upload image</Button>
                  <button className="text-red-500 font-bold text-sm py-2 hover:opacity-80 transition-opacity">Delete</button>
                </div>
              </div>

              {/* Visibility Settings */}
              <div className="bg-white/5 border border-white/5 rounded-[32px] p-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Visibility Settings</h3>
                <div className="flex gap-8">
                   <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsPublic(true)}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isPublic ? 'border-accent-purple bg-accent-purple/20' : 'border-zinc-700 bg-transparent group-hover:border-zinc-500'}`}>
                         {isPublic && <div className="w-2 h-2 bg-accent-purple rounded-full" />}
                      </div>
                      <Globe size={18} className={isPublic ? 'text-accent-purple' : 'text-zinc-600'} />
                      <span className={`text-sm font-bold ${isPublic ? 'text-white' : 'text-zinc-500'}`}>Public</span>
                   </div>
                   <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsPublic(false)}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${!isPublic ? 'border-accent-purple bg-accent-purple/20' : 'border-zinc-700 bg-transparent group-hover:border-zinc-500'}`}>
                         {!isPublic && <div className="w-2 h-2 bg-accent-purple rounded-full" />}
                      </div>
                      <Lock size={18} className={!isPublic ? 'text-accent-purple' : 'text-zinc-600'} />
                      <span className={`text-sm font-bold ${!isPublic ? 'text-white' : 'text-zinc-500'}`}>Private</span>
                   </div>
                </div>
              </div>

              {/* Genre & Tags */}
              <div className="bg-white/5 border border-white/5 rounded-[32px] p-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#00FF85] mb-6 flex items-center justify-between">
                  Genre & Tags
                  <Info size={14} className="text-zinc-600" />
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">Genre</label>
                    <div className="relative">
                      <select className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl pl-5 pr-10 py-4 text-sm font-medium text-zinc-400 outline-none focus:border-accent-purple/50 appearance-none cursor-pointer">
                        <option>Select a genre</option>
                        <option>Afrobeats</option>
                        <option>Hip Hop</option>
                        <option>R&B</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">Tags (Optional)</label>
                    <div className="relative">
                      <select className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl pl-5 pr-10 py-4 text-sm font-medium text-zinc-400 outline-none focus:border-accent-purple/50 appearance-none cursor-pointer">
                        <option>Choose your tags</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 pointer-events-none">
                         <ChevronLeft size={14} className="text-zinc-600 rotate-90" />
                         <ChevronLeft size={14} className="text-zinc-600 -rotate-90" />
                      </div>
                    </div>
                  </div>
                  <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-2xl">
                     <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">No Tags Added Yet</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Licensing and Cat */}
            <div className="xl:col-span-4 space-y-10">
              {/* Licensing */}
              <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                 <h3 className="text-sm font-black uppercase tracking-widest text-white mb-8">Licensing</h3>
                 
                 <div className="space-y-8">
                   {/* Usage Rights */}
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-5 ml-1">Usage Rights</p>
                     <div className="space-y-4">
                       {['Personal Use', 'Remix Allowed', 'Commercial use', 'Distribution Allowed'].map((right) => (
                         <div key={right} className="flex items-center gap-3 cursor-pointer group">
                           <div className="w-5 h-5 rounded border-2 border-zinc-700 bg-[#0F0F1A] flex items-center justify-center transition-all group-hover:border-zinc-500">
                              {/* Checkbox state logic can be added */}
                           </div>
                           <span className="text-sm font-bold text-zinc-300">{right}</span>
                         </div>
                       ))}
                     </div>
                   </div>

                   {/* Payment Model */}
                   <div className="pt-8 border-t border-white/5">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 ml-1">Payment Model</p>
                     <div className="space-y-6">
                        <div className="flex items-center justify-between gap-4">
                           <div className="flex items-center gap-3">
                              <div className="w-5 h-5 rounded-full border-2 border-accent-purple bg-accent-purple/20 flex items-center justify-center">
                                 <div className="w-2 h-2 bg-accent-purple rounded-full" />
                              </div>
                              <span className="text-sm font-bold">Fixed License Price</span>
                           </div>
                           <div className="w-24 relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">$</span>
                              <input type="text" value="0.00" readOnly className="w-full bg-transparent border border-white/10 rounded-lg pl-6 pr-3 py-2 text-sm text-zinc-500 font-bold text-right" />
                           </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between gap-4">
                             <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full border-2 border-zinc-700 bg-transparent flex items-center justify-center"></div>
                                <span className="text-sm font-bold text-zinc-600">Royalty</span>
                             </div>
                             <div className="w-24 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">%</span>
                                <input type="text" value="0.00" readOnly className="w-full bg-transparent border border-white/10 rounded-lg pl-6 pr-3 py-2 text-sm text-zinc-500 font-bold text-right" />
                             </div>
                          </div>
                          <div className="px-2 relative pt-2">
                             <div className="h-2 bg-zinc-800 rounded-full w-full">
                                <div className="h-full bg-accent-purple w-[10%] rounded-full relative">
                                   <div className="absolute -right-3 -top-8 bg-zinc-800 border border-white/10 px-1.5 py-1 rounded-md text-[10px] font-black text-white shadow-xl">
                                      10%
                                      <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-1.5 h-1.5 bg-zinc-800 border-r border-b border-white/10 rotate-45" />
                                   </div>
                                   <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] cursor-pointer" />
                                </div>
                             </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <div className="w-5 h-5 rounded-full border-2 border-zinc-700 bg-transparent flex items-center justify-center"></div>
                           <span className="text-sm font-bold text-zinc-600">No License Fee</span>
                        </div>
                     </div>
                   </div>

                   <div className="pt-8 border-t border-white/5">
                      <div className="flex items-start gap-4 cursor-pointer group">
                         <div className="w-5 h-5 rounded border-2 border-zinc-700 bg-[#0F0F1A] flex items-center justify-center transition-all group-hover:border-zinc-500 mt-0.5">
                         </div>
                         <p className="text-[10px] font-bold text-zinc-500 leading-normal">
                           I confirm I own the rights to this audio and agree to Groovely's <span className="text-accent-purple">Terms & Conditions</span>
                         </p>
                      </div>
                   </div>
                 </div>
              </div>

              {/* Category */}
              <div className="bg-white/5 border border-white/5 rounded-[32px] p-8">
                 <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Category</h3>
                 <div className="flex flex-wrap gap-2">
                    {['Music', 'Podcast', 'Skit', 'Beat'].map((cat) => (
                      <button 
                         key={cat}
                         onClick={() => setCategory(cat)}
                         className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${category === cat ? 'bg-accent-purple text-white' : 'bg-white/5 text-zinc-500 border border-white/5 hover:bg-white/10'}`}
                      >
                        {cat}
                      </button>
                    ))}
                 </div>
              </div>

              {/* Advanced Details */}
              <div className="bg-white/5 border border-white/5 rounded-[32px] p-8 space-y-8">
                 <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center justify-between">
                   Advanced Details (Optional)
                   <ChevronDown size={16} className="text-zinc-600" />
                 </h3>
                 <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">BPM (for producers)</label>
                      <input 
                        type="text" 
                        placeholder="0-300" 
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-5 py-4 text-sm font-medium placeholder:text-zinc-700 outline-none focus:border-accent-purple/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">Key</label>
                      <div className="relative">
                        <select className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl pl-5 pr-10 py-4 text-sm font-medium text-zinc-400 outline-none focus:border-accent-purple/50 appearance-none cursor-pointer">
                          <option>Select a key</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1">ISRC (If available)</label>
                      <input 
                        type="text" 
                        placeholder="AB-123-456-7890" 
                        className="w-full bg-[#0F0F1A] border border-white/10 rounded-xl px-5 py-4 text-sm font-medium placeholder:text-zinc-700 outline-none focus:border-accent-purple/50 transition-all"
                      />
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <footer className="fixed bottom-0 right-0 left-64 bg-[#0F0F1A]/80 backdrop-blur-xl border-t border-white/5 px-10 py-6 flex items-center justify-end gap-4 z-40">
           <Button variant="secondary" className="px-10">Save as Draft</Button>
           <Link href="/dashboard/upload/metadata">
             <Button variant="primary" className="px-12 bg-accent-purple shadow-[0_0_20px_rgba(157,0,255,0.3)]">Next</Button>
           </Link>
        </footer>
      </div>
    </div>
  );
}
