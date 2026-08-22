import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // packages/db ships TypeScript source rather than a build step, so Next has
  // to compile it the same way it compiles this app's own files.
  transpilePackages: ["@founder10x/db"],
  images: {
    // next/image always puts the LARGEST deviceSize in the <img src> fallback.
    // Clients that don't evaluate srcset/sizes (crawlers, scrapers, preview
    // bots) fetch that fallback, so this cap is the real ceiling on what a
    // non-browser request can pull. Nothing here renders wider than ~850 CSS
    // px, so the default 1920/2048/3840 tiers were pure cost with no benefit.
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
};

export default nextConfig;
