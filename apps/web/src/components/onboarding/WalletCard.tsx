import React from 'react';

interface WalletCardProps {
  name: string;
  icon: React.ReactNode;
  isSelected?: boolean;
  onSelect: () => void;
}

export const WalletCard = ({
  name,
  icon,
  isSelected,
  onSelect,
}: WalletCardProps) => {
  return (
    <div
      onClick={onSelect}
      className={`relative group cursor-pointer flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 rounded-2xl border transition-all duration-300 bg-black/20 ${
        isSelected
          ? 'border-accent-purple bg-accent-purple/10 shadow-[0_0_20px_rgba(139,92,246,0.2)]'
          : 'border-white/5 hover:border-white/20'
      }`}
    >
      <div className="mb-2 sm:mb-4 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center filter group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className={`text-xs sm:text-sm md:text-base font-bold tracking-tight text-center truncate w-full ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
        {name}
      </h3>
    </div>
  );
};
