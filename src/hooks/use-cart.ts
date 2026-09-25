"use client";

import { useMemo, useSyncExternalStore } from "react";
import { createPersistentStore } from "@/lib/store";

/* Cap ids are database ids, so anything non-numeric is a stale entry from an
   older version of the site and the whole list is discarded. */
const isIdList = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  value.every((item) => typeof item === "string" && /^\d+$/.test(item));

export const cartStore = createPersistentStore<string[]>("cc-cart", [], isIdList);

/** The caps marked for trade; persisted in localStorage. */
export function useCart() {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.get,
    cartStore.getServerSnapshot,
  );

  return useMemo(
    () => ({
      items,
      count: items.length,
      has: (id: string) => items.includes(id),
      toggle: (id: string) =>
        cartStore.set(
          items.includes(id) ? items.filter((x) => x !== id) : items.concat(id),
        ),
      remove: (id: string) => cartStore.set(items.filter((x) => x !== id)),
      clear: () => cartStore.set([]),
    }),
    [items],
  );
}
