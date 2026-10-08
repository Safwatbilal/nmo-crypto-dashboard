"use client";

import { IconRenderer } from "@/assets/icons/iconRenderer";
import { ConnectionStatus } from "@/components/live/connection-status";
import { LivePrice } from "@/components/live/live-price";
import { useLiveTicker } from "@/hooks/use-live-ticker";
import { liveSymbolToggled, selectCanAddLiveSymbol, selectIsLiveSymbol } from "@/store/features/liveSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils/cn";

/**
 * Real-time price for the asset page (only for symbols with a Binance USDT
 * pair). "Follow live" writes to the same Redux slice the home widget reads.
 */
export function LiveAssetPrice({ symbol, name }: { symbol: string; name: string }) {
  const ticker = useLiveTicker(symbol);
  const dispatch = useAppDispatch();
  const following = useAppSelector((state) => selectIsLiveSymbol(state, symbol));
  const canAdd = useAppSelector(selectCanAddLiveSymbol);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-background/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <IconRenderer name="live_outlined" aria-hidden className="size-3.5 text-primary" />
          Live on Binance · {symbol}
        </span>
        <ConnectionStatus />
      </div>
      <LivePrice ticker={ticker} className="text-2xl font-semibold" />
      <button
        type="button"
        aria-pressed={following}
        disabled={!following && !canAdd}
        onClick={() => dispatch(liveSymbolToggled(symbol))}
        className={cn(
          "self-start cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          following ? "border-primary/40 bg-primary/10 text-primary" : "border-border hover:bg-muted",
        )}
      >
        {following ? `Following ${name} on the dashboard` : "Follow on the live dashboard"}
      </button>
    </div>
  );
}
