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
};

export default nextConfig;
