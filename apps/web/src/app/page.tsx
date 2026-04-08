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
      <nav className="fixed top-0 z-50 flex w-full items-center justify-between px-12 py-8 backdrop-blur-xl bg-black/10 border-b border-white/5">
        <Logo />
        <div className="flex items-center gap-12 text-sm font-black uppercase tracking-widest">
          <button className="text-zinc-500 hover:text-white transition-colors">Login</button>
          <Link href="/onboarding" className="rounded-xl bg-accent-cyan px-8 py-3 text-black font-black hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(0,209,255,0.3)] hover:scale-105">
            Join Groovely
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <Hero />

      {/* Trusted By */}
      <section className="py-24 border-y border-white/5 bg-black/20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black tracking-[0.5em] text-zinc-500 mb-14 uppercase">
            TRUSTED BY ARTISTS & DECORATORS FROM
          </p>
          <div className="flex flex-wrap justify-between items-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all hover:opacity-100 px-10">
            <span className="text-2xl font-black tracking-tighter">SOUNDWAVE</span>
            <span className="text-2xl font-extrabold tracking-[0.4em] text-zinc-300">AUDIUS</span>
            <span className="text-3xl font-black italic tracking-tighter font-serif">VIBE.io</span>
            <span className="text-2xl font-bold tracking-widest uppercase">MINTABLE</span>
            <span className="text-2xl font-black tracking-[0.2em] italic">NOISE</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <FeatureCards />

      {/* Why Choose Fragment */}
      <section className="py-32 px-6 bg-gradient-to-b from-transparent to-black/40 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 uppercase tracking-tighter">Why choose Groovely?</h2>
          <p className="text-zinc-500 text-lg mb-24 max-w-2xl mx-auto font-medium">The future of audio is decentralized, fast, and fun.</p>
          <div className="grid md:grid-cols-3 gap-20">
            {[
              { icon: '⭐', title: 'Direct Ownership', desc: 'Your music is yours. Forever. We take zero middleman fees on your hard work.' },
              { icon: '⚡', title: 'Instant Payouts', desc: 'No more waiting months for streaming checks. Revenue flows to your wallet in real-time.' },
              { icon: '👥', title: 'Community First', desc: 'Chat, share, and vibe in real-time listening rooms. Build a superfan base that pays.' }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-[28px] bg-white/5 flex items-center justify-center text-3xl mb-10 border border-white/10 shadow-xl group hover:border-accent-purple transition-all">
                  {feature.icon}
                </div>
                <h4 className="text-2xl font-black mb-5 uppercase tracking-tight">{feature.title}</h4>
                <p className="text-zinc-500 text-md leading-relaxed max-w-xs font-medium">
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
         <div className="w-16 h-16 rounded-full border-2 border-accent-cyan/40 bg-accent-cyan/5 flex items-center justify-center mx-auto mb-10 text-accent-cyan font-black text-xl shadow-lg">
            0
         </div>
         <h2 className="text-4xl lg:text-5xl font-black mb-8 uppercase tracking-tighter">New to Web3? No problem.</h2>
         <p className="text-zinc-500 max-w-2xl mx-auto leading-relaxed text-lg font-medium italic opacity-80">
           "You don't need a crypto wallet to get started. Sign up with your email, and we'll create a secure custodial wallet for you. You own your assets, always."
         </p>
      </section>

      {/* Ready CTA */}
      <section className="py-32 px-6 text-center relative overflow-hidden z-10">
         <div className="max-w-7xl mx-auto">
            <h2 className="text-6xl md:text-8xl font-black mb-16 uppercase tracking-tighter">
              Ready to <span className="text-accent-magenta italic font-serif">Groove?</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-8">
              <Link href="/onboarding" className="rounded-full bg-accent-cyan px-14 py-6 text-black font-black text-xl hover:scale-105 transition-all shadow-[0_0_50px_rgba(0,209,255,0.4)] uppercase tracking-widest">
                Join Groovely Free
              </Link>
              <button className="rounded-full border border-white/20 px-14 py-6 font-black text-xl hover:bg-white/5 transition-all uppercase tracking-widest">
                View Top Charts
              </button>
            </div>
         </div>
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-t from-accent-purple/20 to-transparent -z-10 blur-3xl opacity-50" />
      </section>

      {/* Footer */}
      <footer className="py-32 px-12 border-t border-white/5 relative z-10 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
          <div className="grayscale brightness-200">
            <Logo />
          </div>
          <div className="flex gap-12 font-black tracking-[0.3em] text-zinc-500 uppercase text-[11px]">
            <a href="#" className="hover:text-white transition-colors">Music</a>
            <a href="#" className="hover:text-white transition-colors">Work</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
          <div className="flex gap-8 opacity-40 hover:opacity-100 transition-opacity">
             <span className="text-white cursor-pointer hover:text-accent-cyan transition-colors text-xl">𝕏</span>
             <span className="text-white cursor-pointer hover:text-accent-purple transition-colors text-xl">👾</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 text-center text-[10px] text-zinc-700 tracking-[0.6em] uppercase font-black">
          © 2024 Groovely Inc. All vibes reserved.
        </div>
      </footer>
    </div>
  );
}
