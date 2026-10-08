function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const siteConfig = {
  name: "CoinPulse",
  tagline: "Real-time crypto market intelligence",
  description:
    "Track live crypto prices, market caps and 24h moves. Search and filter the top 250 assets, build a personal watchlist and follow a real-time price stream.",
  url: resolveSiteUrl(),
} as const;

export function absoluteUrl(path = "/"): string {
  return new URL(path, siteConfig.url).toString();
}
