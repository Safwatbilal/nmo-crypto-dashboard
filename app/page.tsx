import type { Metadata } from "next";
import { Suspense } from "react";
import { LiveMarketWidgetLazy } from "@/components/live/live-market-widget-lazy";
import { GlobalStats, GlobalStatsSkeleton } from "@/components/market/global-stats";
import { MarketExplorer } from "@/components/market/market-explorer";
import { MarketTableSkeleton } from "@/components/market/market-table";
import { MARKET_TABLE_DESCRIPTION, MARKET_TABLE_TITLE, MARKET_TABLE_TITLE_ID } from "@/components/market/market-table-meta";
import { TopMovers, TopMoversSkeleton } from "@/components/market/top-movers";
import { DataTableHeader, dataTableShellClassName } from "@/components/ui/data-table/data-table-shell";
import { RetryPanel } from "@/components/ui/retry-panel";
import { getGlobalStats, getMarkets, MARKET_UNIVERSE_SIZE } from "@/lib/api/coingecko";
import { tryLoad } from "@/lib/api/try-load";
import { parseMarketQuery } from "@/lib/market/query";
import { JsonLd, itemListJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { openGraphDefaults, siteConfig } from "@/lib/seo/site";
import type { MarketQuery } from "@/types/market";

/**
 * Rendering: SSR (request time).
 *
 * The page renders whatever view the URL describes (?q, ?sort, ?filter,
 * ?page) — an unbounded set of combinations that can't be prerendered, and
 * shared/crawled links must return that exact view as HTML. Reading
 * `searchParams` opts the route into dynamic rendering.
 *
 * Upstream data is NOT refetched per request: each fetch carries its own
 * `next.revalidate` (60s markets, 300s global stats), so all visitors share
 * one cached CoinGecko response. We intentionally don't use
 * `dynamic = "force-dynamic"`, which would also force every fetch to `no-store`.
 */

const homeTitle = `Crypto Prices Today, Market Cap & Live Charts · ${siteConfig.name}`;

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: { ...openGraphDefaults, url: "/", title: homeTitle, description: siteConfig.description },
  twitter: { card: "summary_large_image", title: homeTitle, description: siteConfig.description },
};

// Stats and movers are non-essential: on failure they disappear and the
// market table (which has its own retry state) still renders.
async function GlobalStatsSection() {
  const stats = await tryLoad(getGlobalStats);
  return stats ? <GlobalStats stats={stats} /> : null;
}

async function MoversSection() {
  const coins = await tryLoad(getMarkets);
  return coins ? <TopMovers coins={coins} /> : null;
}

async function MarketSection({ query }: { query: MarketQuery }) {
  const coins = await tryLoad(getMarkets);
  if (!coins) {
    return (
      <div className={dataTableShellClassName}>
        <DataTableHeader title={MARKET_TABLE_TITLE} titleId={MARKET_TABLE_TITLE_ID} description={MARKET_TABLE_DESCRIPTION} />
        <RetryPanel />
      </div>
    );
  }
  return (
    <>
      <JsonLd data={itemListJsonLd(coins.slice(0, 10))} />
      <MarketExplorer coins={coins} initialQuery={query} />
    </>
  );
}

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const query = parseMarketQuery(await searchParams);

  return (
    <div className="flex flex-col gap-8">
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />

      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Today&apos;s crypto market</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Prices, market caps and 24h moves for the top {MARKET_UNIVERSE_SIZE} assets, with a real-time price stream.
        </p>
      </header>

      <section aria-label="Global market statistics">
        <Suspense fallback={<GlobalStatsSkeleton />}>
          <GlobalStatsSection />
        </Suspense>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <section aria-label="Live prices" className="lg:col-span-2">
          <LiveMarketWidgetLazy />
        </section>
        <section aria-label="Top movers">
          <Suspense fallback={<TopMoversSkeleton />}>
            <MoversSection />
          </Suspense>
        </section>
      </div>

      {/* The heading is the title row inside the table shell (Tredro layout). */}
      <section aria-labelledby={MARKET_TABLE_TITLE_ID}>
        <Suspense fallback={<MarketTableSkeleton />}>
          <MarketSection query={query} />
        </Suspense>
      </section>
    </div>
  );
}
