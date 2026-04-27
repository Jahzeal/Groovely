import React from 'react';

export const Logo = () => {
  return (
    <div className="flex items-center gap-3 group cursor-pointer transition-all hover:opacity-80">
      <img
        src="/logo.png"
        alt="Groovely"
        className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]"
      />
    </div>
  );
};
