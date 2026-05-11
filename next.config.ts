import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Avoid monorepo root inference warnings on deploy/dev.
    root: __dirname,
  },
};

export default nextConfig;
