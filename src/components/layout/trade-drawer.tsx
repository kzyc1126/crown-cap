"use client";

import Link from "next/link";
import { CapDisc } from "@/components/caps/cap-disc";
import { IconButton } from "@/components/ui";
import { useCart } from "@/hooks/use-cart";
import { formatYear } from "@/lib/format";
import type { Cap } from "@/lib/types";

/** Right-hand panel listing the caps marked for trade. */
export function TradeDrawer({
  open,
  onClose,
  caps,
}: {
  open: boolean;
  onClose: () => void;
  caps: Cap[];
}) {
  const cart = useCart();
  const marked = cart.items
    .map((id) => caps.find((cap) => String(cap.id) === id))
    .filter((cap) => cap !== undefined);

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-60"
        style={{ background: "color-mix(in srgb, var(--fg) 45%, transparent)" }}
      />
      <aside
        role="dialog"
        aria-label="Marked for trade"
        className="fixed inset-y-0 right-0 z-61 flex w-[min(390px,90vw)] flex-col border-l border-line bg-bg"
      >
        <div className="flex items-center gap-3.5 border-b border-line p-5">
          <h3 className="text-2xl">Marked for trade</h3>
          <span className="ovr" style={{ color: "var(--accent-strong)" }}>
            {cart.count}
          </span>
          <IconButton label="Close" onClick={onClose} className="ml-auto" />
        </div>

        <div className="flex-1 overflow-auto px-5 py-1.5">
          {marked.length === 0 ? (
            <p className="dim py-4 text-[15px] leading-relaxed">
              Nothing marked yet. Open any cap in the collection and hit “Add for
              trade”.
            </p>
          ) : (
            marked.map((cap) => (
              <div
                key={cap.id}
                className="flex items-center gap-3.5 border-b border-line py-3.5"
              >
                <CapDisc cap={cap} size={46} />
                <div className="min-w-0 flex-1">
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>
                    {cap.name}
                  </div>
                  <div className="ovr dimmer" style={{ fontSize: 10 }}>
                    {cap.country} · {formatYear(cap.year)}
                  </div>
                </div>
                <IconButton
                  label={`Remove ${cap.name}`}
                  onClick={() => cart.remove(String(cap.id))}
                  size={30}
                />
              </div>
            ))
          )}
        </div>

        <div className="border-t border-line p-5">
          <Link
            href="/trade"
            onClick={onClose}
            className="btn solid w-full"
            aria-disabled={cart.count === 0}
            style={
              cart.count === 0 ? { opacity: 0.45, pointerEvents: "none" } : undefined
            }
          >
            Continue to trade form
          </Link>
        </div>
      </aside>
    </>
  );
}
