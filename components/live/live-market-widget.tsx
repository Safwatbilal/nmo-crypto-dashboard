"use client";

import { IconRenderer } from "@/assets/icons/iconRenderer";
import { AnimatePresence } from "motion/react";
import { useCallback } from "react";
import { Card } from "@/components/ui/card";
import { LIVE_SYMBOLS, MAX_LIVE_SYMBOLS } from "@/lib/live/symbols";
import { liveSymbolToggled, selectLiveSymbols } from "@/store/features/liveSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ConnectionStatus } from "./connection-status";
import { LiveTickerCard } from "./live-ticker-card";

/**
 * Re-renders only when the followed symbol list changes. Ticks are consumed
 * inside each card and connection status inside <ConnectionStatus />.
 */
export default function LiveMarketWidget() {
  const dispatch = useAppDispatch();
  const symbols = useAppSelector(selectLiveSymbols);
  const available = LIVE_SYMBOLS.filter((info) => !symbols.includes(info.symbol));
  const canAdd = symbols.length < MAX_LIVE_SYMBOLS;

  const toggle = useCallback((symbol: string) => dispatch(liveSymbolToggled(symbol)), [dispatch]);

  return (
    <Card className="flex h-full flex-col gap-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 font-semibold tracking-tight">
            <IconRenderer name="live_outlined" aria-hidden className="size-4 text-primary" />
            Live prices
          </h2>
          <p className="text-xs text-muted-foreground">Binance spot · USDT pairs · updates every second</p>
        </div>
        <ConnectionStatus />
      </div>

      {symbols.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Follow a symbol below to start the live stream.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Followed live prices">
          <AnimatePresence mode="popLayout" initial={false}>
            {symbols.map((symbol) => (
              <LiveTickerCard key={symbol} symbol={symbol} onRemove={toggle} />
            ))}
          </AnimatePresence>
        </ul>
      )}

      <div className="mt-auto">
        <p id="live-add-label" className="mb-2 text-xs text-muted-foreground">
          {canAdd ? "Follow more" : `Following the maximum of ${MAX_LIVE_SYMBOLS} symbols`}
        </p>
        <ul aria-labelledby="live-add-label" className="flex flex-wrap gap-1.5">
          {available.map((info) => (
            <li key={info.symbol}>
              <button
                type="button"
                disabled={!canAdd}
                onClick={() => toggle(info.symbol)}
                aria-label={`Follow ${info.name} live`}
                className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-full border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                <IconRenderer name="plus_outlined" aria-hidden className="size-3" />
                {info.base}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
