import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only set allowedDevOrigins when running on Replit
  ...(process.env.REPLIT_DOMAINS && {
    allowedDevOrigins: [process.env.REPLIT_DOMAINS.split(",")[0]],
  }),
};

export default nextConfig;
