'use client';

import React, { useState } from 'react';
import { Hero } from '@/components/landing/Hero';
import { FeatureCards } from '@/components/landing/FeatureCards';
import { JourneySteps } from '@/components/landing/JourneySteps';
import { ExperienceMockup } from '@/components/landing/ExperienceMockup';
import { Logo } from '@/components/ui/Logo';
import Link from 'next/link';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050510] text-white selection:bg-[#00FFC6] selection:text-black relative font-sans">
      {/* Background Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="absolute inset-0 starfield" />
      </div>

      {/* Clean Mobile & Desktop Responsive Navigation */}
      <nav className="fixed top-0 z-50 w-full px-4 sm:px-8 lg:px-12 py-4 sm:py-5 backdrop-blur-xl bg-[#050510]/80 border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo />
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/login" className="text-zinc-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
              Login
            </Link>
            <Link href="/onboarding" className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-white text-xs font-bold hover:bg-white/10 transition-all uppercase tracking-widest">
              Sign Up
            </Link>
            <Link href="/marketplace" className="rounded-xl bg-[#8B5CF6] hover:bg-[#7c4dff] px-6 py-2.5 text-white text-xs font-bold transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              Explore Groovely
            </Link>
          </div>

          {/* Mobile Quick Action & Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-3">
            <Link href="/onboarding" className="rounded-lg bg-[#8B5CF6] px-4 py-2 text-white text-xs font-bold uppercase tracking-wider shadow-md">
              Sign Up
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/10 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <Link 
              href="/login" 
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-center font-bold text-xs uppercase tracking-widest text-zinc-200"
            >
              Log In
            </Link>
            <Link 
              href="/onboarding" 
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 px-4 rounded-xl bg-[#8B5CF6] text-center font-bold text-xs uppercase tracking-widest text-white shadow-lg"
            >
              Sign Up Free
            </Link>
            <Link 
              href="/marketplace" 
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 px-4 rounded-xl bg-[#192134] border border-white/10 text-center font-bold text-xs uppercase tracking-widest text-zinc-300"
            >
              Explore Groovely
            </Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <Hero />

      {/* Trusted By Next-Gen Artists Ticker (Stacked Label Above Marquee) */}
      <section className="py-8 border-y border-white/5 bg-white/[0.02] relative z-10 overflow-hidden text-center">
        {/* Label centered at the top of the section */}
        <div className="mb-5">
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-[#00FFC6] uppercase px-4 py-1.5 rounded-full bg-[#1A2C30] border border-[#00C68A]/40 inline-block shadow-md">
            TRUSTED BY NEXT-GEN ARTISTS FROM
          </span>
        </div>

        {/* Infinite Scrolling Marquee Underneath */}
        <div className="relative overflow-hidden">
          {/* Ambient Gradient Edge Fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-[#050510] to-transparent z-20" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-[#050510] to-transparent z-20" />

          <div className="animate-marquee items-center gap-12 sm:gap-20 opacity-50 text-white font-black whitespace-nowrap py-1">
            {[
              "METAMASK", "SPOTIFY", "SOUNDCLOUD", "AUDIUS", "OPENSEA", "LENS PROTOCOL", "UNISWAP",
              "METAMASK", "SPOTIFY", "SOUNDCLOUD", "AUDIUS", "OPENSEA", "LENS PROTOCOL", "UNISWAP"
            ].map((brand, i) => (
              <span key={i} className="text-xs sm:text-base tracking-widest uppercase hover:opacity-100 hover:text-[#00FFC6] transition-all cursor-pointer">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <FeatureCards />

      {/* Why Choose Fragment */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-black mb-4 uppercase tracking-tight">Why choose Groovely?</h2>
          <p className="text-zinc-500 text-sm sm:text-lg mb-16 sm:mb-24 max-w-2xl mx-auto font-medium">The future of audio is decentralized, fair, and fun.</p>
          <div className="grid md:grid-cols-3 gap-10 sm:gap-20">
            {[
              { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: '⊙', title: 'Direct Ownership', desc: 'Your music is yours. Forever. We take zero middleman fees on your hard work.' },
              { color: 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20', icon: '▶', title: 'Instant Payouts', desc: 'No more waiting months for streaming checks. Revenue flows to your wallet in real-time.' },
              { color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: '♡', title: 'Community First', desc: 'Chat, share, and vibe in real-time listening rooms. Build a superfan base that pays.' }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full ${feature.color} flex items-center justify-center text-2xl sm:text-3xl mb-6 sm:mb-8 border shadow-lg`}>
                  {feature.icon}
                </div>
                <h4 className="text-lg sm:text-xl font-black mb-3 uppercase tracking-tight">{feature.title}</h4>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-xs font-medium">
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
      <section className="py-20 sm:py-32 px-4 sm:px-6 text-center relative z-10">
         <div className="w-12 h-12 rounded-full border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center mx-auto mb-8 text-emerald-500 font-bold text-xl shadow-lg">
            🛡️
         </div>
         <h2 className="text-3xl sm:text-5xl font-black mb-4 uppercase tracking-tight">New to Web3? No problem.</h2>
         <p className="text-zinc-400 max-w-xl mx-auto leading-relaxed text-xs sm:text-base font-medium">
           Getting started is easier than you think. Connect your wallet and enjoy full ownership of everything you create and collect.
         </p>
      </section>

      {/* Ready CTA */}
      <section className="py-28 sm:py-40 px-4 sm:px-6 text-center relative overflow-hidden z-10">
         <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl sm:text-7xl lg:text-[90px] font-black mb-10 sm:mb-16 uppercase tracking-tight leading-tight">
              Ready to <span className="text-[#8B5CF6]">Groove?</span>
            </h2>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
              <Link href="/login" className="w-full sm:w-auto rounded-xl border border-white/10 bg-[#192134] px-10 py-4 text-white font-bold text-xs sm:text-sm hover:bg-white/10 transition-all uppercase tracking-widest">
                Log In
              </Link>
              <Link href="/onboarding" className="w-full sm:w-auto rounded-xl bg-[#8B5CF6] hover:bg-[#7c4dff] px-10 py-4 text-white font-bold text-xs sm:text-sm transition-all uppercase tracking-widest shadow-[0_0_25px_rgba(139,92,246,0.4)]">
                Sign Up Free
              </Link>
              <Link href="/marketplace" className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/5 px-10 py-4 text-zinc-300 hover:text-white font-bold text-xs sm:text-sm hover:bg-white/10 transition-all uppercase tracking-widest">
                Explore Groovely
              </Link>
            </div>
         </div>
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] sm:h-[400px] bg-[#8B5CF6]/5 blur-[120px] -z-10 pointer-events-none" />
      </section>

      {/* Footer */}
      <footer className="py-16 sm:py-24 px-6 lg:px-12 border-t border-white/5 relative z-10 bg-[#050510]/90">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12">
          <Logo />
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 font-bold tracking-widest text-zinc-500 uppercase text-[10px]">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
          <div className="flex gap-6">
             <span className="text-zinc-500 cursor-pointer hover:text-white transition-colors text-base">𝕏</span>
             <span className="text-zinc-500 cursor-pointer hover:text-white transition-colors text-base">👾</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 text-center text-[10px] text-zinc-600 tracking-widest uppercase font-bold">
          © 2026 Groovely Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

