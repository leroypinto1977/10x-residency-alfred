import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // packages/db ships TypeScript source rather than a build step.
  transpilePackages: ["@founder10x/db"],
};

export default nextConfig;
