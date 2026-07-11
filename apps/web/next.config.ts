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
};

export default nextConfig;
