import { useCallback, useSyncExternalStore } from "react";
import { getPriceStream } from "@/lib/live/price-stream";
import type { ConnectionStatus, LiveTicker } from "@/types/live";

const noopSubscribe = () => () => {};
const getServerTicker = () => undefined;
const getServerStatus = (): ConnectionStatus => "idle";

/**
 * Subscribes the calling component — and only it — to one symbol's ticks.
 * `subscribe` is memoised on `symbol` because useSyncExternalStore
 * re-subscribes whenever the function identity changes, which here would
 * mean an UNSUBSCRIBE/SUBSCRIBE round-trip on every render.
 */
export function useLiveTicker(symbol: string | null): LiveTicker | undefined {
  const subscribe = useCallback(
    (listener: () => void) => (symbol ? getPriceStream().subscribe(symbol, listener) : () => {}),
    [symbol],
  );
  const getSnapshot = useCallback(
    () => (symbol ? getPriceStream().getTicker(symbol) : undefined),
    [symbol],
  );
  return useSyncExternalStore(symbol ? subscribe : noopSubscribe, getSnapshot, getServerTicker);
}

export function useConnectionStatus(): ConnectionStatus {
  return useSyncExternalStore(
    (listener) => getPriceStream().subscribeStatus(listener),
    () => getPriceStream().getStatus(),
    getServerStatus,
  );
}
