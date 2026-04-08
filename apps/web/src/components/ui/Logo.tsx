import React from 'react';

export const Logo = () => {
  return (
    <div className="flex items-center gap-1.5 group cursor-pointer">
      <div className="flex items-baseline">
        <span className="text-2xl font-black tracking-tight text-white">Groove</span>
        <div className="relative mx-0.5 transform -translate-y-0.5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent-purple"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <span className="text-2xl font-black tracking-tight text-white">y</span>
      </div>
    </div>
  );
};
