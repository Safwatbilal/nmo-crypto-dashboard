import { combineSlices, configureStore } from "@reduxjs/toolkit";
import liveSlice from "./features/liveSlice";
import watchlistSlice from "./features/watchlistSlice";
import { persistenceMiddleware } from "./persistence";

const rootReducer = combineSlices(watchlistSlice, liveSlice);

export type RootState = ReturnType<typeof rootReducer>;

/**
 * A factory (not a module singleton) so each server render gets its own store
 * and no user state can leak between requests.
 */
export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefault) => getDefault().prepend(persistenceMiddleware.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
