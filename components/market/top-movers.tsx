import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CoinAvatar } from "@/components/ui/coin-avatar";
import { LinkPending } from "@/components/ui/link-pending";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendBadge } from "@/components/ui/trend-badge";
import { formatPrice } from "@/lib/utils/format";
import type { MarketCoin } from "@/types/market";

/** Movers are drawn from the top 100 so illiquid micro-caps don't dominate. */
const MOVERS_UNIVERSE = 100;
const MOVERS_COUNT = 3;

export function getTopMovers(coins: readonly MarketCoin[]) {
  const ranked = coins
    .slice(0, MOVERS_UNIVERSE)
    .filter((coin): coin is MarketCoin & { change24h: number } => coin.change24h !== null)
    .sort((a, b) => b.change24h - a.change24h);
  return {
    gainers: ranked.slice(0, MOVERS_COUNT),
    losers: ranked.slice(-MOVERS_COUNT).reverse(),
  };
}

function MoverList({ title, coins }: { title: string; coins: MarketCoin[] }) {
  return (
    <div>
      <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</h3>
      <ul>
        {coins.map((coin) => (
          <li key={coin.id}>
            <Link
              href={`/market/${coin.id}`}
              className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted"
            >
              <CoinAvatar src={coin.image} symbol={coin.symbol} size={24} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{coin.name}</span>
              <span className="text-xs text-muted-foreground tabular">{formatPrice(coin.price)}</span>
              <TrendBadge value={coin.change24h} variant="pill" className="w-[4.75rem] justify-end" />
              <LinkPending className="-ml-1" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TopMovers({ coins }: { coins: readonly MarketCoin[] }) {
  const { gainers, losers } = getTopMovers(coins);
  return (
    <Card className="flex h-full flex-col gap-4 p-4 sm:p-5">
      <div>
        <h2 className="font-semibold tracking-tight">Top movers</h2>
        <p className="text-xs text-muted-foreground">24h change · top 100 by market cap</p>
      </div>
      <MoverList title="Gainers" coins={gainers} />
      <MoverList title="Losers" coins={losers} />
    </Card>
  );
}

export function TopMoversSkeleton() {
  return (
    <Card className="flex h-full flex-col gap-4 p-4 sm:p-5">
      <Skeleton className="h-5 w-28" />
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </Card>
  );
}
