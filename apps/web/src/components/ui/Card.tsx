'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'interactive' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantStyles = {
    default: 'bg-[#0A0A1B] border border-white/10 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]',
    glass: 'bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl',
    interactive: 'bg-[#0A0A1B] border border-white/10 hover:border-accent-purple/50 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-accent-purple/10',
    outline: 'bg-transparent border border-white/15 hover:border-white/30 transition-colors',
  };

  return (
    <div
      className={`rounded-3xl ${paddingStyles[padding]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
