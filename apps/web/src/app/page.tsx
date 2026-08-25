'use client';

import React, { useState, useEffect } from 'react';
import { Hero } from '@/components/landing/Hero';
import { FeatureCards } from '@/components/landing/FeatureCards';
import { JourneySteps } from '@/components/landing/JourneySteps';
import { ExperienceMockup } from '@/components/landing/ExperienceMockup';
import { Logo } from '@/components/ui/Logo';
import Link from 'next/link';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'creator' | 'fan'>('creator');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('groovely_token') || localStorage.getItem('grooveli_token');
      if (token) {
        setIsLoggedIn(true);
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.role) setUserRole(payload.role);
        } catch {}
      }
    }
  }, []);

  const dashboardUrl = userRole === 'fan' ? '/explore' : '/dashboard';

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
          <Link href="/">
            <Logo />
          </Link>
          
          {/* Desktop Navigation Links */}
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-6">
              <Link
                href={dashboardUrl}
                className="rounded-xl bg-[#8B5CF6] hover:bg-[#7c4dff] px-6 py-2.5 text-white text-xs font-bold transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(139,92,246,0.3)]"
              >
                Dashboard
              </Link>
              <Link
                href="/marketplace"
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-white text-xs font-bold hover:bg-white/10 transition-all uppercase tracking-widest"
              >
                Explore Groovely
              </Link>
            </div>
          ) : (
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
          )}

          {/* Mobile Quick Action & Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-3">
            {isLoggedIn ? (
              <Link
                href={dashboardUrl}
                className="rounded-lg bg-[#8B5CF6] px-4 py-2 text-white text-xs font-bold uppercase tracking-wider shadow-md"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/onboarding"
                className="rounded-lg bg-[#8B5CF6] px-4 py-2 text-white text-xs font-bold uppercase tracking-wider shadow-md"
              >
                Sign Up
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:text-white cursor-pointer"
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
            {isLoggedIn ? (
              <>
                <Link 
                  href={dashboardUrl} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 px-4 rounded-xl bg-[#8B5CF6] text-center font-bold text-xs uppercase tracking-widest text-white shadow-lg"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/marketplace" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 px-4 rounded-xl bg-[#192134] border border-white/10 text-center font-bold text-xs uppercase tracking-widest text-zinc-300"
                >
                  Explore Groovely
                </Link>
              </>
            ) : (
              <>
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
              </>
            )}
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

        {/* Continuous Marquee Container */}
        <div className="relative w-full overflow-hidden flex items-center">
          {/* Subtle gradient fades on edges */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-[#050510] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-[#050510] to-transparent z-10 pointer-events-none" />

          {/* Marquee Track (Duplicates content for seamless loop) */}
          <div className="flex w-max animate-marquee gap-8 sm:gap-16 items-center">
            {/* First Set */}
            {[
              "WARNER MUSIC", "UNIVERSAL", "DECODE LABS", "OPENSEA", "SONY MUSIC", 
              "SPOTIFY WEB3", "AUDIUS", "SOUND.XYZ", "ROYALTY COLLECTIVE", "DEF JAM"
            ].map((name, i) => (
              <div key={`brand-1-${i}`} className="flex items-center gap-2 shrink-0">
                <span className="text-zinc-400 text-xs sm:text-sm font-black tracking-widest uppercase hover:text-white transition-colors cursor-default select-none">
                  {name}
                </span>
                <span className="text-zinc-700 text-xs ml-4 sm:ml-8 select-none">✦</span>
              </div>
            ))}

            {/* Second Duplicate Set for Infinite Scroll */}
            {[
              "WARNER MUSIC", "UNIVERSAL", "DECODE LABS", "OPENSEA", "SONY MUSIC", 
              "SPOTIFY WEB3", "AUDIUS", "SOUND.XYZ", "ROYALTY COLLECTIVE", "DEF JAM"
            ].map((name, i) => (
              <div key={`brand-2-${i}`} className="flex items-center gap-2 shrink-0">
                <span className="text-zinc-400 text-xs sm:text-sm font-black tracking-widest uppercase hover:text-white transition-colors cursor-default select-none">
                  {name}
                </span>
                <span className="text-zinc-700 text-xs ml-4 sm:ml-8 select-none">✦</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <FeatureCards />

      {/* Journey Steps / How it Works */}
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
              {isLoggedIn ? (
                <>
                  <Link
                    href={dashboardUrl}
                    className="w-full sm:w-auto rounded-xl bg-[#8B5CF6] hover:bg-[#7c4dff] px-10 py-4 text-white font-bold text-xs sm:text-sm transition-all uppercase tracking-widest shadow-[0_0_25px_rgba(139,92,246,0.4)]"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    href="/marketplace"
                    className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/5 px-10 py-4 text-zinc-300 hover:text-white font-bold text-xs sm:text-sm hover:bg-white/10 transition-all uppercase tracking-widest"
                  >
                    Explore Groovely
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="w-full sm:w-auto rounded-xl border border-white/10 bg-[#192134] px-10 py-4 text-white font-bold text-xs sm:text-sm hover:bg-white/10 transition-all uppercase tracking-widest">
                    Log In
                  </Link>
                  <Link href="/onboarding" className="w-full sm:w-auto rounded-xl bg-[#8B5CF6] hover:bg-[#7c4dff] px-10 py-4 text-white font-bold text-xs sm:text-sm transition-all uppercase tracking-widest shadow-[0_0_25px_rgba(139,92,246,0.4)]">
                    Sign Up Free
                  </Link>
                  <Link href="/marketplace" className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/5 px-10 py-4 text-zinc-300 hover:text-white font-bold text-xs sm:text-sm hover:bg-white/10 transition-all uppercase tracking-widest">
                    Explore Groovely
                  </Link>
                </>
              )}
            </div>
         </div>
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] sm:h-[400px] bg-[#8B5CF6]/5 blur-[120px] -z-10 pointer-events-none" />
      </section>

      {/* Footer */}
      <footer className="py-16 sm:py-24 px-6 lg:px-12 border-t border-white/5 relative z-10 bg-[#050510]/90">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12">
          <Link href="/">
            <Logo />
          </Link>
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
