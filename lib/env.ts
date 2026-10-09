/**
 * Environment variables safe to read from both server and browser code.
 * All values come from `.env.local` (see `.env.example`) — nothing is hardcoded.
 * `NEXT_PUBLIC_*` values are inlined at build time, so each one must be read
 * as a literal `process.env.NAME` expression. Secrets live in `env.server.ts`.
 */

export function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing environment variable: ${name} (see .env.example)`);
  return value;
}

export const env = {
  /** Public base URL for canonical URLs, Open Graph, sitemap and robots. */
  get siteUrl() {
    return required("NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL).replace(/\/$/, "");
  },
  /** Binance public market-data WebSocket. */
  get binanceWsUrl() {
    return required("NEXT_PUBLIC_BINANCE_WS_URL", process.env.NEXT_PUBLIC_BINANCE_WS_URL);
  },
  /** Set by Vercel: "production" | "preview" | "development". */
  vercelEnv: process.env.VERCEL_ENV,
};
