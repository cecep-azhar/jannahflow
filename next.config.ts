import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

process.env.TZ = "Asia/Jakarta";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {},
};

export default withSerwist(nextConfig);
