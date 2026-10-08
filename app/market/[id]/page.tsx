import { IconRenderer } from "@/assets/icons/iconRenderer";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AssetStats } from "@/components/asset/asset-stats";
import { LiveAssetPrice } from "@/components/asset/live-asset-price";
import { PriceChart } from "@/components/asset/price-chart";
import { Card } from "@/components/ui/card";
import { CoinAvatar } from "@/components/ui/coin-avatar";
import { TrendBadge } from "@/components/ui/trend-badge";
import { FavoriteButton } from "@/components/watchlist/favorite-button";
import { getAsset, REVALIDATE } from "@/lib/api/coingecko";
import { getLiveSymbolForCoin } from "@/lib/live/symbols";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { formatCompactUsd, formatDate, formatDateTime, formatPercent, formatPrice } from "@/lib/utils/format";
import type { AssetDetail } from "@/types/market";

/**
 * Rendering: ISR.
 *
 * Asset pages are identical for every visitor and only need to be as fresh as
 * the upstream (CoinGecko itself refreshes roughly every minute; the
 * real-time element is the client-side WebSocket price). Each page is
 * generated on its first request, served from cache, and regenerated in the
 * background at most every 5 minutes (stale-while-revalidate).
 *
 * `generateStaticParams` returns [] on purpose: nothing is prerendered at build
 * time, so the build never depends on a rate-limited third-party API, while
 * every id is still cached after its first visit. Unknown ids 404 (and 404s
 * are not cached as pages).
 */
export const revalidate = 300; // keep in sync with REVALIDATE.asset
export const dynamicParams = true;

export function generateStaticParams(): { id: string }[] {
  return [];
}

type Props = PageProps<"/market/[id]">;

function describe(asset: AssetDetail): string {
  const { market } = asset;
  const parts = [
    `${asset.name} (${asset.symbol}) price today is ${formatPrice(market.price)}`,
    market.change24h !== null ? `${formatPercent(market.change24h)} in the last 24h` : null,
    market.marketCap !== null ? `market cap ${formatCompactUsd(market.marketCap)}` : null,
    asset.rank !== null ? `ranked #${asset.rank}` : null,
  ];
  return `${parts.filter(Boolean).join(", ")}. Live price, 7-day chart and key stats.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const asset = await getAsset(id); // deduped with the page render via React cache()
  if (!asset) notFound();

  const title = `${asset.name} (${asset.symbol}) Price, Chart & Market Cap`;
  const description = describe(asset);
  const path = `/market/${asset.id}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title,
      description,
      images: asset.image ? [{ url: asset.image, width: 250, height: 250, alt: `${asset.name} logo` }] : undefined,
    },
    twitter: { card: "summary", title, description },
  };
}

function ChangeRow({ market }: { market: AssetDetail["market"] }) {
  const periods = [
    { label: "24h", value: market.change24h },
    { label: "7d", value: market.change7d },
    { label: "30d", value: market.change30d },
    { label: "1y", value: market.change1y },
  ];
  return (
    <dl className="grid grid-cols-4 divide-x divide-border rounded-xl border border-border">
      {periods.map((period) => (
        <div key={period.label} className="flex flex-col items-center gap-0.5 py-2.5">
          <dt className="text-xs text-muted-foreground">{period.label}</dt>
          <dd className="text-sm">
            <TrendBadge value={period.value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default async function AssetPage({ params }: Props) {
  const { id } = await params;
  const asset = await getAsset(id);
  if (!asset) notFound();

  const liveSymbol = getLiveSymbolForCoin(asset.id);
  const { market } = asset;

  return (
    <article className="flex flex-col gap-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Market", path: "/" },
          { name: asset.name, path: `/market/${asset.id}` },
        ])}
      />

      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="rounded hover:text-foreground hover:underline">
              Market
            </Link>
          </li>
          <li aria-hidden>
            <IconRenderer name="arrow_right_outlined" className="size-3.5" />
          </li>
          <li aria-current="page" className="font-medium text-foreground">
            {asset.name}
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <CoinAvatar src={asset.image} symbol={asset.symbol} size={44} preload />
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {asset.name} <span className="text-muted-foreground">{asset.symbol}</span>
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                {asset.rank !== null && (
                  <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-medium text-primary">Rank #{asset.rank}</span>
                )}
                {asset.categories.map((category) => (
                  <span key={category} className="rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <p className="text-3xl font-semibold tracking-tight tabular sm:text-4xl">{formatPrice(market.price)}</p>
            <TrendBadge value={market.change24h} variant="pill" className="text-sm" />
            <span className="text-xs text-muted-foreground">24h</span>
          </div>
          <FavoriteButton id={asset.id} name={asset.name} withLabel className="self-start" />
        </div>

        {liveSymbol && (
          <div className="w-full lg:max-w-sm">
            <LiveAssetPrice symbol={liveSymbol} name={asset.name} />
          </div>
        )}
      </header>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="flex flex-col gap-4 p-4 sm:p-5 lg:col-span-3">
          <h2 className="font-semibold tracking-tight">Price — last 7 days</h2>
          <PriceChart points={asset.sparkline7d} name={asset.name} />
          <ChangeRow market={market} />
        </Card>

        <Card className="p-4 sm:p-5 lg:col-span-2">
          <h2 className="font-semibold tracking-tight">Market statistics</h2>
          <AssetStats asset={asset} />
        </Card>
      </div>

      <Card className="flex flex-col gap-3 p-4 sm:p-5">
        <h2 className="font-semibold tracking-tight">About {asset.name}</h2>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
          {asset.description ?? `No description is available for ${asset.name}.`}
        </p>
        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          {asset.genesisDate && (
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Launched</dt>
              <dd>{formatDate(asset.genesisDate)}</dd>
            </div>
          )}
          {asset.hashingAlgorithm && (
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Algorithm</dt>
              <dd>{asset.hashingAlgorithm}</dd>
            </div>
          )}
        </dl>
        {(asset.homepage || asset.explorer) && (
          <ul className="flex flex-wrap gap-2">
            {[
              { href: asset.homepage, label: "Official website" },
              { href: asset.explorer, label: "Block explorer" },
            ].map(
              (link) =>
                link.href && (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
                    >
                      {link.label}
                      <IconRenderer name="external_outlined" aria-hidden className="size-3.5" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ),
            )}
          </ul>
        )}
      </Card>

      <p className="text-xs text-muted-foreground">
        Source:{" "}
        <a
          href={`https://www.coingecko.com/en/coins/${asset.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          CoinGecko
        </a>{" "}
        · Data as of {formatDateTime(asset.lastUpdated)} · Refreshed at most every {REVALIDATE.asset / 60} minutes
        {liveSymbol && " · Live price from Binance"}
      </p>
    </article>
  );
}
