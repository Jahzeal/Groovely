import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API requests are proxied to the backend via src/app/api/[...path]/route.ts
  // No rewrites needed here.
  webpack(config) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
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
            value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://auth.privy.io; frame-src 'self' https://auth.privy.io;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
