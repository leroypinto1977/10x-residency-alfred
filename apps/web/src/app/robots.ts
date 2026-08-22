import type { MetadataRoute } from "next";

// The image optimizer was hit ~64k times by non-browser clients, which is what
// drove the July 26 bandwidth spike. Well-behaved crawlers have no reason to
// walk /_next/image — the pages that embed those images are still crawlable.
// This only covers bots that respect robots.txt; abusive ones need a WAF rule.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/_next/image", "/admin", "/api"],
    },
  };
}
