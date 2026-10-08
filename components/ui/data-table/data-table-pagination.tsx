"use client";

import { IconRenderer } from "@/assets/icons/iconRenderer";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

/** Page numbers around the current page, with gaps marked as `null`. */
export function getPageWindow(page: number, pageCount: number, radius = 1): (number | null)[] {
  const pages = new Set([1, pageCount]);
  for (let p = page - radius; p <= page + radius; p++) if (p > 1 && p < pageCount) pages.add(p);
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? [null, p] : [p]));
}

export interface DataTablePaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  /** Accessible name for the nav landmark. */
  label?: string;
  className?: string;
}

/**
 * Tredro-style footer pager: Previous / page numbers / Next.
 * Memoised — pass a stable `onPageChange` so it skips re-renders while the user types.
 */
export const DataTablePagination = memo(function DataTablePagination({
  page,
  pageCount,
  onPageChange,
  isLoading,
  label = "Pagination",
  className,
}: DataTablePaginationProps) {
  const footer = cn("flex items-center justify-between gap-2 border-t border-border px-3 py-3 sm:px-4", className);

  if (isLoading) {
    return (
      <div aria-hidden className={footer}>
        <Skeleton className="h-8 w-20" />
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="size-8" />
          ))}
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    );
  }

  if (pageCount <= 1) return null;

  const goTo = (p: number) => {
    if (p >= 1 && p <= pageCount && p !== page) onPageChange(p);
  };

  return (
    <nav aria-label={label} className={footer}>
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goTo(page - 1)} aria-label="Previous page">
        <IconRenderer name="arrow_left_outlined" aria-hidden className="size-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      <ul className="flex items-center gap-1">
        {getPageWindow(page, pageCount).map((p, i) =>
          p === null ? (
            <li key={`gap-${i}`} aria-hidden className="px-1 text-sm text-muted-foreground">
              …
            </li>
          ) : (
            <li key={p}>
              <Button
                variant={p === page ? "default" : "ghost"}
                size="icon-sm"
                aria-current={p === page ? "page" : undefined}
                aria-label={`Page ${p}`}
                onClick={() => goTo(p)}
                className={cn("tabular", p !== page && "text-muted-foreground")}
              >
                {p}
              </Button>
            </li>
          ),
        )}
      </ul>

      <Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => goTo(page + 1)} aria-label="Next page">
        <span className="hidden sm:inline">Next</span>
        <IconRenderer name="arrow_right_outlined" aria-hidden className="size-4" />
      </Button>
    </nav>
  );
});
