"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { STORAGE_KEYS, hydrateFromStorage } from "@/store/persistence";
import { makeStore } from "@/store/store";

const PERSISTED_KEYS = new Set<string>(Object.values(STORAGE_KEYS));

/**
 * Hydration-safe persistence: server and first client render both start from
 * the same empty/default state, then localStorage is applied *after* mount.
 * Components that depend on persisted data check `hydrated` to avoid flashing
 * a misleading empty state.
 *
 * `serverState` matters for streamed content: a Suspense boundary (e.g. the
 * market table) can hydrate *after* storage was loaded. Without it,
 * useSelector would hydrate against the live store, mismatching the server
 * HTML (React doesn't patch mismatched attributes such as `disabled`). With
 * it, hydration reads the initial snapshot and then re-renders with live state.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(makeStore);
  const [serverState] = useState(() => store.getState());

  useEffect(() => {
    hydrateFromStorage(store.dispatch);

    // Keep multiple open tabs in sync.
    const onStorage = (event: StorageEvent) => {
      if (event.key && PERSISTED_KEYS.has(event.key)) hydrateFromStorage(store.dispatch);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [store]);

  return (
    <Provider store={store} serverState={serverState}>
      {children}
    </Provider>
  );
}
