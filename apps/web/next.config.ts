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
            value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://auth.privy.io; frame-src 'self' https://auth.privy.io; connect-src 'self' https://auth.privy.io https://*.privy.io https://groovely-ttyi.onrender.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
