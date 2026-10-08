"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { StatePanel } from "@/components/ui/state-panel";
import { DEFAULT_QUERY, PAGE_SIZE, filterCoins, paginate, sortCoins, toSearchString } from "@/lib/market/query";
import { selectIsWatchlistHydrated, selectWatchlistIds } from "@/store/features/watchlistSlice";
import { useAppSelector } from "@/store/hooks";
import type { MarketCoin, MarketQuery } from "@/types/market";
import { MarketTable } from "./market-table";
import { MarketToolbar } from "./market-toolbar";

const URL_SYNC_DELAY_MS = 300;

interface MarketExplorerProps {
  /** Server-fetched universe (top 250). Never copied into Redux. */
  coins: MarketCoin[];
  /** Parsed from the request URL on the server, so SSR HTML matches the link. */
  initialQuery: MarketQuery;
}

export function MarketExplorer({ coins, initialQuery }: MarketExplorerProps) {
  const [query, setQuery] = useState(initialQuery);
  const [hasInteracted, setHasInteracted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const watchlistIds = useAppSelector(selectWatchlistIds);
  const watchlistHydrated = useAppSelector(selectIsWatchlistHydrated);

  // The input stays urgent; filtering/sorting runs on the deferred value so
  // typing never waits on the table render.
  const deferredSearch = useDeferredValue(query.q);

  // Only depend on the watchlist when that filter is active, so starring an
  // asset in the "All" view doesn't recompute the whole result set.
  const watchlistFilter = useMemo(
    () => (query.filter === "watchlist" ? new Set(watchlistIds) : undefined),
    [query.filter, watchlistIds],
  );

  // Filter + sort over 250 items: cheap individually, but it would otherwise
  // run on every render (each keystroke, each watchlist toggle).
  const results = useMemo(
    () =>
      sortCoins(
        filterCoins(coins, { q: deferredSearch, filter: query.filter }, { watchlistIds: watchlistFilter }),
        query.sort,
      ),
    [coins, deferredSearch, query.filter, query.sort, watchlistFilter],
  );

  const pageData = useMemo(() => paginate(results, query.page), [results, query.page]);

  // Stable identity lets the memoised toolbar children / pagination skip renders.
  const updateQuery = useCallback((patch: Partial<MarketQuery>) => {
    setHasInteracted(true);
    // Any change other than paging returns to the first page.
    setQuery((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      updateQuery({ page });
      sectionRef.current?.scrollIntoView({ block: "start" });
    },
    [updateQuery],
  );

  const resetFilters = useCallback(() => updateQuery(DEFAULT_QUERY), [updateQuery]);

  // Mirror state into the URL (shareable, and what the server renders on
  // reload) without a navigation: replaceState doesn't re-run server components.
  useEffect(() => {
    if (!hasInteracted) return;
    const timer = setTimeout(() => {
      const search = toSearchString({ ...query, q: query.q.trim(), page: pageData.page });
      window.history.replaceState(null, "", `${window.location.pathname}${search}`);
    }, URL_SYNC_DELAY_MS);
    return () => clearTimeout(timer);
  }, [query, pageData.page, hasInteracted]);

  // Keyed on the deferred search (not `query.q`) so keystrokes don't hand the
  // memoised table a new element and force it to re-render.
  const emptyState = useMemo(
    () =>
      query.filter === "watchlist" && !deferredSearch ? (
        <StatePanel
          icon="star_outlined"
          title="Your watchlist is empty"
          description="Tap the star next to any asset to follow it here."
          action={<Button variant="outline" onClick={resetFilters}>Browse all assets</Button>}
        />
      ) : (
        <StatePanel
          icon="search_error_outlined"
          title="No assets match your filters"
          description={
            deferredSearch ? `Nothing found for “${deferredSearch}”. Try a different name or symbol.` : "Try a different filter."
          }
          action={<Button variant="outline" onClick={resetFilters}>Clear filters</Button>}
        />
      ),
    [query.filter, deferredSearch, resetFilters],
  );

  const awaitingWatchlist = query.filter === "watchlist" && !watchlistHydrated;
  const isStale = deferredSearch !== query.q;
  const firstItem = (pageData.page - 1) * PAGE_SIZE + 1;
  const rangeLabel =
    pageData.total === 0
      ? "No matching assets"
      : `Showing ${firstItem}–${firstItem + pageData.items.length - 1} of ${pageData.total} assets`;

  // The toolbar lives inside the table shell (Tredro layout), so the table
  // shell re-renders per keystroke; its rows are memoised and skip that work.
  const toolbar = useMemo(() => <MarketToolbar query={query} onChange={updateQuery} />, [query, updateQuery]);

  return (
    <div ref={sectionRef} className="flex scroll-mt-20 flex-col gap-4">
      <MarketTable
        coins={pageData.items}
        total={pageData.total}
        toolbar={toolbar}
        dimmed={isStale}
        animateEntry={hasInteracted}
        caption={rangeLabel}
        isLoading={awaitingWatchlist}
        emptyState={emptyState}
        page={pageData.page}
        pageCount={pageData.pageCount}
        onPageChange={goToPage}
      />

      <p className="text-center text-xs text-muted-foreground tabular sm:text-left" aria-live="polite">
        {awaitingWatchlist ? "Loading watchlist…" : rangeLabel}
      </p>
    </div>
  );
}
