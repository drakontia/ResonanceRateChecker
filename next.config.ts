import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    unoptimized: false,
  },
  experimental: {
    cacheComponents: true,
  },
};

export default nextConfig;
