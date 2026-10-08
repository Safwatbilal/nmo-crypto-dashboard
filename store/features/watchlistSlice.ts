import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export const MAX_WATCHLIST_SIZE = 50;

export interface WatchlistState {
  /** CoinGecko ids, most recently added first. Prices are NOT stored here. */
  ids: string[];
  /** False until persisted state has been read on the client. */
  hydrated: boolean;
}

const initialState: WatchlistState = { ids: [], hydrated: false };

const watchlistSlice = createSlice({
  name: "watchlist",
  initialState,
  reducers: {
    watchlistHydrated(state, action: PayloadAction<string[]>) {
      state.ids = action.payload.slice(0, MAX_WATCHLIST_SIZE);
      state.hydrated = true;
    },
    watchlistToggled(state, action: PayloadAction<string>) {
      const id = action.payload;
      const index = state.ids.indexOf(id);
      if (index >= 0) state.ids.splice(index, 1);
      else if (state.ids.length < MAX_WATCHLIST_SIZE) state.ids.unshift(id);
    },
    watchlistRemoved(state, action: PayloadAction<string>) {
      state.ids = state.ids.filter((id) => id !== action.payload);
    },
    watchlistCleared(state) {
      state.ids = [];
    },
  },
  selectors: {
    selectWatchlistIds: (state) => state.ids,
    selectWatchlistCount: (state) => state.ids.length,
    selectIsWatchlistHydrated: (state) => state.hydrated,
    /** Returns a primitive, so no memoisation is needed for stable renders. */
    selectIsInWatchlist: (state, id: string) => state.ids.includes(id),
  },
});

export const { watchlistHydrated, watchlistToggled, watchlistRemoved, watchlistCleared } =
  watchlistSlice.actions;
export const {
  selectWatchlistIds,
  selectWatchlistCount,
  selectIsWatchlistHydrated,
  selectIsInWatchlist,
} = watchlistSlice.selectors;
export default watchlistSlice;
