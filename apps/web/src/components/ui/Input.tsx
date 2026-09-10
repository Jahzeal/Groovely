'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  className?: string;
}

export function Input({
  label,
  error,
  icon,
  trailingIcon,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-2 w-full text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-bold uppercase tracking-widest text-zinc-400"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-4 text-zinc-400 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-[#0A0A1B] border ${
            error ? 'border-red-500/70 focus:ring-red-500/50' : 'border-white/10 focus:border-accent-purple focus:ring-accent-purple/30'
          } rounded-2xl ${icon ? 'pl-11' : 'pl-4'} ${
            trailingIcon ? 'pr-11' : 'pr-4'
          } py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all duration-200 ${className}`}
          {...props}
        />
        {trailingIcon && (
          <div className="absolute right-4 text-zinc-400 flex items-center justify-center">
            {trailingIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400 font-medium animate-in fade-in duration-150">
          {error}
        </p>
      )}
    </div>
  );
}
