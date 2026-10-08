"use client";

import { IconRenderer } from "@/assets/icons/iconRenderer";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

const MAX_VISIBLE = 5;

/**
 * Tredro page window: first and last page always, up to `MAX_VISIBLE` pages
 * near the current one (widened at either end), gaps marked as `null`.
 */
export function getPageWindow(page: number, pageCount: number): (number | null)[] {
  if (pageCount <= 1) return [1];

  let start = Math.max(2, page - 1);
  let end = Math.min(pageCount - 1, page + 1);
  if (page <= 3) end = Math.min(pageCount - 1, MAX_VISIBLE - 1);
  else if (page >= pageCount - 2) start = Math.max(2, pageCount - MAX_VISIBLE + 2);

  const pages: (number | null)[] = [1];
  if (start > 2) pages.push(null);
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < pageCount - 1) pages.push(null);
  pages.push(pageCount);
  return pages;
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
  const footer = cn("flex items-center justify-between gap-2 border-t border-border px-4 py-4 sm:px-6", className);

  if (isLoading) {
    return (
      <div aria-hidden className={footer}>
        <Skeleton className="h-8 w-20" />
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_VISIBLE }, (_, i) => (
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
            <li key={`gap-${i}`} aria-hidden className="flex items-center px-2 text-sm text-muted-foreground">
              ...
            </li>
          ) : (
            <li key={p}>
              <Button
                variant={p === page ? "default" : "ghost"}
                size="icon-sm"
                aria-current={p === page ? "page" : undefined}
                aria-label={`Page ${p}`}
                onClick={() => goTo(p)}
                className="text-sm tabular"
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
