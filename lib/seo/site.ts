/** The public production domain: canonical URLs, Open Graph, sitemap and robots all point here. */
const PRODUCTION_URL = "https://nmo-crypto-dashboard.vercel.app";

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL || process.env.NODE_ENV === "production") return PRODUCTION_URL;
  return "http://localhost:3000";
}

/**
 * Only the production deployment may be indexed. Vercel preview deployments
 * (VERCEL_ENV=preview) serve the same content on other hostnames and would
 * otherwise compete with the real domain as duplicate content.
 */
export const isIndexable = !process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production";

export const siteConfig = {
  name: "CoinPulse",
  tagline: "Real-time crypto market intelligence",
  description:
    "Track live crypto prices, market caps and 24h moves. Search and filter the top 250 assets, build a personal watchlist and follow a real-time price stream.",
  url: resolveSiteUrl(),
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
