import { formatCompactNumber, formatCompactUsd, formatDate, formatPrice } from "@/lib/utils/format";
import type { AssetDetail } from "@/types/market";

interface Stat {
  label: string;
  value: string;
  hint?: string;
}

function buildStats({ market, symbol }: AssetDetail): Stat[] {
  const supply = (value: number | null) => (value === null ? "—" : `${formatCompactNumber(value)} ${symbol}`);
  return [
    { label: "Market cap", value: formatCompactUsd(market.marketCap) },
    { label: "Fully diluted valuation", value: formatCompactUsd(market.fullyDilutedValuation) },
    { label: "24h volume", value: formatCompactUsd(market.volume24h) },
    { label: "24h range", value: `${formatPrice(market.low24h)} – ${formatPrice(market.high24h)}` },
    { label: "Circulating supply", value: supply(market.circulatingSupply) },
    { label: "Max supply", value: market.maxSupply === null ? "Unlimited / unknown" : supply(market.maxSupply) },
    { label: "All-time high", value: formatPrice(market.ath), hint: formatDate(market.athDate) },
    { label: "All-time low", value: formatPrice(market.atl), hint: formatDate(market.atlDate) },
  ];
}

export function AssetStats({ asset }: { asset: AssetDetail }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-1">
      {buildStats(asset).map((stat) => (
        <div key={stat.label} className="flex items-baseline justify-between gap-4 border-b border-border py-3 last:border-0 sm:[&:nth-last-child(2)]:border-0 lg:[&:nth-last-child(2)]:border-b">
          <dt className="text-sm text-muted-foreground">{stat.label}</dt>
          <dd className="text-right text-sm font-medium tabular">
            {stat.value}
            {stat.hint && stat.hint !== "—" && (
              <span className="block text-xs font-normal text-muted-foreground">{stat.hint}</span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
