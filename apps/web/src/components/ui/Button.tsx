import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) => {
  const baseStyles = 'px-6 py-3.5 rounded-2xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-accent-purple text-white hover:bg-opacity-90 shadow-[0_0_20px_rgba(157,0,255,0.3)] hover:shadow-[0_0_30px_rgba(157,0,255,0.5)]',
    secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/10',
    ghost: 'bg-transparent text-zinc-400 hover:text-white',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
