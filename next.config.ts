import type { NextConfig } from "next";

process.env.TZ = "Asia/Jakarta";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
