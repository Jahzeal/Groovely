import React from 'react';

interface SelectionCardProps {
  title: string;
  imageSrc?: string;
  onSelect: () => void;
  isSelected?: boolean;
}

export const SelectionCard = ({
  title,
  imageSrc,
  onSelect,
  isSelected,
}: SelectionCardProps) => {
  return (
    <div
      onClick={onSelect}
      className={`relative group cursor-pointer flex flex-col items-center p-8 rounded-[32px] border-2 transition-all duration-300 bg-white/5 ${
        isSelected
          ? 'border-accent-purple bg-accent-purple/5'
          : 'border-white/5 hover:border-white/20'
      }`}
    >
      {/* Info Icon */}
      <div className="absolute top-4 right-4 text-zinc-600 hover:text-zinc-400">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </div>

      {/* Profile Image Circle */}
      <div className="mb-8 p-1 rounded-full border border-white/10 group-hover:border-accent-purple/30 transition-colors">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-zinc-800">
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      </div>

      <h3 className={`text-xl font-bold tracking-tight text-center ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
        {title}
      </h3>
    </div>
  );
};
