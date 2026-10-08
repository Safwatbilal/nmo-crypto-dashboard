"use client";

import Link from "next/link";
import { memo, type ReactNode } from "react";
import { CoinAvatar } from "@/components/ui/coin-avatar";
import { DataTable, DataTableSkeleton, type ColumnDef } from "@/components/ui/data-table";
import { LinkPending } from "@/components/ui/link-pending";
import { TrendBadge } from "@/components/ui/trend-badge";
import { FavoriteButton } from "@/components/watchlist/favorite-button";
import { formatCompactUsd, formatPrice } from "@/lib/utils/format";
import type { MarketCoin } from "@/types/market";

const NUM = "text-right tabular";

/** Responsive classes per column; shared with the skeleton so the layout doesn't shift. */
const COL = {
  favorite: "w-10 pl-2 pr-0 sm:pl-3",
  rank: "hidden w-12 sm:table-cell",
  asset: "pl-2 pr-2",
  price: `${NUM} w-30 sm:w-auto`,
  change24h: `${NUM} hidden sm:table-cell`,
  change7d: `${NUM} hidden lg:table-cell`,
  marketCap: `${NUM} hidden md:table-cell`,
  volume: `${NUM} hidden pr-4 xl:table-cell`,
};

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
    meta: { className: COL.rank, cellClassName: "text-xs text-muted-foreground tabular" },
    cell: ({ row }) => row.original.rank ?? "—",
  },
  {
    id: "asset",
    header: "Asset",
    meta: { className: COL.asset, rowHeader: true },
    cell: ({ row: { original: coin } }) => (
      <Link href={`/market/${coin.id}`} className="flex min-w-0 items-center gap-2.5 rounded-md sm:gap-3">
        <CoinAvatar src={coin.image} symbol={coin.symbol} />
        <span className="flex min-w-0 flex-col sm:flex-row sm:items-baseline sm:gap-2">
          <span className="truncate font-medium hover:underline">{coin.name}</span>
          <span className="text-xs text-muted-foreground">{coin.symbol}</span>
        </span>
        <LinkPending />
      </Link>
    ),
  },
  {
    id: "price",
    header: "Price",
    meta: { className: COL.price },
    cell: ({ row: { original: coin } }) => (
      <>
        <span className="block font-medium">{formatPrice(coin.price)}</span>
        <TrendBadge value={coin.change24h} className="text-xs sm:hidden" />
      </>
    ),
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

interface MarketTableProps {
  coins: MarketCoin[];
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
 * Memoised so urgent renders of the explorer (each keystroke in the search
 * box) skip the table; it only re-renders when the deferred result page changes.
 */
export const MarketTable = memo(function MarketTable({
  coins,
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
      isLoading={isLoading}
      loadingRows={5}
      emptyState={emptyState}
      animateRows={animateEntry}
      pagination={{ page, pageCount, onPageChange }}
      paginationLabel="Market pages"
      className={className}
    />
  );
});

export function MarketTableSkeleton({ rows = 10 }: { rows?: number }) {
  return <DataTableSkeleton rows={rows} columns={Object.values(COL)} />;
}
