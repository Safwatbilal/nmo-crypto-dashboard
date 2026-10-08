import { useCallback, useEffect, useMemo, useState } from "react";
import type { MarketCoin } from "@/types/market";

/** `null` marks an id the provider returned no data for (e.g. delisted). */
type CoinCache = ReadonlyMap<string, MarketCoin | null>;

export interface WatchlistMarkets {
  coins: CoinCache;
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
}

async function fetchMarkets(ids: string[], signal: AbortSignal): Promise<MarketCoin[]> {
  const response = await fetch(`/api/markets?ids=${encodeURIComponent(ids.join(","))}`, { signal });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  const body: unknown = await response.json();
  const coins = (body as { coins?: unknown }).coins;
  if (!Array.isArray(coins)) throw new Error("Malformed response");
  return coins as MarketCoin[];
}

/**
 * Loads market rows for watchlist ids through our own API route.
 *
 * Plain fetch + local state rather than RTK Query: this is the only
 * client-side request in the app, its result is used by one component, and it
 * needs no cache sharing, polling or invalidation — so a query cache would add
 * bundle weight without a consumer.
 *
 * Only ids not already loaded are requested: removing an asset never
 * refetches, adding one fetches just that one.
 */
export function useWatchlistMarkets(ids: readonly string[], enabled: boolean): WatchlistMarkets {
  const [coins, setCoins] = useState<CoinCache>(() => new Map());
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const missingKey = useMemo(() => ids.filter((id) => !coins.has(id)).sort().join(","), [ids, coins]);

  useEffect(() => {
    if (!enabled || !missingKey || failedKey === missingKey) return;
    const requested = missingKey.split(",");
    const controller = new AbortController();

    fetchMarkets(requested, controller.signal)
      .then((result) => {
        setCoins((previous) => {
          const next = new Map(previous);
          const byId = new Map(result.map((coin) => [coin.id, coin]));
          for (const id of requested) next.set(id, byId.get(id) ?? null);
          return next;
        });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error("[watchlist] failed to load market data", error);
          setFailedKey(missingKey);
        }
      });

    return () => controller.abort();
  }, [enabled, missingKey, failedKey, retryToken]);

  const retry = useCallback(() => {
    setFailedKey(null);
    setRetryToken((token) => token + 1);
  }, []);

  const isError = missingKey !== "" && failedKey === missingKey;
  return { coins, isError, isLoading: enabled && missingKey !== "" && !isError, retry };
}
