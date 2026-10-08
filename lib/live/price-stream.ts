import type { BinanceMiniTicker, ConnectionStatus, LiveTicker } from "@/types/live";

/**
 * One multiplexed WebSocket to Binance public market streams, shared by every
 * live component on the page.
 *
 * - Ref-counted subscriptions: a symbol is SUBSCRIBEd when its first consumer
 *   mounts and UNSUBSCRIBEd when the last one unmounts; the socket itself
 *   closes after a short idle grace period once nothing is subscribed.
 * - Reconnects with capped exponential backoff + jitter, gives up after
 *   `maxReconnectAttempts` (status → "disconnected", user can retry), and
 *   resumes automatically when the browser comes back online.
 * - A watchdog recycles connections that silently stop delivering messages.
 * - Ticks live here, outside React/Redux. Components read them through
 *   `useSyncExternalStore`, so a tick re-renders only the cells showing that
 *   symbol — never the page or the Redux tree.
 */

type Listener = () => void;

export interface PriceStreamOptions {
  url: string;
  maxReconnectAttempts?: number;
  idleCloseMs?: number;
  staleAfterMs?: number;
  /** Injectable for tests. */
  createSocket?: (url: string) => WebSocket;
}

const BASE_DELAY_MS = 1_000;
const MAX_DELAY_MS = 30_000;

/** "Equal jitter" backoff: half fixed, half random, capped. */
export function computeBackoffDelay(attempt: number, random: () => number = Math.random): number {
  const ceiling = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** attempt);
  return Math.round(ceiling / 2 + (random() * ceiling) / 2);
}

function isMiniTicker(value: unknown): value is BinanceMiniTicker {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return v.e === "24hrMiniTicker" && typeof v.s === "string" && typeof v.c === "string" && typeof v.o === "string";
}

export function parseMiniTicker(raw: unknown): LiveTicker | null {
  if (!isMiniTicker(raw)) return null;
  const price = Number(raw.c);
  const open24h = Number(raw.o);
  if (!Number.isFinite(price) || !Number.isFinite(open24h)) return null;
  return {
    symbol: raw.s,
    price,
    open24h,
    high24h: Number(raw.h),
    low24h: Number(raw.l),
    change24h: open24h > 0 ? ((price - open24h) / open24h) * 100 : 0,
    eventTime: raw.E,
  };
}

const toStreamName = (symbol: string) => `${symbol.toLowerCase()}@miniTicker`;

export class PriceStream {
  private socket: WebSocket | null = null;
  private status: ConnectionStatus = "idle";
  private attempt = 0;
  private requestId = 1;
  private lastMessageAt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private watchdog: ReturnType<typeof setInterval> | null = null;

  private readonly refCounts = new Map<string, number>();
  private readonly tickers = new Map<string, LiveTicker>();
  private readonly tickerListeners = new Map<string, Set<Listener>>();
  private readonly statusListeners = new Set<Listener>();

  private readonly url: string;
  private readonly maxReconnectAttempts: number;
  private readonly idleCloseMs: number;
  private readonly staleAfterMs: number;
  private readonly createSocket: (url: string) => WebSocket;

  constructor(options: PriceStreamOptions) {
    this.url = options.url;
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 6;
    this.idleCloseMs = options.idleCloseMs ?? 5_000;
    this.staleAfterMs = options.staleAfterMs ?? 20_000;
    this.createSocket = options.createSocket ?? ((url) => new WebSocket(url));
  }

  // ---- Public API (arrow functions: safe to pass to useSyncExternalStore) ----

  subscribe = (symbol: string, listener: Listener): (() => void) => {
    let listeners = this.tickerListeners.get(symbol);
    if (!listeners) {
      listeners = new Set();
      this.tickerListeners.set(symbol, listeners);
    }
    listeners.add(listener);
    this.retain(symbol);

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) this.tickerListeners.delete(symbol);
      this.release(symbol);
    };
  };

  getTicker = (symbol: string): LiveTicker | undefined => this.tickers.get(symbol);

  subscribeStatus = (listener: Listener): (() => void) => {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  };

  getStatus = (): ConnectionStatus => this.status;

  /** Manual reconnect (e.g. "Retry" button after giving up). */
  retry = (): void => {
    if (this.refCounts.size === 0) return;
    this.attempt = 0;
    this.closeSocket();
    this.connect();
  };

  // ---- Subscription bookkeeping ----

  private retain(symbol: string) {
    const count = this.refCounts.get(symbol) ?? 0;
    this.refCounts.set(symbol, count + 1);
    if (count > 0) return;

    this.clearIdleTimer();
    if (this.isOpen()) this.send("SUBSCRIBE", [symbol]);
    else if (!this.socket && !this.reconnectTimer && this.status !== "disconnected") this.connect();
  }

  private release(symbol: string) {
    const count = (this.refCounts.get(symbol) ?? 0) - 1;
    if (count > 0) {
      this.refCounts.set(symbol, count);
      return;
    }
    this.refCounts.delete(symbol);
    if (this.isOpen()) this.send("UNSUBSCRIBE", [symbol]);
    if (this.refCounts.size === 0) this.scheduleIdleClose();
  }

  // ---- Connection lifecycle ----

  private connect() {
    this.clearReconnectTimer();
    this.addNetworkListeners();
    this.setStatus(this.attempt === 0 ? "connecting" : "reconnecting");

    const socket = this.createSocket(this.url);
    this.socket = socket;

    socket.onopen = () => {
      if (this.socket !== socket) return;
      this.attempt = 0;
      this.lastMessageAt = Date.now();
      this.setStatus("connected");
      this.send("SUBSCRIBE", [...this.refCounts.keys()]);
      this.startWatchdog();
    };

    socket.onmessage = (event: MessageEvent) => {
      if (this.socket !== socket) return;
      this.lastMessageAt = Date.now();
      this.handleMessage(event.data);
    };

    // `error` is always followed by `close`; reconnect logic lives there.
    socket.onerror = () => {};

    socket.onclose = () => {
      if (this.socket !== socket) return; // closed intentionally
      this.socket = null;
      this.stopWatchdog();
      if (this.refCounts.size === 0) this.setStatus("idle");
      else this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    const offline = typeof navigator !== "undefined" && navigator.onLine === false;
    if (offline || this.attempt >= this.maxReconnectAttempts) {
      // Wait for the `online` event or a manual retry.
      this.setStatus("disconnected");
      return;
    }
    this.setStatus("reconnecting");
    const delay = computeBackoffDelay(this.attempt);
    this.attempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private scheduleIdleClose() {
    this.clearIdleTimer();
    this.idleTimer = setTimeout(() => {
      this.idleTimer = null;
      if (this.refCounts.size > 0) return;
      this.closeSocket();
      this.clearReconnectTimer();
      this.removeNetworkListeners();
      this.attempt = 0;
      this.setStatus("idle");
    }, this.idleCloseMs);
  }

  /** Detach handlers first so an intentional close never triggers a reconnect. */
  private closeSocket() {
    const socket = this.socket;
    this.socket = null;
    this.stopWatchdog();
    if (!socket) return;
    socket.onopen = socket.onmessage = socket.onclose = socket.onerror = null;
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) socket.close();
  }

  private startWatchdog() {
    this.stopWatchdog();
    this.watchdog = setInterval(() => {
      if (Date.now() - this.lastMessageAt > this.staleAfterMs) this.socket?.close();
    }, this.staleAfterMs / 2);
  }

  private stopWatchdog() {
    if (this.watchdog) clearInterval(this.watchdog);
    this.watchdog = null;
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private clearIdleTimer() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = null;
  }

  // ---- Network awareness ----

  private networkListenersAttached = false;

  private handleOnline = () => {
    if (this.status === "disconnected" || this.status === "reconnecting") this.retry();
  };

  private handleOffline = () => {
    this.closeSocket();
    this.clearReconnectTimer();
    if (this.refCounts.size > 0) this.setStatus("disconnected");
  };

  private addNetworkListeners() {
    if (this.networkListenersAttached || typeof window === "undefined") return;
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);
    this.networkListenersAttached = true;
  }

  private removeNetworkListeners() {
    if (!this.networkListenersAttached) return;
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
    this.networkListenersAttached = false;
  }

  // ---- Messaging ----

  private isOpen() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  private send(method: "SUBSCRIBE" | "UNSUBSCRIBE", symbols: string[]) {
    if (symbols.length === 0 || !this.isOpen()) return;
    this.socket?.send(JSON.stringify({ method, params: symbols.map(toStreamName), id: this.requestId++ }));
  }

  private handleMessage(data: unknown) {
    if (typeof data !== "string") return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(data);
    } catch {
      return;
    }
    const ticker = parseMiniTicker(parsed);
    if (!ticker || !this.refCounts.has(ticker.symbol)) return;

    this.tickers.set(ticker.symbol, ticker);
    this.tickerListeners.get(ticker.symbol)?.forEach((listener) => listener());
  }

  private setStatus(status: ConnectionStatus) {
    if (this.status === status) return;
    this.status = status;
    this.statusListeners.forEach((listener) => listener());
  }
}

let instance: PriceStream | null = null;

/** Browser-only singleton. */
export function getPriceStream(): PriceStream {
  instance ??= new PriceStream({
    url: process.env.NEXT_PUBLIC_BINANCE_WS_URL ?? "wss://data-stream.binance.vision/ws",
  });
  return instance;
}
