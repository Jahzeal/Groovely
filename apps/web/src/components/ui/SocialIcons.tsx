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
