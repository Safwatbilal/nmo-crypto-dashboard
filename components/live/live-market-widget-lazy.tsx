"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_LIVE_SYMBOLS, LIVE_SYMBOLS } from "@/lib/live/symbols";
import { LiveWidgetHeader } from "./live-widget-header";

/**
 * Mirrors the widget's layout (same header, card heights and chip rows) so
 * swapping in the real widget causes no layout shift.
 */
export function LiveMarketWidgetSkeleton() {
  return (
    <Card className="flex h-full flex-col gap-4 p-4 sm:p-5" aria-hidden>
      <LiveWidgetHeader status={<Skeleton className="h-6.5 w-24 rounded-full" />} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {DEFAULT_LIVE_SYMBOLS.map((symbol) => (
          <Skeleton key={symbol} className="h-24.5 rounded-xl sm:h-25.5" />
        ))}
      </div>
      <div className="mt-auto">
        <Skeleton className="mb-2 h-4 w-20" />
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: LIVE_SYMBOLS.length - DEFAULT_LIVE_SYMBOLS.length }, (_, i) => (
            <Skeleton key={i} className="h-7 w-16 rounded-full" />
          ))}
        </div>
      </div>
    </Card>
  );
}

/**
 * The live widget is non-critical and browser-only (WebSocket + persisted
 * symbol choice), so it is code-split and skipped during SSR. This keeps its
 * JS out of the initial bundle and avoids rendering defaults that would be
 * replaced right after hydration.
 */
export const LiveMarketWidgetLazy = dynamic(() => import("./live-market-widget"), {
  ssr: false,
  loading: LiveMarketWidgetSkeleton,
});
