"use client";

import { IconRenderer } from "@/assets/icons/iconRenderer";
import { useConnectionStatus } from "@/hooks/use-live-ticker";
import { getPriceStream } from "@/lib/live/price-stream";
import { cn } from "@/lib/utils/cn";
import type { ConnectionStatus as Status } from "@/types/live";

const STATUS_UI: Record<Status, { label: string; dot: string; pulse?: boolean }> = {
  idle: { label: "Idle", dot: "bg-muted-foreground" },
  connecting: { label: "Connecting…", dot: "bg-warning", pulse: true },
  connected: { label: "Live", dot: "bg-positive", pulse: true },
  reconnecting: { label: "Reconnecting…", dot: "bg-warning", pulse: true },
  disconnected: { label: "Disconnected", dot: "bg-negative" },
};

/** Only this component subscribes to connection status changes. */
export function ConnectionStatus({ className }: { className?: string }) {
  const status = useConnectionStatus();
  const ui = STATUS_UI[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        role="status"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium"
      >
        <span aria-hidden className="relative flex size-2">
          {ui.pulse && <span className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-60", ui.dot)} />}
          <span className={cn("relative inline-flex size-2 rounded-full", ui.dot)} />
        </span>
        <span>
          <span className="sr-only">Live price connection: </span>
          {ui.label}
        </span>
      </span>
      {status === "disconnected" && (
        <button
          type="button"
          onClick={() => getPriceStream().retry()}
          className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
        >
          <IconRenderer name="refresh_outlined" aria-hidden className="size-3" />
          Reconnect
        </button>
      )}
    </div>
  );
}
