'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-white/5 animate-pulse rounded-2xl ${className}`}
    />
  );
}

export function SkeletonTrackCard() {
  return (
    <div className="bg-[#0A0A1B] border border-white/10 rounded-3xl p-5 space-y-4 animate-pulse">
      <div className="w-full aspect-square bg-white/5 rounded-2xl" />
      <div className="space-y-2">
        <div className="h-4 bg-white/10 rounded-md w-3/4" />
        <div className="h-3 bg-white/5 rounded-md w-1/2" />
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-white/5">
        <div className="h-6 w-16 bg-white/5 rounded-full" />
        <div className="h-8 w-20 bg-white/10 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonMetrics() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-[#0A0A1B] border border-white/10 rounded-3xl p-6 space-y-3 animate-pulse">
          <div className="h-3 w-24 bg-white/10 rounded-md" />
          <div className="h-8 w-32 bg-white/15 rounded-lg" />
          <div className="h-3 w-20 bg-white/5 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-[#0A0A1B] border border-white/10 rounded-3xl p-6 space-y-4 animate-pulse">
      <div className="h-6 w-40 bg-white/10 rounded-md mb-6" />
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-between py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/5 rounded-xl" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-36 bg-white/10 rounded-md" />
              <div className="h-2.5 w-24 bg-white/5 rounded-md" />
            </div>
          </div>
          <div className="h-4 w-16 bg-white/10 rounded-md" />
        </div>
      ))}
    </div>
  );
}
