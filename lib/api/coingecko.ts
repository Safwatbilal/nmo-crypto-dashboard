import "server-only";

import { cache } from "react";
import type { CoinGeckoCoin, CoinGeckoGlobal, CoinGeckoMarket } from "@/types/coingecko";
import type { AssetDetail, GlobalStats, MarketCoin } from "@/types/market";
import { serverEnv } from "@/lib/env.server";
import { fetchJson } from "./http";
import { mapAssetDetail, mapGlobalStats, mapMarketCoin } from "./mappers";

/**
 * CoinGecko data access. Server-only: the optional demo API key never reaches
 * the browser, and every request goes through the Next.js Data Cache so the
 * free-tier rate limit is shared by all visitors instead of hit per request.
 */

const BASE_URL = serverEnv.coingeckoApiBaseUrl;
const API_KEY = serverEnv.coingeckoApiKey;

/** Revalidation windows (seconds) — see README → "Caching". */
export const REVALIDATE = {
  markets: 60,
  global: 300,
  asset: 300,
} as const;

export const MARKET_UNIVERSE_SIZE = 250;
export const ASSET_ID_PATTERN = /^[a-z0-9-]{1,100}$/;

function request(path: string, params: Record<string, string>, revalidate: number, tags: string[]) {
  const url = `${BASE_URL}${path}?${new URLSearchParams(params)}`;
  const init: RequestInit = {
    headers: {
      accept: "application/json",
      ...(API_KEY ? { "x-cg-demo-api-key": API_KEY } : {}),
    },
    next: { revalidate, tags },
  };
  return { url, init };
}

/** Top assets by market cap — the universe the market explorer works on. */
export const getMarkets = cache(async (): Promise<MarketCoin[]> => {
  const { url, init } = request(
    "/coins/markets",
    {
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: String(MARKET_UNIVERSE_SIZE),
      page: "1",
      sparkline: "false",
      price_change_percentage: "24h,7d",
    },
    REVALIDATE.markets,
    ["markets"],
  );
  const raw = await fetchJson<CoinGeckoMarket[]>(url, { init });
  return raw.map(mapMarketCoin);
});

export const getGlobalStats = cache(async (): Promise<GlobalStats> => {
  const { url, init } = request("/global", {}, REVALIDATE.global, ["global"]);
  return mapGlobalStats(await fetchJson<CoinGeckoGlobal>(url, { init }));
});

/** Returns `null` for unknown ids so the page can render a proper 404. */
export const getAsset = cache(async (id: string): Promise<AssetDetail | null> => {
  if (!ASSET_ID_PATTERN.test(id)) return null;
  const { url, init } = request(
    `/coins/${encodeURIComponent(id)}`,
    {
      localization: "false",
      tickers: "false",
      community_data: "false",
      developer_data: "false",
      sparkline: "true",
    },
    REVALIDATE.asset,
    ["asset", `asset:${id}`],
  );
  const raw = await fetchJson<CoinGeckoCoin>(url, { init, allowNotFound: true });
  return raw ? mapAssetDetail(raw) : null;
});

/** Market rows for a specific set of ids (watchlist). */
export async function getMarketsByIds(ids: string[]): Promise<MarketCoin[]> {
  if (ids.length === 0) return [];
  const sorted = [...ids].sort();
  const { url, init } = request(
    "/coins/markets",
    {
      vs_currency: "usd",
      ids: sorted.join(","),
      per_page: String(sorted.length),
      sparkline: "false",
      price_change_percentage: "24h,7d",
    },
    REVALIDATE.markets,
    ["markets"],
  );
  const raw = await fetchJson<CoinGeckoMarket[]>(url, { init });
  return raw.map(mapMarketCoin);
}
