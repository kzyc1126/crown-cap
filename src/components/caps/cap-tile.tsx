"use client";

import Link from "next/link";
import { CapDisc } from "@/components/caps/cap-disc";
import { TradeButton } from "@/components/caps/trade-button";
import { useCart } from "@/hooks/use-cart";
import { isTradable } from "@/lib/caps";
import { formatYear } from "@/lib/format";
import type { Cap } from "@/lib/types";

/** One cap tile inside the collection or wishlist grid. */
export function CapTile({
  cap,
  from,
  showTrade = true,
}: {
  cap: Cap;
  /** the page this was opened from, used by the back link on the detail page */
  from?: "collection" | "wishlist";
  showTrade?: boolean;
}) {
  const cart = useCart();
  const marked = cart.has(String(cap.id));

  return (
    <div className="tile relative" data-marked={marked}>
      <Link
        href={from ? `/caps/${cap.id}?from=${from}` : `/caps/${cap.id}`}
        className="flex flex-col items-center gap-3.5 text-fg hover:text-fg"
      >
        <CapDisc cap={cap} />
        <div className="text-center">
          <div className="ovr dimmer" style={{ fontSize: 10 }}>
            {cap.ref}
          </div>
          <div
            className="mt-1.5"
            style={{ fontFamily: "var(--font-display)", fontSize: 21 }}
          >
            {cap.name}
          </div>
          <div className="dim text-[13px]">
            {cap.country} · {formatYear(cap.year)}
          </div>
        </div>
      </Link>

      {/* Wanted, tradable, or an only copy — exactly one of the three. */}
      {cap.wish ? (
        <span
          className="ovr mt-auto px-3.5 py-2"
          style={{
            border: "1px dashed var(--accent-mid)",
            color: "var(--accent-strong)",
          }}
        >
          Wanted
        </span>
      ) : !isTradable(cap) ? (
        <span
          className="ovr dimmer mt-auto w-full px-3.5 py-2 text-center"
          style={{ border: "1px solid var(--line)" }}
          title="Only one in the collection, so it stays in the album."
        >
          Only copy
        </span>
      ) : showTrade ? (
        <TradeButton
          capId={String(cap.id)}
          className="mt-auto w-full"
          style={{ padding: "10px 4px" }}
        />
      ) : null}
    </div>
  );
}
