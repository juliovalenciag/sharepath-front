import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  experimental: { nextScriptWorkers: false },
  // DevTools puede desactivarse así en 15.x:
  /* config options here */
  images: {
    domains: [
      "images.unsplash.com",
      "images.pexels.com",
      "upload.wikimedia.org",
      "www.museosdemexico.com",
      "dynamic-media-cdn.tripadvisor.com",
      "media.traveler.es"
    ],
    remotePatterns: [
      {
        hostname: "res.cloudinary.com",
        protocol: "https",
      },
      {
        hostname: "harol-lovers.up.railway.app",
        protocol: "https"
      }
    ],
  },
};

export default nextConfig;
