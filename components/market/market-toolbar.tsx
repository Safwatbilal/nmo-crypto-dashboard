"use client";

import { IconRenderer } from "@/assets/icons/iconRenderer";
import * as m from "motion/react-m";
import { useId } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FILTER_LABELS, SORT_LABELS } from "@/lib/market/query";
import { cn } from "@/lib/utils/cn";
import { CHANGE_FILTERS, SORT_KEYS, type ChangeFilter, type MarketQuery, type SortKey } from "@/types/market";

interface MarketToolbarProps {
  query: MarketQuery;
  onChange: (patch: Partial<MarketQuery>) => void;
}

export function MarketToolbar({ query, onChange }: MarketToolbarProps) {
  const searchId = useId();
  const sortId = useId();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div role="search" className="relative w-full sm:w-70">
        <label htmlFor={searchId} className="sr-only">
          Search assets by name or symbol
        </label>
        <IconRenderer name="search_outlined" aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id={searchId}
          type="search"
          value={query.q}
          onChange={(event) => onChange({ q: event.target.value })}
          placeholder="Search name or symbol…"
          autoComplete="off"
          spellCheck={false}
          maxLength={60}
          className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-9 text-sm placeholder:text-muted-foreground focus-visible:outline-2 [&::-webkit-search-cancel-button]:hidden"
        />
        {query.q && (
          <button
            type="button"
            onClick={() => onChange({ q: "" })}
            aria-label="Clear search"
            className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <IconRenderer name="close_outlined" aria-hidden className="size-4" />
          </button>
        )}
      </div>

      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
        <FilterTabs value={query.filter} onSelect={(filter) => onChange({ filter })} />

        <div className="flex flex-1 items-center gap-2 sm:flex-none">
          <label htmlFor={sortId} className="shrink-0 text-xs text-muted-foreground">
            Sort by
          </label>
          <Select value={query.sort} onValueChange={(sort) => onChange({ sort: sort as SortKey })}>
            <SelectTrigger id={sortId} className="min-w-0 flex-1 sm:w-44 sm:flex-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_KEYS.map((key) => (
                <SelectItem key={key} value={key}>
                  {SORT_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

/** Segmented control; the active pill slides between options via a shared layoutId. */
function FilterTabs({ value, onSelect }: { value: ChangeFilter; onSelect: (filter: ChangeFilter) => void }) {
  return (
    <div role="group" aria-label="Filter assets" className="flex h-9 w-full items-center rounded-md border border-input bg-card p-0.5 sm:w-auto">
      {CHANGE_FILTERS.map((filter) => {
        const active = filter === value;
        return (
          <button
            key={filter}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(filter)}
            className={cn(
              "relative flex-1 cursor-pointer rounded-sm px-3 py-1.5 text-xs font-medium transition-colors sm:flex-none",
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <m.span
                layoutId="market-filter-pill"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
                className="absolute inset-0 rounded-sm bg-primary"
              />
            )}
            <span className="relative">{FILTER_LABELS[filter]}</span>
          </button>
        );
      })}
    </div>
  );
}
