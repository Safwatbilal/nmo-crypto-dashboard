/**
 * Domain types used across the app. External API shapes live in
 * `types/coingecko.ts` / `types/binance.ts` and are mapped into these
 * so UI code never depends on (or null-checks) raw upstream payloads.
 */

export interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string | null;
  rank: number | null;
  price: number | null;
  marketCap: number | null;
  volume24h: number | null;
  change24h: number | null;
  change7d: number | null;
}

export interface GlobalStats {
  totalMarketCapUsd: number | null;
  totalVolumeUsd: number | null;
  marketCapChange24h: number | null;
  btcDominance: number | null;
  ethDominance: number | null;
  activeCryptocurrencies: number | null;
}

export interface PricePoint {
  /** Unix epoch in ms. */
  t: number;
  price: number;
}

export interface AssetDetail {
  id: string;
  symbol: string;
  name: string;
  image: string | null;
  rank: number | null;
  description: string | null;
  homepage: string | null;
  explorer: string | null;
  categories: string[];
  genesisDate: string | null;
  hashingAlgorithm: string | null;
  lastUpdated: string | null;
  market: {
    price: number | null;
    marketCap: number | null;
    fullyDilutedValuation: number | null;
    volume24h: number | null;
    high24h: number | null;
    low24h: number | null;
    change24h: number | null;
    change7d: number | null;
    change30d: number | null;
    change1y: number | null;
    circulatingSupply: number | null;
    totalSupply: number | null;
    maxSupply: number | null;
    ath: number | null;
    athDate: string | null;
    atl: number | null;
    atlDate: string | null;
  };
  /** Hourly prices over the last 7 days (CoinGecko sparkline). */
  sparkline7d: PricePoint[];
}

export const SORT_KEYS = [
  "market_cap",
  "volume",
  "gainers",
  "losers",
  "price",
  "name",
] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export const CHANGE_FILTERS = ["all", "gainers", "losers", "watchlist"] as const;
export type ChangeFilter = (typeof CHANGE_FILTERS)[number];

/** URL-serialisable state of the market explorer. */
export interface MarketQuery {
  q: string;
  sort: SortKey;
  filter: ChangeFilter;
  page: number;
}
