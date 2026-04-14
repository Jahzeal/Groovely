import React from 'react';

interface CreatorCardProps {
  name: string;
  role: string;
  image: string;
  isFollowing?: boolean;
}

export const CreatorCard = ({ name, role, image, isFollowing = false }: CreatorCardProps) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-[140px] h-[140px] rounded-full overflow-hidden border border-white/5 hover:border-accent-purple/50 transition-colors duration-300 cursor-pointer relative group">
        <img src={image} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-black text-white">{name}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-zinc-300">{role}</span>
      </div>

      <button className={`w-[100px] py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
        isFollowing 
        ? 'bg-transparent border border-white/20 text-white' 
        : 'bg-accent-purple text-white hover:bg-opacity-90 shadow-[0_0_12px_rgba(139,92,246,0.35)]'
      }`}>
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  );
};
