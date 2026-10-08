"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LiveMarketWidgetSkeleton() {
  return (
    <Card className="flex h-full flex-col gap-4 p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-[92px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="mt-auto h-7 w-full" />
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
