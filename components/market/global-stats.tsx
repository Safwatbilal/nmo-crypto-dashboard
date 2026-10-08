import { IconRenderer } from "@/assets/icons/iconRenderer";
import type { iconName } from "@/assets/icons/iconRenderer/types";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendBadge } from "@/components/ui/trend-badge";
import { formatCompactNumber, formatCompactUsd } from "@/lib/utils/format";
import type { GlobalStats as GlobalStatsData } from "@/types/market";

interface StatCardProps {
  icon: iconName;
  label: string;
  value: string;
  change?: number | null;
  index: number;
}

/** KPI tile (Tredro OverviewStatCard pattern). CSS-only entrance: no JS needed. */
function StatCard({ icon, label, value, change, index }: StatCardProps) {
  return (
    <Card
      className="flex h-full w-[170px] shrink-0 snap-start flex-col gap-2 p-4 animate-fade-up sm:w-auto"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <IconRenderer name={icon} aria-hidden className="size-4" />
        </span>
        {change !== undefined && <TrendBadge value={change} variant="pill" />}
      </div>
      <p className="text-xl font-semibold tracking-tight tabular sm:text-2xl">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}

export function GlobalStats({ stats }: { stats: GlobalStatsData }) {
  const items: Omit<StatCardProps, "index">[] = [
    { icon: "globe_outlined", label: "Total market cap", value: formatCompactUsd(stats.totalMarketCapUsd), change: stats.marketCapChange24h },
    { icon: "report_outlined", label: "24h trading volume", value: formatCompactUsd(stats.totalVolumeUsd) },
    {
      icon: "currency_usd",
      label: "BTC dominance",
      value: stats.btcDominance === null ? "—" : `${stats.btcDominance.toFixed(1)}%`,
    },
    { icon: "money_outlined", label: "Active cryptocurrencies", value: formatCompactNumber(stats.activeCryptocurrencies) },
  ];

  return (
    <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
      {items.map((item, index) => (
        <li key={item.label} className="flex shrink-0 sm:block">
          <StatCard {...item} index={index} />
        </li>
      ))}
    </ul>
  );
}

export function GlobalStatsSkeleton() {
  return (
    <div className="-mx-4 flex gap-3 overflow-hidden px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <Card key={i} className="flex w-[170px] shrink-0 flex-col gap-2 p-4 sm:w-auto">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-3 w-28" />
        </Card>
      ))}
    </div>
  );
}
