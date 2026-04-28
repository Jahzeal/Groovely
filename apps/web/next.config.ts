import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API requests are proxied to the backend via src/app/api/[...path]/route.ts
  // No rewrites needed here.
};

export default nextConfig;
