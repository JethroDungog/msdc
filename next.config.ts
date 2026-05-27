import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow images from local public folder (default) and any external sources
    remotePatterns: [],
  },
};

export default nextConfig;
