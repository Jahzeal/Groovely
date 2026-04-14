import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/marketplace',
        destination: '/dashboard/marketplace',
        permanent: false,
      },
      {
        source: '/explore',
        destination: '/dashboard/explore',
        permanent: false,
      },
    ];
  },
  // API requests are proxied to the backend via src/app/api/[...path]/route.ts
  // No rewrites needed here.
};

export default nextConfig;

