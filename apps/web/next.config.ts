import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@tanstack/react-query',
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://groovely-ttyi.onrender.com/api/:path*',
      },
    ];
  },
  webpack(config) {
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@farcaster/mini-app-solana': false,
      '@farcaster/frame-sdk': false,
    };
    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://auth.privy.io https://*.privy.io https://*.privy.systems https://*.walletconnect.com https://*.walletconnect.org https://verify.walletconnect.com https://verify.walletconnect.org; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; frame-src 'self' https://auth.privy.io https://*.privy.io https://*.privy.systems https://verify.walletconnect.com https://verify.walletconnect.org; connect-src 'self' https://auth.privy.io https://*.privy.io https://*.privy.systems wss://*.privy.io wss://*.privy.systems https://*.walletconnect.com https://*.walletconnect.org wss://*.walletconnect.com wss://*.walletconnect.org https://groovely-ttyi.onrender.com https://groovelinetwork.com https://*.publicnode.com https://*.zerodev.app https://*.alchemy.com https://*.alchemyapi.io https://*.polygon.technology https://polygon-rpc.com https://rpc.ankr.com https://*.drpc.org https://*.llamarpc.com https://*.quicknode.pro https://api.cloudinary.com https://*.pinata.cloud https://cloudflare-ipfs.com https://ipfs.io https://*.ipfs.dweb.link http://localhost:*; media-src 'self' blob: https:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
