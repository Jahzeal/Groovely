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
      className={`relative group cursor-pointer flex flex-col items-center justify-center p-8 rounded-2xl border transition-all duration-300 bg-black/20 ${
        isSelected
          ? 'border-accent-purple bg-accent-purple/10'
          : 'border-white/5 hover:border-white/20'
      }`}
    >
      <div className="mb-4 w-16 h-16 flex items-center justify-center filter group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className={`text-base font-bold tracking-tight text-center ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
        {name}
      </h3>
    </div>
  );
};
