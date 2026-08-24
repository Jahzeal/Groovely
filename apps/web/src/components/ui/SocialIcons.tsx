import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const Twitter = ({ size = 24, ...props }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

export const Instagram = ({ size = 24, ...props }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export const SoundCloud = ({ size = 24, ...props }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path d="M11.53 11v6c0 .54-.45 1-1.01 1-.56 0-1.02-.46-1.02-1v-6c0-.52.46-.95 1.02-.95.56 0 1.01.43 1.01.95zm-2.93-1.6c.55 0 1 .42 1 .94v7.6c0 .53-.45.95-1 .95s-1-.42-1-.95v-7.6c0-.52.45-.94 1-.94zm-2.82 2.6c.53 0 .96.42.96.95v4.56c0 .54-.43.96-.96.96-.53 0-.97-.42-.97-.96v-4.56c0-.53.44-.95.97-.95zm14.86-.3c.4 0 .76.15 1.05.4.3.26.49.63.49 1.04v1.89c0 .41-.19.78-.49 1.04-.29.25-.65.4-1.05.4H10.42v-5.6h1.2v-2.3c0-.3.26-.54.58-.54.3 0 .58.24.58.54v2.3h1.2s.22-3.32 1.46-3.32c.5 0 .95.2 1.33.53.5-.66 1.34-1.12 2.29-1.12 1.54 0 2.8 1.14 2.8 2.54v.9h.8zM2.87 13.9c.52 0 .95.42.95.95v1.44c0 .53-.43.95-.95.95s-.95-.42-.95-.95v-1.44c0-.52.43-.95.95-.95Z" />
  </svg>
);

export const Polygon = ({ size = 24, ...props }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path d="M16.7 19.3l-4.7 2.7c-.3.2-.7.2-1 0l-4.7-2.7c-.3-.2-.5-.5-.5-.8v-5.4c0-.3.2-.6.5-.8l4.7-2.7c.3-.2.7-.2 1 0l4.7 2.7c.3.2.5.5.5.8v5.4c0 .3-.2.6-.5.8zM12 2l-4.7 2.7c-.3.2-.5.5-.5.8v5.4c0 .3.2.6.5.8l4.7 2.7c.3.2.7.2 1 0l4.7-2.7c.3-.2.5-.5.5-.8V5.5c0-.3-.2-.6-.5-.8L13 2c-.3-.2-.7-.2-1 0z"/>
  </svg>
);

export const Solana = ({ size = 24, ...props }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path d="M4.1 14.1l1.1-2.2c.1-.2.4-.4.6-.4H20c.4 0 .6.4.4.8l-1.1 2.2c-.1.2-.4.4-.6.4H4.5c-.4 0-.6-.4-.4-.8zm15.8-10c.1-.2-.1-.6-.5-.6H3.6c-.2 0-.5.1-.6.4l-1.1 2.2c-.1.2.1.6.5.6H17.2c.2 0 .5-.1.6-.4l2.1-4.2zm-15.8 16c-.1.2.1.6.5.6H20.4c.2 0 .5-.1.6-.4l1.1-2.2c.1-.2-.1-.6-.5-.6H6.8c-.2 0-.5.1-.6.4l-2.1 4.2z"/>
  </svg>
);

export const Ethereum = ({ size = 24, ...props }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path d="M11.94 2L11.75 2.66V16.33L11.94 16.52L17.9 12.98L11.94 2Z" fillOpacity="0.8"/>
    <path d="M11.94 2L5.97 12.98L11.94 16.52V2Z" fillOpacity="0.45"/>
    <path d="M11.94 17.51L11.83 17.65V21.75L11.94 22L17.91 13.98L11.94 17.51Z" fillOpacity="0.8"/>
    <path d="M11.94 22V17.51L5.97 13.98L11.94 22Z" fillOpacity="0.45"/>
    <path d="M11.94 16.52L17.9 12.98L11.94 9.4L11.94 16.52Z" fillOpacity="0.45"/>
    <path d="M5.97 12.98L11.94 16.52V9.4L5.97 12.98Z" fillOpacity="0.8"/>
  </svg>
);

export const Google = ({ size = 24, ...props }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    {...props}
  >
    <path 
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" 
      fill="#4285F4" 
    />
    <path 
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" 
      fill="#34A853" 
    />
    <path 
      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" 
      fill="#FBBC05" 
    />
    <path 
      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" 
      fill="#EA4335" 
    />
  </svg>
);

export const YouTube = ({ size = 24, ...props }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export const OpenSea = ({ size = 24, ...props }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path d="M12 0C5.373 0 0 5.373 0 12c0 4.908 2.95 9.123 7.185 10.98a.5.5 0 0 0 .615-.494v-3.79c0-.4-.2-.77-.54-.99a4.89 4.89 0 0 1-2.06-4.05c0-2.7 2.2-4.9 4.9-4.9.46 0 .9.07 1.32.19.3.09.62-.05.77-.32l.87-1.58c.2-.37.66-.51 1.03-.31.3.16.51.46.54.8l.21 2.37c.05.53.47.95 1 .98 2.55.15 4.56 2.27 4.56 4.85 0 1.63-.8 3.08-2.03 3.98-.33.24-.52.63-.5.1.04v3.83c0 .32.32.55.62.45C21.04 21.13 24 16.91 24 12c0-6.627-5.373-12-12-12zm-1.8 14.5l-2.4 1.4 2.4-5.2v3.8zm3.6 0v-3.8l2.4 5.2-2.4-1.4z"/>
  </svg>
);


