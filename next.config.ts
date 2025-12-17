import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  experimental: { nextScriptWorkers: false },
  // DevTools puede desactivarse así en 15.x:
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      }
    ],
  },
};

export default nextConfig;
