"use client";

import { IconRenderer } from "@/assets/icons/iconRenderer";
import * as m from "motion/react-m";
import {
  selectIsInWatchlist,
  selectIsWatchlistHydrated,
  watchlistToggled,
} from "@/store/features/watchlistSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils/cn";

interface FavoriteButtonProps {
  id: string;
  name: string;
  withLabel?: boolean;
  className?: string;
}

/**
 * Subscribes to its own boolean slice of the watchlist, so toggling one asset
 * re-renders exactly one button — the table rows above it stay untouched.
 * Disabled until persisted state is hydrated, so an early click can't be
 * overwritten by the stored list.
 */
export function FavoriteButton({ id, name, withLabel = false, className }: FavoriteButtonProps) {
  const dispatch = useAppDispatch();
  const active = useAppSelector((state) => selectIsInWatchlist(state, id));
  const hydrated = useAppSelector(selectIsWatchlistHydrated);

  return (
    <m.button
      type="button"
      whileTap={{ scale: 0.88 }}
      onClick={() => dispatch(watchlistToggled(id))}
      disabled={!hydrated}
      aria-pressed={active}
      aria-label={withLabel ? undefined : `Watchlist ${name}`}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors disabled:cursor-default",
        withLabel
          ? "h-9 border border-border bg-card px-3 hover:bg-muted"
          : "size-8 text-muted-foreground hover:bg-muted hover:text-foreground",
        active && "text-warning",
        className,
      )}
    >
      <m.span
        key={active ? "on" : "off"}
        initial={hydrated ? { scale: 0.5, rotate: -30 } : false}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 18 }}
        className="inline-flex"
      >
        <IconRenderer name={active ? "star_filled" : "star_outlined"} aria-hidden className="size-4" />
      </m.span>
      {withLabel && <span className="text-foreground">{active ? "In watchlist" : "Add to watchlist"}</span>}
    </m.button>
  );
}
