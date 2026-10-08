import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { isSupportedLiveSymbol } from "@/lib/live/symbols";
import {
  liveSymbolToggled,
  liveSymbolsHydrated,
  selectLiveSymbols,
} from "./features/liveSlice";
import {
  selectWatchlistIds,
  watchlistCleared,
  watchlistHydrated,
  watchlistRemoved,
  watchlistToggled,
} from "./features/watchlistSlice";
import type { AppDispatch, RootState } from "./store";

/**
 * localStorage persistence. Versioned keys + validation on read, so a
 * corrupted or outdated value degrades to defaults instead of crashing.
 */
export const STORAGE_KEYS = {
  watchlist: "coinpulse:watchlist:v1",
  live: "coinpulse:live-symbols:v1",
} as const;

const COIN_ID = /^[a-z0-9-]{1,100}$/;

function readArray(key: string): unknown[] | null {
  try {
    const raw = window.localStorage.getItem(key);
    const value: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked (private mode): keep working in memory.
  }
}

export function loadWatchlist(): string[] {
  const ids = readArray(STORAGE_KEYS.watchlist) ?? [];
  return [...new Set(ids.filter((id): id is string => typeof id === "string" && COIN_ID.test(id)))];
}

/** `null` means "nothing stored" → keep the default symbols. */
export function loadLiveSymbols(): string[] | null {
  const symbols = readArray(STORAGE_KEYS.live);
  if (!symbols) return null;
  return [...new Set(symbols.filter((s): s is string => typeof s === "string" && isSupportedLiveSymbol(s)))];
}

/** Rehydrates persisted slices. Safe to call repeatedly (e.g. on `storage` events). */
export function hydrateFromStorage(dispatch: AppDispatch) {
  dispatch(watchlistHydrated(loadWatchlist()));
  const live = loadLiveSymbols();
  if (live) dispatch(liveSymbolsHydrated(live));
}

export const persistenceMiddleware = createListenerMiddleware();

const startListening = persistenceMiddleware.startListening.withTypes<RootState, AppDispatch>();

// Hydration actions are intentionally excluded: they come *from* storage.
startListening({
  matcher: isAnyOf(watchlistToggled, watchlistRemoved, watchlistCleared),
  effect: (_action, api) => write(STORAGE_KEYS.watchlist, selectWatchlistIds(api.getState())),
});

startListening({
  actionCreator: liveSymbolToggled,
  effect: (_action, api) => write(STORAGE_KEYS.live, selectLiveSymbols(api.getState())),
});
