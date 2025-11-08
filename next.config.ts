import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  experimental: { nextScriptWorkers: false },
  // DevTools puede desactivarse así en 15.x:
  /* config options here */
  images: {
    domains: ["images.unsplash.com","images.pexels.com","upload.wikimedia.org"],
    remotePatterns: [
      {
        hostname: "res.cloudinary.com",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
