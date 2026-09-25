"use client";

import { useCallback, useSyncExternalStore } from "react";
import { createPersistentStore } from "@/lib/store";
import type { StyleId } from "@/lib/types";
import { defaultStyle, styleIds } from "@/data/styles";

const isStyle = (value: unknown): value is StyleId =>
  typeof value === "string" && (styleIds as readonly string[]).includes(value);

export const styleStore = createPersistentStore<StyleId>(
  "cc-style",
  defaultStyle,
  isStyle,
);

/** The active style (01/02/03); also mirrored onto <html data-style>. */
export function useStyle() {
  const style = useSyncExternalStore(
    styleStore.subscribe,
    styleStore.get,
    styleStore.getServerSnapshot,
  );

  const setStyle = useCallback((next: StyleId) => {
    document.documentElement.dataset.style = next;
    styleStore.set(next);
  }, []);

  return { style, setStyle };
}
