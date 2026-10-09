"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/format";
import type { LiveTicker } from "@/types/live";

type Direction = "up" | "down" | null;

/**
 * Price that briefly flashes green/red on change. Direction is also shown by
 * an arrow glyph, so the cue doesn't rely on colour.
 */
export function LivePrice({ ticker, className }: { ticker: LiveTicker | undefined; className?: string }) {
  const price = ticker?.price;
  const [previous, setPrevious] = useState(price);
  const [direction, setDirection] = useState<Direction>(null);

  // "Adjust state while rendering" pattern: compare with the previous tick.
  if (price !== previous) {
    if (price !== undefined && previous !== undefined && price !== previous) {
      setDirection(price > previous ? "up" : "down");
    }
    setPrevious(price);
  }

  if (!ticker) {
    // The zero-width space gives the placeholder the same line box as the
    // price, so the first tick doesn't change the height (no layout shift).
    return (
      <span aria-hidden className={cn("inline-flex w-fit items-center", className)}>
        <span className="h-[1em] w-20 animate-pulse rounded bg-muted" />
        &#8203;
      </span>
    );
  }

  return (
    <span
      key={ticker.eventTime}
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded px-1 -mx-1 tabular",
        direction === "up" && "animate-flash-up",
        direction === "down" && "animate-flash-down",
        className,
      )}
    >
      {formatPrice(ticker.price)}
      <span
        aria-hidden
        className={cn(
          "text-[0.55em]",
          direction === "up" && "text-positive",
          direction === "down" && "text-negative",
          direction === null && "invisible",
        )}
      >
        {direction === "down" ? "▼" : "▲"}
      </span>
    </span>
  );
}
