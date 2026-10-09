import { env } from "@/lib/env";

/**
 * Only the production deployment may be indexed. Vercel preview deployments
 * (VERCEL_ENV=preview) serve the same content on other hostnames and would
 * otherwise compete with the real domain as duplicate content.
 */
export const isIndexable = !env.vercelEnv || env.vercelEnv === "production";

export const siteConfig = {
  name: "CoinPulse",
  tagline: "Real-time crypto market intelligence",
  description:
    "Track live crypto prices, market caps and 24h moves. Search and filter the top 250 assets, build a personal watchlist and follow a real-time price stream.",
  /** From NEXT_PUBLIC_SITE_URL: canonical URLs, Open Graph, sitemap and robots all point here. */
  get url() {
    return env.siteUrl;
  },
  logo: "/icon-512.png",
} as const;

/**
 * Next.js replaces (does not merge) a parent's `openGraph` object when a page
 * sets its own, so every page override spreads these in.
 */
export const openGraphDefaults = {
  type: "website",
  siteName: siteConfig.name,
  locale: "en_US",
} as const;

export function absoluteUrl(path = "/"): string {
  return new URL(path, siteConfig.url).toString();
}
