import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false
  },
  experimental: {
    turbo: false
  },
  images: {
    unoptimized: true
  }
};

export default nextConfig;
