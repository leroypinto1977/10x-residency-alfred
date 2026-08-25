import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // packages/db and packages/meta ship TypeScript source rather than a build step.
  transpilePackages: ["@founder10x/db", "@founder10x/meta"],
};

export default nextConfig;
