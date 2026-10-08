"use client";

import { IconRenderer } from "@/assets/icons/iconRenderer";
import * as m from "motion/react-m";
import Link from "next/link";
import { memo, type Ref } from "react";
import { TrendBadge } from "@/components/ui/trend-badge";
import { useLiveTicker } from "@/hooks/use-live-ticker";
import { getLiveSymbolInfo } from "@/lib/live/symbols";
import { LivePrice } from "./live-price";

interface LiveTickerCardProps {
  symbol: string;
  onRemove: (symbol: string) => void;
  /** Needed by AnimatePresence `popLayout` (React 19 ref-as-prop). */
  ref?: Ref<HTMLLIElement>;
}

/**
 * The tick subscription lives here, so each ~1s update re-renders one card.
 * Memoised so the widget re-rendering (symbol added/removed) doesn't touch the
 * other cards; `onRemove` is a stable callback from the parent for that reason.
 */
export const LiveTickerCard = memo(function LiveTickerCard({ symbol, onRemove, ref }: LiveTickerCardProps) {
  const ticker = useLiveTicker(symbol);
  const info = getLiveSymbolInfo(symbol);
  const name = info?.name ?? symbol;

  return (
    <m.li
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className="group relative flex flex-col gap-1 rounded-xl border border-border bg-background/60 p-3"
    >
      <div className="flex items-center justify-between gap-2">
        <Link href={`/market/${info?.coinId ?? ""}`} className="min-w-0 truncate text-sm font-medium hover:underline">
          {info?.base ?? symbol}
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">{name}</span>
        </Link>
        <button
          type="button"
          onClick={() => onRemove(symbol)}
          aria-label={`Stop following ${name}`}
          className="-mr-1 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground opacity-70 transition hover:bg-muted hover:text-foreground hover:opacity-100 focus-visible:opacity-100"
        >
          <IconRenderer name="close_outlined" aria-hidden className="size-3.5" />
        </button>
      </div>
      <LivePrice ticker={ticker} className="text-base font-semibold sm:text-lg" />
      {ticker ? (
        <TrendBadge value={ticker.change24h} className="text-xs" />
      ) : (
        <span className="text-xs text-muted-foreground">Waiting for data…</span>
      )}
    </m.li>
  );
});
