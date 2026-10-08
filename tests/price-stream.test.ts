import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PriceStream, computeBackoffDelay, parseMiniTicker } from "@/lib/live/price-stream";

class FakeSocket {
  static instances: FakeSocket[] = [];
  readyState: number = WebSocket.CONNECTING;
  sent: { method: string; params: string[] }[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  closed = false;

  constructor(readonly url: string) {
    FakeSocket.instances.push(this);
  }
  send(payload: string) {
    this.sent.push(JSON.parse(payload));
  }
  close() {
    this.closed = true;
    this.readyState = WebSocket.CLOSED;
  }
  // Test helpers
  open() {
    this.readyState = WebSocket.OPEN;
    this.onopen?.();
  }
  drop() {
    this.readyState = WebSocket.CLOSED;
    this.onclose?.();
  }
  emit(symbol: string, price: string, open = "100") {
    this.onmessage?.({ data: JSON.stringify({ e: "24hrMiniTicker", E: Date.now(), s: symbol, c: price, o: open, h: "0", l: "0" }) });
  }
}

const latest = () => FakeSocket.instances[FakeSocket.instances.length - 1];

function createStream() {
  return new PriceStream({
    url: "wss://test",
    idleCloseMs: 1_000,
    maxReconnectAttempts: 2,
    createSocket: (url) => new FakeSocket(url) as unknown as WebSocket,
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  FakeSocket.instances = [];
});

afterEach(() => {
  vi.useRealTimers();
});

describe("computeBackoffDelay", () => {
  it("grows exponentially, with jitter, up to a cap", () => {
    expect(computeBackoffDelay(0, () => 0)).toBe(500);
    expect(computeBackoffDelay(0, () => 1)).toBe(1000);
    expect(computeBackoffDelay(3, () => 1)).toBe(8000);
    expect(computeBackoffDelay(20, () => 1)).toBe(30_000);
  });
});

describe("parseMiniTicker", () => {
  it("parses valid payloads and computes 24h change", () => {
    expect(parseMiniTicker({ e: "24hrMiniTicker", E: 1, s: "BTCUSDT", c: "110", o: "100", h: "120", l: "90" })).toMatchObject({
      symbol: "BTCUSDT",
      price: 110,
      change24h: 10,
    });
  });

  it("rejects unrelated or malformed messages", () => {
    expect(parseMiniTicker({ result: null, id: 1 })).toBeNull();
    expect(parseMiniTicker({ e: "24hrMiniTicker", s: "X", c: "abc", o: "1" })).toBeNull();
    expect(parseMiniTicker(null)).toBeNull();
  });
});

describe("PriceStream", () => {
  it("opens one socket and ref-counts symbol subscriptions", () => {
    const stream = createStream();
    const offA = stream.subscribe("BTCUSDT", () => {});
    const offB = stream.subscribe("BTCUSDT", () => {});
    expect(FakeSocket.instances).toHaveLength(1);
    expect(stream.getStatus()).toBe("connecting");

    latest().open();
    expect(stream.getStatus()).toBe("connected");
    expect(latest().sent).toEqual([expect.objectContaining({ method: "SUBSCRIBE", params: ["btcusdt@miniTicker"] })]);

    stream.subscribe("ETHUSDT", () => {});
    expect(latest().sent.at(-1)).toMatchObject({ method: "SUBSCRIBE", params: ["ethusdt@miniTicker"] });

    offA();
    expect(latest().sent).toHaveLength(2); // still one BTC consumer
    offB();
    expect(latest().sent.at(-1)).toMatchObject({ method: "UNSUBSCRIBE", params: ["btcusdt@miniTicker"] });
  });

  it("notifies only the listeners of the symbol that ticked", () => {
    const stream = createStream();
    const btc = vi.fn();
    const eth = vi.fn();
    stream.subscribe("BTCUSDT", btc);
    stream.subscribe("ETHUSDT", eth);
    latest().open();

    latest().emit("BTCUSDT", "101");
    expect(btc).toHaveBeenCalledTimes(1);
    expect(eth).not.toHaveBeenCalled();
    expect(stream.getTicker("BTCUSDT")?.price).toBe(101);
  });

  it("closes the socket after the idle grace period once unused", () => {
    const stream = createStream();
    const off = stream.subscribe("BTCUSDT", () => {});
    latest().open();
    off();
    vi.advanceTimersByTime(999);
    expect(latest().closed).toBe(false);
    vi.advanceTimersByTime(1);
    expect(latest().closed).toBe(true);
    expect(stream.getStatus()).toBe("idle");
  });

  it("cancels the idle close if a consumer comes back (e.g. route change)", () => {
    const stream = createStream();
    const off = stream.subscribe("BTCUSDT", () => {});
    latest().open();
    off();
    stream.subscribe("BTCUSDT", () => {});
    vi.advanceTimersByTime(5_000);
    expect(FakeSocket.instances).toHaveLength(1);
    expect(latest().closed).toBe(false);
  });

  it("reconnects with backoff, resubscribes, then gives up after max attempts", () => {
    const stream = createStream();
    stream.subscribe("BTCUSDT", () => {});
    latest().open();

    latest().drop();
    expect(stream.getStatus()).toBe("reconnecting");
    vi.advanceTimersByTime(1_000);
    expect(FakeSocket.instances).toHaveLength(2);

    latest().open();
    expect(stream.getStatus()).toBe("connected");
    expect(latest().sent[0]).toMatchObject({ method: "SUBSCRIBE", params: ["btcusdt@miniTicker"] });

    // Two failed attempts in a row exhaust the budget.
    latest().drop();
    vi.advanceTimersByTime(1_000);
    latest().drop();
    vi.advanceTimersByTime(2_000);
    latest().drop();
    expect(stream.getStatus()).toBe("disconnected");

    stream.retry();
    expect(stream.getStatus()).toBe("connecting");
  });

  it("recycles a connection that stops delivering messages", () => {
    const stream = createStream();
    stream.subscribe("BTCUSDT", () => {});
    const first = latest();
    first.open();
    vi.advanceTimersByTime(19_000);
    expect(first.closed).toBe(false);
    // Checked every staleAfter/2 (10s): detected on the 30s check.
    vi.advanceTimersByTime(11_000);
    expect(first.closed).toBe(true);
  });
});
