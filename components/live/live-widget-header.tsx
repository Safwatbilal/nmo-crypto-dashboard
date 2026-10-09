import { IconRenderer } from "@/assets/icons/iconRenderer";
import type { ReactNode } from "react";

/**
 * Shared by the widget and its loading skeleton. The status sits on the title
 * row (not beside the subtitle), so the header height never depends on the
 * status label's width — no layout shift as it goes Connecting… → Live.
 */
export function LiveWidgetHeader({ status }: { status: ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-semibold tracking-tight">
          <IconRenderer name="live_outlined" aria-hidden className="size-4 text-primary" />
          Live prices
        </h2>
        {status}
      </div>
      <p className="text-xs text-muted-foreground">Binance spot · USDT pairs · 1s updates</p>
    </div>
  );
}
