'use client';

import React from 'react';
import { Hero } from '@/components/landing/Hero';
import { FeatureCards } from '@/components/landing/FeatureCards';
import { JourneySteps } from '@/components/landing/JourneySteps';
import { ExperienceMockup } from '@/components/landing/ExperienceMockup';
import { Logo } from '@/components/ui/Logo';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050510] text-white selection:bg-accent-cyan selection:text-black relative font-sansSelection">
      {/* Background Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="absolute inset-0 starfield" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 z-50 flex w-full items-center justify-between px-6 lg:px-12 py-6 backdrop-blur-md bg-black/40 border-b border-white/5">
        <Logo />
        <div className="flex items-center gap-4 lg:gap-6">
          <Link href="/login" className="text-zinc-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
            Login
          </Link>
          <Link href="/onboarding" className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-white text-xs font-bold hover:bg-white/10 transition-all uppercase tracking-widest">
            Sign Up
          </Link>
          <Link href="/dashboard/marketplace" className="rounded-xl bg-accent-purple px-6 py-2.5 text-white text-xs font-bold hover:bg-accent-purple/90 transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            Explore Groovely
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <Hero />

      {/* Trusted By Ticker */}
      <section className="py-6 border-y border-white/5 bg-white/[0.02] relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 whitespace-nowrap">
           <div className="flex items-center justify-center gap-20 animate-infinite-scroll">
              <span className="text-[10px] font-bold tracking-[0.4em] text-zinc-600 uppercase shrink-0">TRUSTED BY NEXT-GEN ARTISTS FROM</span>
              <div className="flex items-center gap-16 opacity-30">
                 <span className="text-lg font-black tracking-tighter">METAMASK</span>
                 <span className="text-lg font-black tracking-tighter">SPOTIFY</span>
                 <span className="text-xl font-bold italic tracking-tighter">SoundCloud</span>
                 <span className="text-lg font-black tracking-widest uppercase">AUDIUS</span>
              </div>
           </div>
        </div>
      </section>

      {/* Features */}
      <FeatureCards />

      {/* Why Choose Fragment */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 uppercase tracking-tighter">Why choose Groovely?</h2>
          <p className="text-zinc-600 text-lg mb-24 max-w-2xl mx-auto font-medium">The future of audio is decentralized, fair, and fun.</p>
          <div className="grid md:grid-cols-3 gap-20">
            {[
              { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: '⊙', title: 'Direct Ownership', desc: 'Your music is yours. Forever. We take zero middleman fees on your hard work.' },
              { color: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20', icon: '▶', title: 'Instant Payouts', desc: 'No more waiting months for streaming checks. Revenue flows to your wallet in real-time.' },
              { color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: '♡', title: 'Community First', desc: 'Chat, share, and vibe in real-time listening rooms. Build a superfan base that pays.' }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-20 h-20 rounded-full ${feature.color} flex items-center justify-center text-3xl mb-8 border shadow-lg`}>
                  {feature.icon}
                </div>
                <h4 className="text-xl font-black mb-4 uppercase tracking-tight">{feature.title}</h4>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-xs font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <JourneySteps />

      {/* Experience Mockup */}
      <ExperienceMockup />

      {/* Web3 Info */}
      <section className="py-32 px-6 text-center relative z-10">
         <div className="w-12 h-12 rounded-full border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center mx-auto mb-10 text-emerald-500 font-bold text-xl shadow-lg">
            🛡️
         </div>
         <h2 className="text-4xl lg:text-5xl font-black mb-6 uppercase tracking-tighter">New to Web3? No problem.</h2>
         <p className="text-zinc-500 max-w-2xl mx-auto leading-relaxed text-sm lg:text-md font-medium">
           Setting started is easier than you think. Connect your wallet and enjoy full ownership of everything you create and collect.
         </p>
      </section>

      {/* Ready CTA */}
      <section className="py-40 px-6 text-center relative overflow-hidden z-10">
         <div className="max-w-7xl mx-auto">
            <h2 className="text-6xl md:text-[100px] font-black mb-16 uppercase tracking-tighter leading-tight">
              Ready to <span className="text-accent-purple">Groove?</span>
            </h2>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Link href="/login" className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/5 px-12 py-5 text-white font-bold text-sm hover:bg-white/10 transition-all uppercase tracking-widest">
                Log In
              </Link>
              <Link href="/onboarding" className="w-full sm:w-auto rounded-xl border border-accent-purple/50 bg-transparent px-12 py-5 text-accent-purple font-bold text-sm hover:bg-accent-purple/10 transition-all uppercase tracking-widest">
                Sign Up
              </Link>
              <Link href="/dashboard/marketplace" className="w-full sm:w-auto rounded-xl bg-accent-purple px-12 py-5 text-white font-bold text-sm hover:bg-accent-purple/90 transition-all shadow-[0_0_25px_rgba(139,92,246,0.3)] hover:scale-105 uppercase tracking-widest">
                Explore Groovely
              </Link>
            </div>
         </div>
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-accent-purple/5 blur-[120px] -z-10 pointer-events-none" />
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 lg:px-12 border-t border-white/5 relative z-10 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <Logo />
          <div className="flex flex-wrap justify-center gap-8 font-bold tracking-widest text-zinc-600 uppercase text-[10px]">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
          <div className="flex gap-6">
             <span className="text-zinc-600 cursor-pointer hover:text-white transition-colors text-lg">𝕏</span>
             <span className="text-zinc-600 cursor-pointer hover:text-white transition-colors text-lg">👾</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 text-center text-[10px] text-zinc-800 tracking-widest uppercase font-bold">
          © 2024 Groovely Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
