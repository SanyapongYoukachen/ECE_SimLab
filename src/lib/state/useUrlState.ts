'use client';

import {
  useCallback,
  useMemo,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
} from 'react';

type Listener = () => void;

/**
 * A tiny external store backed by `window.location.search`. Reads are
 * cached against the raw search string so `getSnapshot` returns a stable
 * reference between calls (required by `useSyncExternalStore` to avoid
 * re-render loops) and only recomputes when the URL actually changes.
 * Writes merge into the existing query string rather than replacing it,
 * so unrelated params (e.g. the instructor's `predict=off` flag) survive.
 */
function createUrlStore<T>(
  decode: (params: URLSearchParams) => T,
  encode: (state: T) => URLSearchParams,
  defaultState: T
) {
  const listeners = new Set<Listener>();
  let cachedSearch: string | null = null;
  let cachedSnapshot: T = defaultState;

  function getSnapshot(): T {
    const search = window.location.search;
    if (search !== cachedSearch) {
      cachedSearch = search;
      cachedSnapshot = decode(new URLSearchParams(search));
    }
    return cachedSnapshot;
  }

  function getServerSnapshot(): T {
    return defaultState;
  }

  function subscribe(callback: Listener): () => void {
    listeners.add(callback);
    window.addEventListener('popstate', callback);
    return () => {
      listeners.delete(callback);
      window.removeEventListener('popstate', callback);
    };
  }

  function setState(updater: SetStateAction<T>): void {
    const prev = getSnapshot();
    const next = typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater;
    const current = new URLSearchParams(window.location.search);
    encode(next).forEach((value, key) => current.set(key, value));
    window.history.replaceState(null, '', `${window.location.pathname}?${current.toString()}`);
    listeners.forEach((l) => l());
  }

  return { getSnapshot, getServerSnapshot, subscribe, setState };
}

/**
 * Mirrors a piece of state into the URL query string. Reads hydrate from
 * the real URL on the client via `useSyncExternalStore` (no post-mount
 * "correction" render pass, no hydration-mismatch risk); writes merge into
 * the existing query string via `history.replaceState`. `decode`/`encode`
 * must be stable module-level functions (e.g. from `urlState.ts`).
 */
export function useUrlSyncedState<T>(
  decode: (params: URLSearchParams) => T,
  encode: (state: T) => URLSearchParams,
  defaultState: T
): [T, Dispatch<SetStateAction<T>>] {
  // decode/encode/defaultState are documented as stable module-level
  // references, so this recreates the store only if the caller ever passes
  // different ones — in practice, once per component instance.
  const store = useMemo(
    () => createUrlStore(decode, encode, defaultState),
    [decode, encode, defaultState]
  );

  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const setState = useCallback((updater: SetStateAction<T>) => store.setState(updater), [store]);

  return [state, setState];
}

/** Reads a boolean/enum flag from the URL (e.g. the instructor `predict=off` flag). */
export function useUrlFlag<T>(decode: (params: URLSearchParams) => T, defaultValue: T): T {
  const noopSubscribe = useMemo(() => () => () => {}, []);
  return useSyncExternalStore(
    noopSubscribe,
    () => decode(new URLSearchParams(window.location.search)),
    () => defaultValue
  );
}
