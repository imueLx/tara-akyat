import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.NODE_ENV === "development"
    ? { allowedDevOrigins: ["192.168.254.123"] }
    : {}),
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 31,
    qualities: [70, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "commons.wikimedia.org",
      },
    ],
  },
};

export default nextConfig;
