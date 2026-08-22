import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@tanstack/react-query',
    ],
  },
  // API requests are proxied to the backend via src/app/api/[...path]/route.ts
  // No rewrites needed here.
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
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://auth.privy.io https://*.privy.io https://*.walletconnect.com https://*.walletconnect.org; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; frame-src 'self' https://auth.privy.io https://*.privy.io https://verify.walletconnect.com https://verify.walletconnect.org; connect-src 'self' https://auth.privy.io https://*.privy.io https://*.walletconnect.com https://*.walletconnect.org wss://*.walletconnect.com wss://*.walletconnect.org wss://*.privy.io https://groovely-ttyi.onrender.com https://groovelinetwork.com https://*.alchemy.com https://*.polygon.technology https://polygon-rpc.com https://api.cloudinary.com https://*.pinata.cloud https://cloudflare-ipfs.com http://localhost:*; media-src 'self' blob: https:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
