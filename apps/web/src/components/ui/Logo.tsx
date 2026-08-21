import React from 'react';

interface LogoProps {
  className?: string;
  heightClass?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  heightClass = 'h-10 sm:h-12',
  onClick,
}) => {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 group cursor-pointer transition-all hover:opacity-90 active:scale-[0.98] ${className}`}
    >
      <img
        src="/logo.png"
        alt="GROOVELI NETWORK TECHNOLOGY LTD"
        className={`${heightClass} w-auto object-contain drop-shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-transform duration-300 group-hover:scale-105`}
      />
    </div>
  );
};

