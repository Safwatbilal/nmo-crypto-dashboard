import { beforeEach, describe, expect, it, vi } from "vitest";
import { liveSymbolToggled, selectCanAddLiveSymbol, selectLiveSymbols } from "@/store/features/liveSlice";
import {
  MAX_WATCHLIST_SIZE,
  selectIsInWatchlist,
  selectIsWatchlistHydrated,
  selectWatchlistIds,
  watchlistHydrated,
  watchlistRemoved,
  watchlistToggled,
} from "@/store/features/watchlistSlice";
import { STORAGE_KEYS, hydrateFromStorage, loadLiveSymbols, loadWatchlist } from "@/store/persistence";
import { makeStore } from "@/store/store";

function installLocalStorage() {
  const data = new Map<string, string>();
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: vi.fn((key: string, value: string) => void data.set(key, value)),
    removeItem: (key: string) => void data.delete(key),
  };
  vi.stubGlobal("window", { localStorage: storage });
  return storage;
}

describe("watchlist slice", () => {
  beforeEach(() => {
    installLocalStorage();
  });

  it("starts empty and un-hydrated (identical on server and client)", () => {
    const state = makeStore().getState();
    expect(selectWatchlistIds(state)).toEqual([]);
    expect(selectIsWatchlistHydrated(state)).toBe(false);
  });

  it("toggles ids, newest first", () => {
    const store = makeStore();
    store.dispatch(watchlistToggled("bitcoin"));
    store.dispatch(watchlistToggled("solana"));
    expect(selectWatchlistIds(store.getState())).toEqual(["solana", "bitcoin"]);
    expect(selectIsInWatchlist(store.getState(), "bitcoin")).toBe(true);
    store.dispatch(watchlistToggled("bitcoin"));
    expect(selectIsInWatchlist(store.getState(), "bitcoin")).toBe(false);
  });

  it("enforces the size limit", () => {
    const store = makeStore();
    store.dispatch(watchlistHydrated(Array.from({ length: MAX_WATCHLIST_SIZE }, (_, i) => `coin-${i}`)));
    store.dispatch(watchlistToggled("one-too-many"));
    expect(selectWatchlistIds(store.getState())).toHaveLength(MAX_WATCHLIST_SIZE);
    expect(selectIsInWatchlist(store.getState(), "one-too-many")).toBe(false);
  });
});

describe("persistence", () => {
  it("writes user changes but not hydration to storage", () => {
    const storage = installLocalStorage();
    const store = makeStore();
    store.dispatch(watchlistHydrated(["bitcoin"]));
    expect(storage.setItem).not.toHaveBeenCalled();

    store.dispatch(watchlistToggled("ethereum"));
    store.dispatch(watchlistRemoved("bitcoin"));
    expect(JSON.parse(storage.getItem(STORAGE_KEYS.watchlist) ?? "")).toEqual(["ethereum"]);
  });

  it("rehydrates validated data and ignores corrupted values", () => {
    const storage = installLocalStorage();
    storage.setItem(STORAGE_KEYS.watchlist, JSON.stringify(["bitcoin", "bitcoin", 42, "<script>", "solana"]));
    storage.setItem(STORAGE_KEYS.live, JSON.stringify(["ETHUSDT", "FAKEUSDT"]));
    expect(loadWatchlist()).toEqual(["bitcoin", "solana"]);
    expect(loadLiveSymbols()).toEqual(["ETHUSDT"]);

    const store = makeStore();
    hydrateFromStorage(store.dispatch);
    expect(selectIsWatchlistHydrated(store.getState())).toBe(true);
    expect(selectLiveSymbols(store.getState())).toEqual(["ETHUSDT"]);

    storage.setItem(STORAGE_KEYS.watchlist, "{not json");
    expect(loadWatchlist()).toEqual([]);
  });

  it("keeps default live symbols when nothing is stored, and persists toggles", () => {
    const storage = installLocalStorage();
    const store = makeStore();
    hydrateFromStorage(store.dispatch);
    expect(selectLiveSymbols(store.getState())).toEqual(["BTCUSDT", "ETHUSDT", "SOLUSDT"]);

    store.dispatch(liveSymbolToggled("BTCUSDT"));
    expect(JSON.parse(storage.getItem(STORAGE_KEYS.live) ?? "")).toEqual(["ETHUSDT", "SOLUSDT"]);
    expect(selectCanAddLiveSymbol(store.getState())).toBe(true);
  });
});
