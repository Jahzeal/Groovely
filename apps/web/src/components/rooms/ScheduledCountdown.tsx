'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ScheduledCountdownProps {
  targetDate: string;
  className?: string;
  compact?: boolean;
}

export const ScheduledCountdown: React.FC<ScheduledCountdownProps> = ({ 
  targetDate, 
  className = '',
  compact = false 
}) => {
  const [timeLeft, setTimeLeft] = useState<{ 
    days: number; 
    hours: number; 
    minutes: number; 
    seconds: number; 
    isPast: boolean 
  }>({
    days: 0, 
    hours: 0, 
    minutes: 0, 
    seconds: 0, 
    isPast: false
  });

  useEffect(() => {
    const calculate = () => {
      if (!targetDate) return;
      const target = new Date(targetDate).getTime();
      const now = Date.now();
      const diff = target - now;

      if (isNaN(target) || diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isPast) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-bold uppercase tracking-wider ${className}`}>
        <Clock size={12} className="animate-spin text-amber-400" />
        <span>Starting Soon</span>
      </span>
    );
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-400 ${className}`}>
        <Clock size={12} className="text-cyan-400 animate-pulse" />
        <span>
          {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
          {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-lg ${className}`}>
      <Clock size={13} className="text-cyan-400 animate-pulse" />
      <span>
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
        {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
      </span>
    </div>
  );
};
