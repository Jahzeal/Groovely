'use client';

import React from 'react';
import { Music2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
  className?: string;
}

export function EmptyState({
  icon = <Music2 size={36} className="text-accent-purple" />,
  title,
  description,
  actionText,
  actionHref,
  onActionClick,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`bg-[#0A0A1B] border border-white/10 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto ${className}`}
    >
      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl shadow-inner">
        {icon}
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-black text-white tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed max-w-xs mx-auto">
          {description}
        </p>
      </div>

      {actionText && (
        <div className="pt-2">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-purple to-accent-cyan hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-accent-purple/20 transition-all duration-200"
            >
              <span>{actionText}</span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <button
              onClick={onActionClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-purple to-accent-cyan hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-accent-purple/20 transition-all duration-200"
            >
              <span>{actionText}</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
