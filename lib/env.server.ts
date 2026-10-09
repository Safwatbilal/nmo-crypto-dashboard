import "server-only";

import { required } from "./env";

/** Server-only environment variables — importing this from client code fails the build. */

export const serverEnv = {
  /** CoinGecko REST API base URL. */
  get coingeckoApiBaseUrl() {
    return required("COINGECKO_API_BASE_URL", process.env.COINGECKO_API_BASE_URL);
  },
  /** Optional CoinGecko "Demo" API key (raises the public rate limit). */
  coingeckoApiKey: process.env.COINGECKO_API_KEY || undefined,

  /** Optional search engine ownership verification meta tag values. */
  googleSiteVerification: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  bingSiteVerification: process.env.BING_SITE_VERIFICATION || undefined,
};
