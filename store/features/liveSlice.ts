import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_LIVE_SYMBOLS, MAX_LIVE_SYMBOLS } from "@/lib/live/symbols";

/**
 * Which symbols the user follows in the live widget. Shared between the
 * home widget and the asset page's "Follow live" toggle, and persisted.
 * Tick data itself deliberately stays out of Redux (see lib/live/price-stream).
 */
export interface LiveState {
  symbols: string[];
}

const initialState: LiveState = { symbols: DEFAULT_LIVE_SYMBOLS };

const liveSlice = createSlice({
  name: "live",
  initialState,
  reducers: {
    liveSymbolsHydrated(state, action: PayloadAction<string[]>) {
      state.symbols = action.payload.slice(0, MAX_LIVE_SYMBOLS);
    },
    liveSymbolToggled(state, action: PayloadAction<string>) {
      const symbol = action.payload;
      const index = state.symbols.indexOf(symbol);
      if (index >= 0) state.symbols.splice(index, 1);
      else if (state.symbols.length < MAX_LIVE_SYMBOLS) state.symbols.push(symbol);
    },
  },
  selectors: {
    selectLiveSymbols: (state) => state.symbols,
    selectIsLiveSymbol: (state, symbol: string) => state.symbols.includes(symbol),
    selectCanAddLiveSymbol: (state) => state.symbols.length < MAX_LIVE_SYMBOLS,
  },
});

export const { liveSymbolsHydrated, liveSymbolToggled } = liveSlice.actions;
export const { selectLiveSymbols, selectIsLiveSymbol, selectCanAddLiveSymbol } = liveSlice.selectors;
export default liveSlice;
