"use client";

import Link from "next/link";
import { memo, type ReactNode } from "react";
import { CoinAvatar } from "@/components/ui/coin-avatar";
import { DataTable, DataTableSkeleton, type ColumnDef } from "@/components/ui/data-table";
import { LinkPending } from "@/components/ui/link-pending";
import { TrendBadge } from "@/components/ui/trend-badge";
import { cn } from "@/lib/utils/cn";
import { FavoriteButton } from "@/components/watchlist/favorite-button";
import { formatCompactUsd, formatPrice } from "@/lib/utils/format";
import type { MarketCoin } from "@/types/market";

import { MARKET_TABLE_DESCRIPTION, MARKET_TABLE_TITLE, MARKET_TABLE_TITLE_ID } from "./market-table-meta";

const NUM = "text-right tabular";

/** Classes per column (table is `lg+` only); shared with the skeleton so the layout doesn't shift. */
const COL = {
  favorite: "w-10 pr-0",
  rank: "w-12",
  asset: undefined,
  price: NUM,
  change24h: NUM,
  change7d: NUM,
  marketCap: NUM,
  volume: `${NUM} hidden xl:table-cell`,
};

/** `stretched` extends the hit area over the nearest positioned ancestor (the mobile card). */
function AssetLink({ coin, stretched = false }: { coin: MarketCoin; stretched?: boolean }) {
  return (
    <Link
      href={`/market/${coin.id}`}
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-md",
        stretched && "after:absolute after:inset-0 after:rounded-xl after:content-['']",
      )}
    >
      <CoinAvatar src={coin.image} symbol={coin.symbol} />
      <span className="flex min-w-0 items-baseline gap-2">
        <span className="truncate font-medium hover:underline">{coin.name}</span>
        <span className="text-xs text-muted-foreground">{coin.symbol}</span>
      </span>
      <LinkPending />
    </Link>
  );
}

// Module-level so the column identity is stable across renders.
const columns: ColumnDef<MarketCoin>[] = [
  {
    id: "favorite",
    header: "Watchlist",
    meta: { className: COL.favorite, srOnlyHeader: true },
    cell: ({ row }) => <FavoriteButton id={row.original.id} name={row.original.name} />,
  },
  {
    id: "rank",
    header: "#",
    meta: { className: COL.rank, cellClassName: "text-muted-foreground tabular" },
    cell: ({ row }) => row.original.rank ?? "—",
  },
  {
    id: "asset",
    header: "Asset",
    meta: { className: COL.asset, rowHeader: true },
    cell: ({ row }) => <AssetLink coin={row.original} />,
  },
  {
    id: "price",
    header: "Price",
    meta: { className: COL.price, cellClassName: "font-medium" },
    cell: ({ row }) => formatPrice(row.original.price),
  },
  {
    id: "change24h",
    header: "24h",
    meta: { className: COL.change24h },
    cell: ({ row }) => <TrendBadge value={row.original.change24h} />,
  },
  {
    id: "change7d",
    header: "7d",
    meta: { className: COL.change7d },
    cell: ({ row }) => <TrendBadge value={row.original.change7d} />,
  },
  {
    id: "marketCap",
    header: "Market cap",
    meta: { className: COL.marketCap },
    cell: ({ row }) => formatCompactUsd(row.original.marketCap),
  },
  {
    id: "volume",
    header: "Volume (24h)",
    meta: { className: COL.volume },
    cell: ({ row }) => formatCompactUsd(row.original.volume24h),
  },
];

const getRowId = (coin: MarketCoin) => coin.id;

/** Mobile card (below `lg`): asset + star on top, then label / value lines. */
function renderCard(coin: MarketCoin) {
  const lines: [string, ReactNode][] = [
    ["Price", <span key="p" className="font-medium">{formatPrice(coin.price)}</span>],
    ["24h", <TrendBadge key="24" value={coin.change24h} />],
    ["7d", <TrendBadge key="7" value={coin.change7d} />],
    ["Market cap", formatCompactUsd(coin.marketCap)],
  ];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
        <AssetLink coin={coin} stretched />
        <FavoriteButton id={coin.id} name={coin.name} className="relative z-10" />
      </div>
      <dl className="flex flex-col gap-1.5">
        {lines.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <dt className="shrink-0 text-muted-foreground">{label}</dt>
            <dd className="text-right tabular">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

interface MarketTableProps {
  coins: MarketCoin[];
  /** Total matching assets, shown in the title badge. */
  total: number;
  toolbar: ReactNode;
  dimmed?: boolean;
  animateEntry: boolean;
  caption: string;
  isLoading?: boolean;
  emptyState?: ReactNode;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Memoised; it re-renders when the toolbar element or the deferred result page
 * changes, and its rows only for the latter.
 */
export const MarketTable = memo(function MarketTable({
  coins,
  total,
  toolbar,
  dimmed,
  animateEntry,
  caption,
  isLoading,
  emptyState,
  page,
  pageCount,
  onPageChange,
  className,
}: MarketTableProps) {
  return (
    <DataTable
      columns={columns}
      data={coins}
      getRowId={getRowId}
      caption={caption}
      title={MARKET_TABLE_TITLE}
      titleId={MARKET_TABLE_TITLE_ID}
      titleBadge={`${total} ${total === 1 ? "asset" : "assets"}`}
      description={MARKET_TABLE_DESCRIPTION}
      toolbar={toolbar}
      dimmed={dimmed}
      isLoading={isLoading}
      loadingRows={5}
      emptyState={emptyState}
      animateRows={animateEntry}
      renderCard={renderCard}
      pagination={{ page, pageCount, onPageChange }}
      paginationLabel="Market pages"
      className={className}
    />
  );
});

export function MarketTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <DataTableSkeleton
      rows={rows}
      columns={Object.values(COL)}
      title={MARKET_TABLE_TITLE}
      titleId={MARKET_TABLE_TITLE_ID}
      description={MARKET_TABLE_DESCRIPTION}
      toolbar
    />
  );
}
