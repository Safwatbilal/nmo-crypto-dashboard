"use client";

import { IconRenderer } from "@/assets/icons/iconRenderer";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import type { Ref } from "react";
import { LivePrice } from "@/components/live/live-price";
import { buttonVariants, Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CoinAvatar } from "@/components/ui/coin-avatar";
import { RetryPanel } from "@/components/ui/retry-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { StatePanel } from "@/components/ui/state-panel";
import { TrendBadge } from "@/components/ui/trend-badge";
import { useLiveTicker } from "@/hooks/use-live-ticker";
import { useWatchlistMarkets } from "@/hooks/use-watchlist-markets";
import { getLiveSymbolForCoin } from "@/lib/live/symbols";
import { formatCompactUsd, formatPrice } from "@/lib/utils/format";
import {
  selectIsWatchlistHydrated,
  selectWatchlistIds,
  watchlistCleared,
  watchlistRemoved,
} from "@/store/features/watchlistSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { MarketCoin } from "@/types/market";

function LiveOrStaticPrice({ coin }: { coin: MarketCoin }) {
  const liveSymbol = getLiveSymbolForCoin(coin.id);
  const ticker = useLiveTicker(liveSymbol);
  if (ticker) return <LivePrice ticker={ticker} className="text-lg font-semibold" />;
  return <span className="text-lg font-semibold tabular">{formatPrice(coin.price)}</span>;
}

interface WatchlistCardProps {
  id: string;
  /** `undefined` while loading, `null` when the provider has no data. */
  coin: MarketCoin | null | undefined;
  onRemove: (id: string) => void;
  /** Required by AnimatePresence `popLayout`. */
  ref?: Ref<HTMLLIElement>;
}

function WatchlistCard({ id, coin, onRemove, ref }: WatchlistCardProps) {
  return (
    <m.li
      ref={ref}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          {coin ? (
            <Link href={`/market/${coin.id}`} className="flex min-w-0 items-center gap-3 rounded-md">
              <CoinAvatar src={coin.image} symbol={coin.symbol} size={36} />
              <span className="min-w-0">
                <span className="block truncate font-medium hover:underline">{coin.name}</span>
                <span className="text-xs text-muted-foreground">
                  {coin.symbol} · Rank #{coin.rank ?? "—"}
                </span>
              </span>
            </Link>
          ) : coin === null ? (
            <span className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{id}</span> — data unavailable
            </span>
          ) : (
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onRemove(id)}
            aria-label={`Remove ${coin?.name ?? id} from watchlist`}
            className="text-muted-foreground"
          >
            <IconRenderer name="bin_outlined" aria-hidden className="size-4" />
          </Button>
        </div>
        {coin && (
          <div className="mt-auto flex items-end justify-between gap-2">
            <div className="flex flex-col">
              <LiveOrStaticPrice coin={coin} />
              <span className="text-xs text-muted-foreground">Mkt cap {formatCompactUsd(coin.marketCap)}</span>
            </div>
            <TrendBadge value={coin.change24h} variant="pill" />
          </div>
        )}
      </Card>
    </m.li>
  );
}

export function WatchlistView() {
  const dispatch = useAppDispatch();
  const ids = useAppSelector(selectWatchlistIds);
  const hydrated = useAppSelector(selectIsWatchlistHydrated);
  const { coins, isError, retry } = useWatchlistMarkets(ids, hydrated);

  const remove = (id: string) => dispatch(watchlistRemoved(id));

  if (!hydrated) {
    return (
      <ul aria-busy="true" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <li key={i}>
            <Skeleton className="h-36 rounded-2xl" />
          </li>
        ))}
      </ul>
    );
  }

  if (ids.length === 0) {
    return (
      <Card>
        <StatePanel
          icon="star_outlined"
          title="No assets saved yet"
          description="Star any asset in the market overview or on its detail page and it will appear here. Your watchlist is stored in this browser."
          action={
            <Link href="/" className={buttonVariants()}>
              Explore the market
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {ids.length} {ids.length === 1 ? "asset" : "assets"} saved
        </p>
        <Button variant="ghost" size="sm" onClick={() => dispatch(watchlistCleared())}>
          Clear all
        </Button>
      </div>

      {isError && (
        <Card>
          <RetryPanel title="Couldn't load prices for your watchlist" onRetry={retry} />
        </Card>
      )}

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence initial={false} mode="popLayout">
          {ids.map((id) => (
            <WatchlistCard key={id} id={id} coin={isError && !coins.has(id) ? null : coins.get(id)} onRemove={remove} />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
