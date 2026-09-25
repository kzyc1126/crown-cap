type Listener = () => void;

/**
 * A small localStorage-backed store read through useSyncExternalStore.
 * The server snapshot is always `fallback`, so hydration never mismatches.
 */
export function createPersistentStore<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T,
) {
  let value = fallback;
  let hydrated = false;
  const listeners = new Set<Listener>();

  function read() {
    if (hydrated || typeof window === "undefined") return value;
    hydrated = true;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isValid(parsed)) value = parsed;
      }
    } catch {
      /* storage can be blocked — keep the fallback */
    }
    return value;
  }

  return {
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    get: read,
    getServerSnapshot: () => fallback,
    set(next: T) {
      hydrated = true;
      value = next;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      listeners.forEach((listener) => listener());
    },
  };
}
