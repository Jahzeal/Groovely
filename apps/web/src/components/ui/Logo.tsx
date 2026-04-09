import React from 'react';

export const Logo = () => {
  return (
    <div className="flex items-center gap-3 group cursor-pointer transition-all hover:opacity-80">
      <div className="w-8 h-8 rounded-lg bg-accent-purple flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 22C12 22 17 19 17 13C17 10 15 8 13 8C11 8 9 9 9 12C9 14 11 15 12 14.5C13 14 13.5 13 13 12.5C12.5 12 11 12 11 13.5C11 16 14 18 14 18V2C14 1 13 0 12 0C11 0 10 1 10 2V18C10 18 7 16 7 13C7 11 8.5 9 11 9C12 9 13 10 13 11C13 11.5 12.5 12 12 12C11.5 12 11 11.5 11 11" fill="white"/>
        </svg>
      </div>
      <span className="text-xl font-bold tracking-tight text-white">Groovely</span>
    </div>
  );
};
